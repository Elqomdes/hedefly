const express = require('express');
const { body, validationResult } = require('express-validator');
const AssignmentEvaluation = require('../models/AssignmentEvaluation');
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get evaluations for a teacher
router.get('/my-evaluations', auth, async (req, res) => {
  try {
    const { assignmentId, studentId, status, page = 1, limit = 10 } = req.query;
    const teacherId = req.user.id;

    const query = { teacher: teacherId };
    
    if (assignmentId) query.assignment = assignmentId;
    if (studentId) query.student = studentId;
    if (status) query.status = status;

    const evaluations = await AssignmentEvaluation.find(query)
      .populate('assignment', 'title description dueDate totalPoints')
      .populate('student', 'firstName lastName email grade school')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AssignmentEvaluation.countDocuments(query);

    res.json({
      success: true,
      data: {
        evaluations,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    console.error('Get evaluations error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Get evaluations for a student
router.get('/student-evaluations', auth, async (req, res) => {
  try {
    const { assignmentId, status, page = 1, limit = 10 } = req.query;
    const studentId = req.user.id;

    const query = { student: studentId };
    
    if (assignmentId) query.assignment = assignmentId;
    if (status) query.status = status;

    const evaluations = await AssignmentEvaluation.find(query)
      .populate('assignment', 'title description dueDate totalPoints')
      .populate('teacher', 'firstName lastName email')
      .populate('comments.author', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AssignmentEvaluation.countDocuments(query);

    res.json({
      success: true,
      data: {
        evaluations,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    console.error('Get student evaluations error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Get single evaluation
router.get('/:id', auth, async (req, res) => {
  try {
    const evaluation = await AssignmentEvaluation.findById(req.params.id)
      .populate('assignment', 'title description dueDate totalPoints criteria')
      .populate('student', 'firstName lastName email grade school')
      .populate('teacher', 'firstName lastName email')
      .populate('comments.author', 'firstName lastName')
      .populate('extensions.requestedBy', 'firstName lastName')
      .populate('extensions.approvedBy', 'firstName lastName');

    if (!evaluation) {
      return res.status(404).json({ success: false, message: 'Değerlendirme bulunamadı' });
    }

    // Check if user has access to this evaluation
    const isTeacher = evaluation.teacher._id.toString() === req.user.id;
    const isStudent = evaluation.student._id.toString() === req.user.id;

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ success: false, message: 'Bu değerlendirmeye erişim yetkiniz yok' });
    }

    res.json({ success: true, data: evaluation });
  } catch (error) {
    console.error('Get evaluation error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Submit assignment
router.post('/submit', [
  auth,
  body('assignmentId').isMongoId(),
  body('content').optional().trim(),
  body('attachments').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { assignmentId, content, attachments } = req.body;
    const studentId = req.user.id;

    // Check if assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Ödev bulunamadı' });
    }

    // Check if student is assigned to this assignment
    const isAssigned = assignment.assignedTo.some(student => 
      student.student.toString() === studentId
    );

    if (!isAssigned) {
      return res.status(403).json({ success: false, message: 'Bu ödeve erişim yetkiniz yok' });
    }

    // Check if already submitted
    const existingEvaluation = await AssignmentEvaluation.findOne({
      assignment: assignmentId,
      student: studentId
    });

    if (existingEvaluation && existingEvaluation.status !== 'resubmitted') {
      return res.status(400).json({ success: false, message: 'Bu ödev zaten teslim edilmiş' });
    }

    // Calculate if submission is late
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isLate = now > dueDate;
    const lateDays = isLate ? Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24)) : 0;

    const evaluation = new AssignmentEvaluation({
      assignment: assignmentId,
      student: studentId,
      teacher: assignment.teacher,
      submission: {
        content: content || '',
        attachments: attachments || [],
        isLate: isLate,
        lateDays: lateDays
      },
      dueDate: dueDate,
      status: isLate ? 'late' : 'submitted',
      isResubmission: !!existingEvaluation,
      originalEvaluation: existingEvaluation?._id,
      resubmissionCount: existingEvaluation ? existingEvaluation.resubmissionCount + 1 : 0
    });

    await evaluation.save();

    const populatedEvaluation = await AssignmentEvaluation.findById(evaluation._id)
      .populate('assignment', 'title description dueDate totalPoints')
      .populate('student', 'firstName lastName email grade school')
      .populate('teacher', 'firstName lastName email');

    res.status(201).json({ success: true, data: populatedEvaluation });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Evaluate assignment
router.put('/:id/evaluate', [
  auth,
  body('grade').isNumeric().isFloat({ min: 0, max: 100 }),
  body('criteria').isArray(),
  body('feedback').optional().trim(),
  body('strengths').optional().isArray(),
  body('improvements').optional().isArray(),
  body('suggestions').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { grade, criteria, feedback, strengths, improvements, suggestions } = req.body;

    const evaluation = await AssignmentEvaluation.findById(req.params.id);
    if (!evaluation) {
      return res.status(404).json({ success: false, message: 'Değerlendirme bulunamadı' });
    }

    // Check if user is the teacher
    if (evaluation.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bu ödevi değerlendirme yetkiniz yok' });
    }

    // Update evaluation
    evaluation.evaluation = {
      ...evaluation.evaluation,
      grade: grade,
      criteria: criteria,
      feedback: feedback || '',
      strengths: strengths || [],
      improvements: improvements || [],
      suggestions: suggestions || [],
      evaluatedAt: new Date(),
      evaluatedBy: req.user.id
    };

    evaluation.status = 'evaluated';
    await evaluation.save();

    const populatedEvaluation = await AssignmentEvaluation.findById(evaluation._id)
      .populate('assignment', 'title description dueDate totalPoints')
      .populate('student', 'firstName lastName email grade school')
      .populate('teacher', 'firstName lastName email');

    res.json({ success: true, data: populatedEvaluation });
  } catch (error) {
    console.error('Evaluate assignment error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Return evaluation to student
router.put('/:id/return', auth, async (req, res) => {
  try {
    const evaluation = await AssignmentEvaluation.findById(req.params.id);
    if (!evaluation) {
      return res.status(404).json({ success: false, message: 'Değerlendirme bulunamadı' });
    }

    // Check if user is the teacher
    if (evaluation.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bu değerlendirmeyi döndürme yetkiniz yok' });
    }

    evaluation.status = 'returned';
    await evaluation.save();

    res.json({ success: true, message: 'Değerlendirme öğrenciye döndürüldü' });
  } catch (error) {
    console.error('Return evaluation error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Add comment to evaluation
router.post('/:id/comments', [
  auth,
  body('content').notEmpty().trim(),
  body('isPrivate').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, isPrivate } = req.body;

    const evaluation = await AssignmentEvaluation.findById(req.params.id);
    if (!evaluation) {
      return res.status(404).json({ success: false, message: 'Değerlendirme bulunamadı' });
    }

    // Check if user has access
    const isTeacher = evaluation.teacher.toString() === req.user.id;
    const isStudent = evaluation.student.toString() === req.user.id;

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ success: false, message: 'Bu değerlendirmeye erişim yetkiniz yok' });
    }

    evaluation.comments.push({
      author: req.user.id,
      content,
      isPrivate: isPrivate || false
    });

    await evaluation.save();

    const populatedEvaluation = await AssignmentEvaluation.findById(evaluation._id)
      .populate('comments.author', 'firstName lastName');

    res.json({ success: true, data: populatedEvaluation });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Request extension
router.post('/:id/request-extension', [
  auth,
  body('newDueDate').isISO8601(),
  body('reason').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { newDueDate, reason } = req.body;

    const evaluation = await AssignmentEvaluation.findById(req.params.id);
    if (!evaluation) {
      return res.status(404).json({ success: false, message: 'Değerlendirme bulunamadı' });
    }

    // Check if user is the student
    if (evaluation.student.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bu ödev için uzatma talep etme yetkiniz yok' });
    }

    // Check if already has pending extension
    const pendingExtension = evaluation.extensions.find(ext => ext.status === 'pending');
    if (pendingExtension) {
      return res.status(400).json({ success: false, message: 'Zaten bekleyen bir uzatma talebiniz var' });
    }

    evaluation.extensions.push({
      requestedBy: req.user.id,
      newDueDate: new Date(newDueDate),
      reason,
      status: 'pending'
    });

    await evaluation.save();

    res.json({ success: true, message: 'Uzatma talebi gönderildi' });
  } catch (error) {
    console.error('Request extension error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Approve/Reject extension
router.put('/:id/extensions/:extensionId', [
  auth,
  body('status').isIn(['approved', 'rejected'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { extensionId } = req.params;
    const { status } = req.body;

    const evaluation = await AssignmentEvaluation.findById(req.params.id);
    if (!evaluation) {
      return res.status(404).json({ success: false, message: 'Değerlendirme bulunamadı' });
    }

    // Check if user is the teacher
    if (evaluation.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Uzatma talebini işleme yetkiniz yok' });
    }

    const extension = evaluation.extensions.id(extensionId);
    if (!extension) {
      return res.status(404).json({ success: false, message: 'Uzatma talebi bulunamadı' });
    }

    extension.status = status;
    extension.approvedBy = req.user.id;
    extension.processedAt = new Date();

    if (status === 'approved') {
      evaluation.dueDate = extension.newDueDate;
    }

    await evaluation.save();

    res.json({ success: true, message: `Uzatma talebi ${status === 'approved' ? 'onaylandı' : 'reddedildi'}` });
  } catch (error) {
    console.error('Process extension error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Delete evaluation
router.delete('/:id', auth, async (req, res) => {
  try {
    const evaluation = await AssignmentEvaluation.findById(req.params.id);
    if (!evaluation) {
      return res.status(404).json({ success: false, message: 'Değerlendirme bulunamadı' });
    }

    // Check if user is the teacher
    if (evaluation.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bu değerlendirmeyi silme yetkiniz yok' });
    }

    await AssignmentEvaluation.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Değerlendirme silindi' });
  } catch (error) {
    console.error('Delete evaluation error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

module.exports = router;

