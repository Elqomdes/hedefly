const express = require('express');
const { body, validationResult } = require('express-validator');
const Plan = require('../models/Plan');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all plans for a teacher
router.get('/my-plans', auth, async (req, res) => {
  try {
    const { studentId, type, status, page = 1, limit = 10 } = req.query;
    const teacherId = req.user.id;

    const query = { teacher: teacherId };
    
    if (studentId) query.student = studentId;
    if (type) query.type = type;
    if (status) query.status = status;

    const plans = await Plan.find(query)
      .populate('student', 'firstName lastName email grade school')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Plan.countDocuments(query);

    res.json({
      success: true,
      data: {
        plans,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Get plans for a student
router.get('/student-plans', auth, async (req, res) => {
  try {
    const { type, status, page = 1, limit = 10 } = req.query;
    const studentId = req.user.id;

    const query = { student: studentId };
    
    if (type) query.type = type;
    if (status) query.status = status;

    const plans = await Plan.find(query)
      .populate('teacher', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Plan.countDocuments(query);

    res.json({
      success: true,
      data: {
        plans,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    console.error('Get student plans error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Get plan templates
router.get('/templates', auth, async (req, res) => {
  try {
    const { type } = req.query;
    const teacherId = req.user.id;

    const query = { 
      isTemplate: true,
      $or: [
        { teacher: teacherId },
        { teacher: null } // Public templates
      ]
    };
    
    if (type) query.type = type;

    const templates = await Plan.find(query)
      .populate('teacher', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: templates });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Get single plan
router.get('/:id', auth, async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id)
      .populate('teacher', 'firstName lastName email')
      .populate('student', 'firstName lastName email grade school');

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan bulunamadı' });
    }

    // Check if user has access to this plan
    const isTeacher = plan.teacher._id.toString() === req.user.id;
    const isStudent = plan.student._id.toString() === req.user.id;

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ success: false, message: 'Bu plana erişim yetkiniz yok' });
    }

    res.json({ success: true, data: plan });
  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Create new plan
router.post('/create', [
  auth,
  body('studentId').isMongoId(),
  body('type').isIn(['daily', 'weekly', 'monthly']),
  body('title').notEmpty().trim(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('subjects').isArray(),
  body('goals').isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      studentId,
      type,
      title,
      description,
      startDate,
      endDate,
      subjects,
      goals,
      tags,
      reminders,
      isTemplate,
      templateName
    } = req.body;

    const teacherId = req.user.id;

    // Check if student exists and belongs to teacher
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Öğrenci bulunamadı' });
    }

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ success: false, message: 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır' });
    }

    const plan = new Plan({
      teacher: teacherId,
      student: studentId,
      type,
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      subjects: subjects || [],
      goals: goals || [],
      tags: tags || [],
      reminders: reminders || [],
      isTemplate: isTemplate || false,
      templateName: templateName || null
    });

    await plan.save();

    const populatedPlan = await Plan.findById(plan._id)
      .populate('student', 'firstName lastName email grade school')
      .populate('teacher', 'firstName lastName email');

    res.status(201).json({ success: true, data: populatedPlan });
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Update plan
router.put('/:id', [
  auth,
  body('title').optional().notEmpty().trim(),
  body('type').optional().isIn(['daily', 'weekly', 'monthly']),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan bulunamadı' });
    }

    // Check if user is the teacher
    if (plan.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bu planı düzenleme yetkiniz yok' });
    }

    const updates = req.body;
    
    // Validate dates if provided
    if (updates.startDate && updates.endDate) {
      if (new Date(updates.startDate) >= new Date(updates.endDate)) {
        return res.status(400).json({ success: false, message: 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır' });
      }
    }

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        plan[key] = updates[key];
      }
    });

    await plan.save();

    const populatedPlan = await Plan.findById(plan._id)
      .populate('student', 'firstName lastName email grade school')
      .populate('teacher', 'firstName lastName email');

    res.json({ success: true, data: populatedPlan });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Update topic completion
router.put('/:id/topics/:subjectIndex/:topicIndex', [
  auth,
  body('completed').isBoolean(),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id, subjectIndex, topicIndex } = req.params;
    const { completed, notes } = req.body;

    const plan = await Plan.findById(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan bulunamadı' });
    }

    // Check if user has access
    const isTeacher = plan.teacher.toString() === req.user.id;
    const isStudent = plan.student.toString() === req.user.id;

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ success: false, message: 'Bu plana erişim yetkiniz yok' });
    }

    const subjectIdx = parseInt(subjectIndex);
    const topicIdx = parseInt(topicIndex);

    if (subjectIdx >= plan.subjects.length || topicIdx >= plan.subjects[subjectIdx].topics.length) {
      return res.status(400).json({ success: false, message: 'Geçersiz konu veya başlık indeksi' });
    }

    const topic = plan.subjects[subjectIdx].topics[topicIdx];
    topic.completed = completed;
    if (completed) {
      topic.completedAt = new Date();
    } else {
      topic.completedAt = undefined;
    }
    if (notes !== undefined) {
      topic.notes = notes;
    }

    await plan.save();

    res.json({ success: true, data: plan });
  } catch (error) {
    console.error('Update topic error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Update goal completion
router.put('/:id/goals/:goalIndex', [
  auth,
  body('completed').isBoolean(),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id, goalIndex } = req.params;
    const { completed, notes } = req.body;

    const plan = await Plan.findById(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan bulunamadı' });
    }

    // Check if user has access
    const isTeacher = plan.teacher.toString() === req.user.id;
    const isStudent = plan.student.toString() === req.user.id;

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ success: false, message: 'Bu plana erişim yetkiniz yok' });
    }

    const goalIdx = parseInt(goalIndex);

    if (goalIdx >= plan.goals.length) {
      return res.status(400).json({ success: false, message: 'Geçersiz hedef indeksi' });
    }

    const goal = plan.goals[goalIdx];
    goal.completed = completed;
    if (completed) {
      goal.completedAt = new Date();
    } else {
      goal.completedAt = undefined;
    }
    if (notes !== undefined) {
      goal.notes = notes;
    }

    await plan.save();

    res.json({ success: true, data: plan });
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Delete plan
router.delete('/:id', auth, async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan bulunamadı' });
    }

    // Check if user is the teacher
    if (plan.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bu planı silme yetkiniz yok' });
    }

    await Plan.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Plan silindi' });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Duplicate plan as template
router.post('/:id/duplicate', [
  auth,
  body('templateName').optional().trim()
], async (req, res) => {
  try {
    const { templateName } = req.body;
    const originalPlan = await Plan.findById(req.params.id);
    
    if (!originalPlan) {
      return res.status(404).json({ success: false, message: 'Plan bulunamadı' });
    }

    // Check if user is the teacher
    if (originalPlan.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bu planı kopyalama yetkiniz yok' });
    }

    const duplicatedPlan = new Plan({
      ...originalPlan.toObject(),
      _id: undefined,
      teacher: req.user.id,
      student: null, // Template doesn't have a specific student
      isTemplate: true,
      templateName: templateName || `${originalPlan.title} (Kopya)`,
      status: 'draft',
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Reset completion status for all topics and goals
    duplicatedPlan.subjects.forEach(subject => {
      subject.topics.forEach(topic => {
        topic.completed = false;
        topic.completedAt = undefined;
        topic.notes = '';
      });
    });

    duplicatedPlan.goals.forEach(goal => {
      goal.completed = false;
      goal.completedAt = undefined;
    });

    await duplicatedPlan.save();

    res.status(201).json({ success: true, data: duplicatedPlan });
  } catch (error) {
    console.error('Duplicate plan error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

module.exports = router;

