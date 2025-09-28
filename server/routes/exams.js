const express = require('express');
const { body, validationResult } = require('express-validator');
const Exam = require('../models/Exam');
const User = require('../models/User');
const Class = require('../models/Class');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all exams for a teacher
router.get('/my-exams', auth, async (req, res) => {
  try {
    const { type, subject, status, page = 1, limit = 10 } = req.query;
    const teacherId = req.user.id;

    const query = { teacher: teacherId };
    
    if (type) query.type = type;
    if (subject) query.subject = subject;
    if (status) query.status = status;

    const exams = await Exam.find(query)
      .populate('assignedTo.student', 'firstName lastName email grade school')
      .populate('assignedTo.class', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Exam.countDocuments(query);

    res.json({
      success: true,
      data: {
        exams,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    console.error('Get exams error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Get all exams (for dashboard)
router.get('/all', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const teacherId = req.user.id;

    const exams = await Exam.find({ teacher: teacherId })
      .populate('assignedTo.student', 'firstName lastName email grade school')
      .populate('assignedTo.class', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1);

    const total = await Exam.countDocuments({ teacher: teacherId });

    // Transform exams to match expected format
    const transformedExams = exams.map(exam => ({
      ...exam.toObject(),
      students: exam.assignedTo.map(assignment => assignment.student).filter(Boolean),
      examDate: exam.schedule?.startDate
    }));

    res.json({
      exams: transformedExams,
      total
    });
  } catch (error) {
    console.error('Get all exams error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Get exams for a student
router.get('/student-exams', auth, async (req, res) => {
  try {
    const { type, status, page = 1, limit = 10 } = req.query;
    const studentId = req.user.id;

    const query = { 
      'assignedTo.student': studentId,
      status: 'published'
    };
    
    if (type) query.type = type;

    const exams = await Exam.find(query)
      .populate('teacher', 'firstName lastName email')
      .populate('assignedTo.class', 'name')
      .sort({ 'schedule.startDate': 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Exam.countDocuments(query);

    res.json({
      success: true,
      data: {
        exams,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    console.error('Get student exams error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Get exam templates
router.get('/templates', auth, async (req, res) => {
  try {
    const { type, subject } = req.query;
    const teacherId = req.user.id;

    const query = { 
      isTemplate: true,
      $or: [
        { teacher: teacherId },
        { teacher: null } // Public templates
      ]
    };
    
    if (type) query.type = type;
    if (subject) query.subject = subject;

    const templates = await Exam.find(query)
      .populate('teacher', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: templates });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Get single exam
router.get('/:id', auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('teacher', 'firstName lastName email')
      .populate('assignedTo.student', 'firstName lastName email grade school')
      .populate('assignedTo.class', 'name')
      .populate('results.student', 'firstName lastName email grade school');

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Sınav bulunamadı' });
    }

    // Check if user has access to this exam
    const isTeacher = exam.teacher._id.toString() === req.user.id;
    const isAssignedStudent = exam.assignedTo.some(assignment => 
      assignment.student._id.toString() === req.user.id
    );

    if (!isTeacher && !isAssignedStudent) {
      return res.status(403).json({ success: false, message: 'Bu sınava erişim yetkiniz yok' });
    }

    res.json({ success: true, data: exam });
  } catch (error) {
    console.error('Get exam error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Create new exam
router.post('/create', [
  auth,
  body('title').notEmpty().trim(),
  body('type').isIn(['quiz', 'midterm', 'final', 'practice', 'diagnostic', 'other']),
  body('subject').notEmpty().trim(),
  body('grade').notEmpty().trim(),
  body('duration').isNumeric(),
  body('questions').isArray(),
  body('schedule.startDate').isISO8601(),
  body('schedule.endDate').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      type,
      subject,
      grade,
      duration,
      questions,
      settings,
      schedule,
      assignedTo,
      tags,
      isTemplate,
      templateName
    } = req.body;

    const teacherId = req.user.id;

    // Validate schedule
    if (new Date(schedule.startDate) >= new Date(schedule.endDate)) {
      return res.status(400).json({ success: false, message: 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır' });
    }

    const exam = new Exam({
      teacher: teacherId,
      title,
      description,
      type,
      subject,
      grade,
      duration,
      questions: questions || [],
      settings: settings || {},
      schedule: {
        startDate: new Date(schedule.startDate),
        endDate: new Date(schedule.endDate),
        timezone: schedule.timezone || 'Europe/Istanbul'
      },
      assignedTo: assignedTo || [],
      tags: tags || [],
      isTemplate: isTemplate || false,
      templateName: templateName || null
    });

    await exam.save();

    const populatedExam = await Exam.findById(exam._id)
      .populate('assignedTo.student', 'firstName lastName email grade school')
      .populate('assignedTo.class', 'name');

    res.status(201).json({ success: true, data: populatedExam });
  } catch (error) {
    console.error('Create exam error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Update exam
router.put('/:id', [
  auth,
  body('title').optional().notEmpty().trim(),
  body('type').optional().isIn(['quiz', 'midterm', 'final', 'practice', 'diagnostic', 'other']),
  body('schedule.startDate').optional().isISO8601(),
  body('schedule.endDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Sınav bulunamadı' });
    }

    // Check if user is the teacher
    if (exam.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bu sınavı düzenleme yetkiniz yok' });
    }

    const updates = req.body;
    
    // Validate schedule if provided
    if (updates.schedule) {
      if (updates.schedule.startDate && updates.schedule.endDate) {
        if (new Date(updates.schedule.startDate) >= new Date(updates.schedule.endDate)) {
          return res.status(400).json({ success: false, message: 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır' });
        }
      }
    }

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        exam[key] = updates[key];
      }
    });

    await exam.save();

    const populatedExam = await Exam.findById(exam._id)
      .populate('assignedTo.student', 'firstName lastName email grade school')
      .populate('assignedTo.class', 'name');

    res.json({ success: true, data: populatedExam });
  } catch (error) {
    console.error('Update exam error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Start exam
router.post('/:id/start', auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Sınav bulunamadı' });
    }

    // Check if student is assigned to this exam
    const assignment = exam.assignedTo.find(a => a.student.toString() === req.user.id);
    if (!assignment) {
      return res.status(403).json({ success: false, message: 'Bu sınava erişim yetkiniz yok' });
    }

    // Check if exam is published and within schedule
    if (exam.status !== 'published') {
      return res.status(400).json({ success: false, message: 'Sınav henüz yayınlanmamış' });
    }

    const now = new Date();
    if (now < exam.schedule.startDate || now > exam.schedule.endDate) {
      return res.status(400).json({ success: false, message: 'Sınav zamanı dışında' });
    }

    // Check if already started or completed
    const existingResult = exam.results.find(r => r.student.toString() === req.user.id);
    if (existingResult) {
      if (existingResult.status === 'completed') {
        return res.status(400).json({ success: false, message: 'Bu sınav zaten tamamlanmış' });
      }
      if (existingResult.status === 'in_progress') {
        return res.status(400).json({ success: false, message: 'Bu sınav zaten başlatılmış' });
      }
    }

    // Create or update result
    const result = {
      student: req.user.id,
      answers: [],
      score: 0,
      percentage: 0,
      grade: 'F',
      startedAt: now,
      status: 'in_progress',
      attempt: existingResult ? existingResult.attempt + 1 : 1
    };

    if (existingResult) {
      exam.results = exam.results.filter(r => r.student.toString() !== req.user.id);
    }

    exam.results.push(result);
    await exam.save();

    res.json({ success: true, data: exam });
  } catch (error) {
    console.error('Start exam error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Submit exam answer
router.post('/:id/submit-answer', [
  auth,
  body('questionId').isMongoId(),
  body('answer').notEmpty().trim(),
  body('timeSpent').optional().isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { questionId, answer, timeSpent } = req.body;

    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Sınav bulunamadı' });
    }

    // Check if student is assigned and exam is in progress
    const assignment = exam.assignedTo.find(a => a.student.toString() === req.user.id);
    if (!assignment) {
      return res.status(403).json({ success: false, message: 'Bu sınava erişim yetkiniz yok' });
    }

    const result = exam.results.find(r => r.student.toString() === req.user.id);
    if (!result || result.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Sınav başlatılmamış veya tamamlanmış' });
    }

    // Find question
    const question = exam.questions.id(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Soru bulunamadı' });
    }

    // Check if answer already exists
    const existingAnswer = result.answers.find(a => a.questionId.toString() === questionId);
    
    let isCorrect = false;
    let points = 0;

    // Check answer correctness based on question type
    if (question.type === 'multiple_choice') {
      const correctOption = question.options.find(opt => opt.isCorrect);
      isCorrect = correctOption && correctOption.text === answer;
    } else if (question.type === 'true_false') {
      isCorrect = question.correctAnswer === answer;
    } else if (question.type === 'short_answer' || question.type === 'fill_blank') {
      isCorrect = question.correctAnswer.toLowerCase().trim() === answer.toLowerCase().trim();
    }

    if (isCorrect) {
      points = question.points;
    }

    const answerData = {
      questionId: questionId,
      answer: answer,
      isCorrect: isCorrect,
      points: points,
      timeSpent: timeSpent || 0
    };

    if (existingAnswer) {
      // Update existing answer
      const answerIndex = result.answers.findIndex(a => a.questionId.toString() === questionId);
      result.answers[answerIndex] = answerData;
    } else {
      // Add new answer
      result.answers.push(answerData);
    }

    await exam.save();

    res.json({ success: true, data: exam });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Complete exam
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Sınav bulunamadı' });
    }

    const result = exam.results.find(r => r.student.toString() === req.user.id);
    if (!result || result.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Sınav başlatılmamış veya tamamlanmış' });
    }

    // Calculate score
    const totalPoints = result.answers.reduce((sum, answer) => sum + answer.points, 0);
    const percentage = (totalPoints / exam.totalPoints) * 100;

    // Calculate grade
    let grade = 'F';
    if (percentage >= 97) grade = 'A+';
    else if (percentage >= 93) grade = 'A';
    else if (percentage >= 90) grade = 'A-';
    else if (percentage >= 87) grade = 'B+';
    else if (percentage >= 83) grade = 'B';
    else if (percentage >= 80) grade = 'B-';
    else if (percentage >= 77) grade = 'C+';
    else if (percentage >= 73) grade = 'C';
    else if (percentage >= 70) grade = 'C-';
    else if (percentage >= 67) grade = 'D+';
    else if (percentage >= 63) grade = 'D';
    else if (percentage >= 60) grade = 'D-';

    // Calculate time spent
    const timeSpent = result.startedAt ? Math.floor((new Date() - result.startedAt) / 1000) : 0;

    // Update result
    result.score = totalPoints;
    result.percentage = percentage;
    result.grade = grade;
    result.completedAt = new Date();
    result.timeSpent = timeSpent;
    result.status = 'completed';

    // Update analytics
    exam.analytics.totalAttempts += 1;
    exam.analytics.averageScore = (exam.analytics.averageScore * (exam.analytics.totalAttempts - 1) + percentage) / exam.analytics.totalAttempts;
    exam.analytics.completionRate = (exam.results.filter(r => r.status === 'completed').length / exam.assignedTo.length) * 100;
    exam.analytics.averageTime = (exam.analytics.averageTime * (exam.analytics.totalAttempts - 1) + timeSpent) / exam.analytics.totalAttempts;

    await exam.save();

    res.json({ success: true, data: exam });
  } catch (error) {
    console.error('Complete exam error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Publish exam
router.put('/:id/publish', auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Sınav bulunamadı' });
    }

    // Check if user is the teacher
    if (exam.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bu sınavı yayınlama yetkiniz yok' });
    }

    exam.status = 'published';
    await exam.save();

    res.json({ success: true, message: 'Sınav yayınlandı' });
  } catch (error) {
    console.error('Publish exam error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Archive exam
router.put('/:id/archive', auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Sınav bulunamadı' });
    }

    // Check if user is the teacher
    if (exam.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bu sınavı arşivleme yetkiniz yok' });
    }

    exam.status = 'archived';
    await exam.save();

    res.json({ success: true, message: 'Sınav arşivlendi' });
  } catch (error) {
    console.error('Archive exam error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Delete exam
router.delete('/:id', auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Sınav bulunamadı' });
    }

    // Check if user is the teacher
    if (exam.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bu sınavı silme yetkiniz yok' });
    }

    await Exam.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Sınav silindi' });
  } catch (error) {
    console.error('Delete exam error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

module.exports = router;