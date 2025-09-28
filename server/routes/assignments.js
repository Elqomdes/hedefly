const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const Class = require('../models/Class');
const { teacherAuth, auth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/assignments';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|txt|jpg|jpeg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Sadece PDF, DOC, DOCX, TXT, JPG, JPEG, PNG, GIF dosyaları yüklenebilir'));
    }
  }
});

// Create assignment
router.post('/', teacherAuth, upload.array('attachments', 5), [
  body('title').notEmpty().trim(),
  body('subject').notEmpty().trim(),
  body('dueDate').isISO8601(),
  body('type').isIn(['individual', 'class'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, subject, dueDate, type, classId, studentIds, videoLinks } = req.body;

    // Prepare assignment data
    const assignmentData = {
      title,
      description: description || '',
      teacher: req.user._id,
      subject,
      dueDate: new Date(dueDate),
      type
    };

    // Handle attachments
    if (req.files && req.files.length > 0) {
      assignmentData.attachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        type: file.mimetype,
        size: file.size
      }));
    }

    // Handle video links
    if (videoLinks) {
      try {
        assignmentData.videoLinks = JSON.parse(videoLinks);
      } catch (e) {
        return res.status(400).json({ message: 'Geçersiz video link formatı' });
      }
    }

    // Handle students
    if (type === 'class' && classId) {
      const classObj = await Class.findById(classId);
      if (!classObj) {
        return res.status(404).json({ message: 'Sınıf bulunamadı.' });
      }
      
      // Check if teacher has access to this class
      if (classObj.teacher.toString() !== req.user._id.toString() && 
          !classObj.collaboratingTeachers.includes(req.user._id)) {
        return res.status(403).json({ message: 'Bu sınıfa erişim yetkiniz yok.' });
      }

      assignmentData.class = classId;
      assignmentData.students = classObj.students;
    } else if (type === 'individual' && studentIds) {
      try {
        const studentIdArray = JSON.parse(studentIds);
        assignmentData.students = studentIdArray;
      } catch (e) {
        return res.status(400).json({ message: 'Geçersiz öğrenci ID formatı' });
      }
    }

    const assignment = new Assignment(assignmentData);
    await assignment.save();

    // Add assignment to class if applicable
    if (type === 'class' && classId) {
      await Class.findByIdAndUpdate(classId, {
        $push: { assignments: assignment._id }
      });
    }

    res.status(201).json({
      message: 'Ödev başarıyla oluşturuldu',
      assignment
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Get assignments for teacher
router.get('/', teacherAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, subject, type, status } = req.query;
    
    const query = {
      teacher: req.user._id,
      isActive: true
    };

    if (subject) query.subject = subject;
    if (type) query.type = type;
    if (status === 'graded') {
      query['submissions.isGraded'] = true;
    } else if (status === 'ungraded') {
      query['submissions.isGraded'] = { $ne: true };
    }

    const assignments = await Assignment.find(query)
      .populate('students', 'firstName lastName studentId email')
      .populate('class', 'name subject')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Assignment.countDocuments(query);

    res.json({
      assignments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Get all assignments (for dashboard)
router.get('/all', teacherAuth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const assignments = await Assignment.find({
      teacher: req.user._id,
      isActive: true
    })
      .populate('students', 'firstName lastName studentId email')
      .populate('class', 'name subject')
      .sort({ createdAt: -1 })
      .limit(limit * 1);

    const total = await Assignment.countDocuments({
      teacher: req.user._id,
      isActive: true
    });

    res.json({
      assignments,
      total
    });
  } catch (error) {
    console.error('Get all assignments error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Get single assignment
router.get('/:id', teacherAuth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('students', 'firstName lastName studentId email')
      .populate('class', 'name subject')
      .populate('submissions.student', 'firstName lastName studentId email');

    if (!assignment) {
      return res.status(404).json({ message: 'Ödev bulunamadı.' });
    }

    // Check if teacher has access to this assignment
    if (assignment.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu ödeve erişim yetkiniz yok.' });
    }

    res.json(assignment);
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Grade assignment submission
router.put('/:id/grade', teacherAuth, [
  body('studentId').notEmpty(),
  body('grade').isNumeric().isFloat({ min: 0, max: 100 }),
  body('feedback').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { studentId, grade, feedback } = req.body;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Ödev bulunamadı.' });
    }

    // Check if teacher has access to this assignment
    if (assignment.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu ödeve erişim yetkiniz yok.' });
    }

    // Find and update submission
    const submission = assignment.submissions.find(
      s => s.student.toString() === studentId
    );

    if (!submission) {
      return res.status(404).json({ message: 'Ödev teslimi bulunamadı.' });
    }

    submission.grade = grade;
    submission.feedback = feedback || '';
    submission.isGraded = true;

    await assignment.save();

    res.json({ message: 'Ödev değerlendirildi' });
  } catch (error) {
    console.error('Grade assignment error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Update assignment
router.put('/:id', teacherAuth, upload.array('attachments', 5), [
  body('title').optional().notEmpty().trim(),
  body('subject').optional().notEmpty().trim(),
  body('dueDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, description, subject, dueDate, videoLinks } = req.body;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Ödev bulunamadı.' });
    }

    // Check if teacher has access to this assignment
    if (assignment.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu ödeve erişim yetkiniz yok.' });
    }

    // Update fields
    if (title) assignment.title = title;
    if (description !== undefined) assignment.description = description;
    if (subject) assignment.subject = subject;
    if (dueDate) assignment.dueDate = new Date(dueDate);

    // Handle new attachments
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        type: file.mimetype,
        size: file.size
      }));
      assignment.attachments.push(...newAttachments);
    }

    // Handle video links
    if (videoLinks) {
      try {
        assignment.videoLinks = JSON.parse(videoLinks);
      } catch (e) {
        return res.status(400).json({ message: 'Geçersiz video link formatı' });
      }
    }

    await assignment.save();

    res.json({ message: 'Ödev güncellendi', assignment });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Delete assignment
router.delete('/:id', teacherAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Ödev bulunamadı.' });
    }

    // Check if teacher has access to this assignment
    if (assignment.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu ödeve erişim yetkiniz yok.' });
    }

    // Soft delete
    assignment.isActive = false;
    await assignment.save();

    res.json({ message: 'Ödev silindi' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Download assignment attachment
router.get('/:id/download/:attachmentId', auth, async (req, res) => {
  try {
    const { id, attachmentId } = req.params;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Ödev bulunamadı.' });
    }

    // Check access
    const hasAccess = req.user.role === 'admin' || 
      assignment.teacher.toString() === req.user._id.toString() ||
      assignment.students.includes(req.user._id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Bu dosyaya erişim yetkiniz yok.' });
    }

    const attachment = assignment.attachments.id(attachmentId);
    if (!attachment) {
      return res.status(404).json({ message: 'Dosya bulunamadı.' });
    }

    const filePath = path.join(__dirname, '..', '..', attachment.path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Dosya bulunamadı.' });
    }

    res.download(filePath, attachment.originalName);
  } catch (error) {
    console.error('Download attachment error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
