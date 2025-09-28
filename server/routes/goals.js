const express = require('express');
const { body, validationResult } = require('express-validator');
const Goal = require('../models/Goal');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all goals for a teacher
router.get('/my-goals', auth, async (req, res) => {
  try {
    const { studentId, category, priority, status, page = 1, limit = 10 } = req.query;
    const teacherId = req.user.id;

    const query = { teacher: teacherId };
    
    if (studentId) query.student = studentId;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (status) query.status = status;

    const goals = await Goal.find(query)
      .populate('student', 'firstName lastName email grade school')
      .populate('notes.author', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Goal.countDocuments(query);

    res.json({
      success: true,
      data: {
        goals,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Get goals for a student
router.get('/student-goals', auth, async (req, res) => {
  try {
    const { category, priority, status, page = 1, limit = 10 } = req.query;
    const studentId = req.user.id;

    const query = { student: studentId };
    
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (status) query.status = status;

    const goals = await Goal.find(query)
      .populate('teacher', 'firstName lastName email')
      .populate('notes.author', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Goal.countDocuments(query);

    res.json({
      success: true,
      data: {
        goals,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    console.error('Get student goals error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Get single goal
router.get('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id)
      .populate('teacher', 'firstName lastName email')
      .populate('student', 'firstName lastName email grade school')
      .populate('notes.author', 'firstName lastName')
      .populate('sharedWith.teacher', 'firstName lastName email');

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Hedef bulunamadı' });
    }

    // Check if user has access to this goal
    const isTeacher = goal.teacher._id.toString() === req.user.id;
    const isStudent = goal.student._id.toString() === req.user.id;
    const isSharedWith = goal.sharedWith.some(sw => sw.teacher._id.toString() === req.user.id);

    if (!isTeacher && !isStudent && !isSharedWith) {
      return res.status(403).json({ success: false, message: 'Bu hedefe erişim yetkiniz yok' });
    }

    res.json({ success: true, data: goal });
  } catch (error) {
    console.error('Get goal error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Create new goal
router.post('/create', [
  auth,
  body('studentId').isMongoId(),
  body('title').notEmpty().trim(),
  body('targetDate').isISO8601(),
  body('category').optional().isIn(['academic', 'behavioral', 'social', 'personal', 'career', 'other']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      studentId,
      title,
      description,
      category,
      priority,
      targetDate,
      milestones,
      metrics,
      tags,
      isPublic,
      sharedWith
    } = req.body;

    const teacherId = req.user.id;

    // Check if student exists and belongs to teacher
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Öğrenci bulunamadı' });
    }

    // Validate target date
    if (new Date(targetDate) <= new Date()) {
      return res.status(400).json({ success: false, message: 'Hedef tarihi bugünden sonra olmalıdır' });
    }

    const goal = new Goal({
      teacher: teacherId,
      student: studentId,
      title,
      description,
      category: category || 'academic',
      priority: priority || 'medium',
      targetDate: new Date(targetDate),
      milestones: milestones || [],
      metrics: metrics || [],
      tags: tags || [],
      isPublic: isPublic || false,
      sharedWith: sharedWith || []
    });

    await goal.save();

    const populatedGoal = await Goal.findById(goal._id)
      .populate('student', 'firstName lastName email grade school')
      .populate('teacher', 'firstName lastName email');

    res.status(201).json({ success: true, data: populatedGoal });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Update goal
router.put('/:id', [
  auth,
  body('title').optional().notEmpty().trim(),
  body('category').optional().isIn(['academic', 'behavioral', 'social', 'personal', 'career', 'other']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('status').optional().isIn(['not_started', 'in_progress', 'completed', 'cancelled', 'on_hold']),
  body('targetDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const goal = await Goal.findById(req.params.id);
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Hedef bulunamadı' });
    }

    // Check if user is the teacher
    if (goal.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bu hedefi düzenleme yetkiniz yok' });
    }

    const updates = req.body;
    
    // Validate target date if provided
    if (updates.targetDate && new Date(updates.targetDate) <= new Date()) {
      return res.status(400).json({ success: false, message: 'Hedef tarihi bugünden sonra olmalıdır' });
    }

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        goal[key] = updates[key];
      }
    });

    await goal.save();

    const populatedGoal = await Goal.findById(goal._id)
      .populate('student', 'firstName lastName email grade school')
      .populate('teacher', 'firstName lastName email');

    res.json({ success: true, data: populatedGoal });
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Update milestone completion
router.put('/:id/milestones/:milestoneIndex', [
  auth,
  body('completed').isBoolean(),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id, milestoneIndex } = req.params;
    const { completed, notes } = req.body;

    const goal = await Goal.findById(id);
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Hedef bulunamadı' });
    }

    // Check if user has access
    const isTeacher = goal.teacher.toString() === req.user.id;
    const isStudent = goal.student.toString() === req.user.id;
    const isSharedWith = goal.sharedWith.some(sw => sw.teacher._id.toString() === req.user.id);

    if (!isTeacher && !isStudent && !isSharedWith) {
      return res.status(403).json({ success: false, message: 'Bu hedefe erişim yetkiniz yok' });
    }

    const milestoneIdx = parseInt(milestoneIndex);

    if (milestoneIdx >= goal.milestones.length) {
      return res.status(400).json({ success: false, message: 'Geçersiz kilometre taşı indeksi' });
    }

    const milestone = goal.milestones[milestoneIdx];
    milestone.completed = completed;
    if (completed) {
      milestone.completedAt = new Date();
    } else {
      milestone.completedAt = undefined;
    }
    if (notes !== undefined) {
      milestone.notes = notes;
    }

    await goal.save();

    res.json({ success: true, data: goal });
  } catch (error) {
    console.error('Update milestone error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Update metric value
router.put('/:id/metrics/:metricIndex', [
  auth,
  body('currentValue').isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id, metricIndex } = req.params;
    const { currentValue } = req.body;

    const goal = await Goal.findById(id);
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Hedef bulunamadı' });
    }

    // Check if user has access
    const isTeacher = goal.teacher.toString() === req.user.id;
    const isStudent = goal.student.toString() === req.user.id;
    const isSharedWith = goal.sharedWith.some(sw => sw.teacher._id.toString() === req.user.id);

    if (!isTeacher && !isStudent && !isSharedWith) {
      return res.status(403).json({ success: false, message: 'Bu hedefe erişim yetkiniz yok' });
    }

    const metricIdx = parseInt(metricIndex);

    if (metricIdx >= goal.metrics.length) {
      return res.status(400).json({ success: false, message: 'Geçersiz metrik indeksi' });
    }

    goal.metrics[metricIdx].currentValue = currentValue;
    await goal.save();

    res.json({ success: true, data: goal });
  } catch (error) {
    console.error('Update metric error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Add note to goal
router.post('/:id/notes', [
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

    const goal = await Goal.findById(req.params.id);
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Hedef bulunamadı' });
    }

    // Check if user has access
    const isTeacher = goal.teacher.toString() === req.user.id;
    const isStudent = goal.student.toString() === req.user.id;
    const isSharedWith = goal.sharedWith.some(sw => sw.teacher._id.toString() === req.user.id);

    if (!isTeacher && !isStudent && !isSharedWith) {
      return res.status(403).json({ success: false, message: 'Bu hedefe erişim yetkiniz yok' });
    }

    goal.notes.push({
      content,
      author: req.user.id,
      isPrivate: isPrivate || false
    });

    await goal.save();

    const populatedGoal = await Goal.findById(goal._id)
      .populate('notes.author', 'firstName lastName');

    res.json({ success: true, data: populatedGoal });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Share goal with other teachers
router.post('/:id/share', [
  auth,
  body('teacherId').isMongoId(),
  body('permissions').isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { teacherId, permissions } = req.body;

    const goal = await Goal.findById(req.params.id);
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Hedef bulunamadı' });
    }

    // Check if user is the teacher
    if (goal.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bu hedefi paylaşma yetkiniz yok' });
    }

    // Check if teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ success: false, message: 'Öğretmen bulunamadı' });
    }

    // Check if already shared
    const alreadyShared = goal.sharedWith.some(sw => sw.teacher.toString() === teacherId);
    if (alreadyShared) {
      return res.status(400).json({ success: false, message: 'Bu hedef zaten paylaşılmış' });
    }

    goal.sharedWith.push({
      teacher: teacherId,
      permissions: permissions
    });

    await goal.save();

    res.json({ success: true, message: 'Hedef paylaşıldı' });
  } catch (error) {
    console.error('Share goal error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Delete goal
router.delete('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Hedef bulunamadı' });
    }

    // Check if user is the teacher
    if (goal.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bu hedefi silme yetkiniz yok' });
    }

    await Goal.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Hedef silindi' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

module.exports = router;

