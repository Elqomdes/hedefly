const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const Exam = require('../models/Exam');
const Plan = require('../models/Plan');
const Goal = require('../models/Goal');
const Class = require('../models/Class');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get student dashboard data
router.get('/dashboard', auth, async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get recent assignments
    const recentAssignments = await Assignment.find({
      students: studentId,
      isActive: true
    })
    .populate('teacher', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(5);

    // Get recent exams
    const recentExams = await Exam.find({
      assignedTo: { $elemMatch: { student: studentId } },
      isActive: true
    })
    .populate('teacher', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(5);

    // Get active plans
    const activePlans = await Plan.find({
      student: studentId,
      status: 'active'
    })
    .populate('teacher', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(5);

    // Calculate assignment statistics
    const totalAssignments = await Assignment.countDocuments({
      students: studentId,
      isActive: true
    });

    const completedAssignments = await Assignment.countDocuments({
      students: studentId,
      isActive: true,
      'submissions.student': studentId,
      'submissions.isGraded': true
    });

    const assignmentCompletionRate = totalAssignments > 0 ? 
      Math.round((completedAssignments / totalAssignments) * 100) : 0;

    // Calculate exam statistics
    const totalExams = await Exam.countDocuments({
      assignedTo: { $elemMatch: { student: studentId } },
      isActive: true
    });

    const completedExams = await Exam.countDocuments({
      assignedTo: { $elemMatch: { student: studentId } },
      isActive: true,
      'results.student': studentId
    });

    const examCompletionRate = totalExams > 0 ? 
      Math.round((completedExams / totalExams) * 100) : 0;

    res.json({
      success: true,
      data: {
        recentAssignments: recentAssignments || [],
        recentExams: recentExams || [],
        activePlans: activePlans || [],
        statistics: {
          totalAssignments: totalAssignments || 0,
          completedAssignments: completedAssignments || 0,
          assignmentCompletionRate: assignmentCompletionRate || 0,
          totalExams: totalExams || 0,
          completedExams: completedExams || 0,
          examCompletionRate: examCompletionRate || 0
        }
      }
    });
  } catch (error) {
    console.error('Get student dashboard error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Get student assignments
router.get('/assignments', auth, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { status, subject, page = 1, limit = 10 } = req.query;

    const query = {
      students: studentId,
      isActive: true
    };

    if (status) {
      if (status === 'completed') {
        query['submissions.student'] = studentId;
        query['submissions.isGraded'] = true;
      } else if (status === 'pending') {
        query.$or = [
          { 'submissions.student': { $ne: studentId } },
          { 'submissions.student': studentId, 'submissions.isGraded': false }
        ];
      }
    }

    if (subject) query.subject = subject;

    const assignments = await Assignment.find(query)
      .populate('teacher', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Assignment.countDocuments(query);

    res.json({
      success: true,
      data: {
        assignments,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    console.error('Get student assignments error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Get student exams
router.get('/exams', auth, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { status, subject, page = 1, limit = 10 } = req.query;

    const query = {
      assignedTo: { $elemMatch: { student: studentId } },
      isActive: true
    };

    if (status) {
      if (status === 'completed') {
        query['results.student'] = studentId;
      } else if (status === 'pending') {
        query['results.student'] = { $ne: studentId };
      }
    }

    if (subject) query.subject = subject;

    const exams = await Exam.find(query)
      .populate('teacher', 'firstName lastName')
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
    console.error('Get student exams error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Get student plans
router.get('/plans', auth, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { type, status, page = 1, limit = 10 } = req.query;

    const query = { student: studentId };

    if (type) query.type = type;
    if (status) query.status = status;

    const plans = await Plan.find(query)
      .populate('teacher', 'firstName lastName')
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

// Get student goals
router.get('/goals', auth, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { category, priority, status, page = 1, limit = 10 } = req.query;

    const query = { student: studentId };

    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (status) query.status = status;

    const goals = await Goal.find(query)
      .populate('teacher', 'firstName lastName')
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

// Get student analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { period = 'all' } = req.query;

    // Calculate date range
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = { createdAt: { $gte: weekAgo } };
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter = { createdAt: { $gte: monthAgo } };
        break;
      case 'year':
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        dateFilter = { createdAt: { $gte: yearAgo } };
        break;
    }

    // Get assignments
    const assignments = await Assignment.find({
      students: studentId,
      isActive: true,
      ...dateFilter
    }).populate('teacher', 'firstName lastName');

    // Get exams
    const exams = await Exam.find({
      assignedTo: { $elemMatch: { student: studentId } },
      isActive: true,
      ...dateFilter
    }).populate('teacher', 'firstName lastName');

    // Get plans
    const plans = await Plan.find({
      student: studentId,
      isActive: true,
      ...dateFilter
    });

    // Get goals
    const goals = await Goal.find({
      student: studentId,
      ...dateFilter
    });

    // Calculate assignment statistics
    const totalAssignments = assignments.length;
    const completedAssignments = assignments.filter(a => 
      a.submissions.some(s => s.student.toString() === studentId && s.isGraded)
    ).length;
    const assignmentCompletionRate = totalAssignments > 0 ? 
      (completedAssignments / totalAssignments) * 100 : 0;

    // Calculate exam statistics
    const totalExams = exams.length;
    const completedExams = exams.filter(e => 
      e.results.some(r => r.student.toString() === studentId)
    ).length;
    const examCompletionRate = totalExams > 0 ? 
      (completedExams / totalExams) * 100 : 0;

    // Calculate average grades
    const assignmentGrades = assignments
      .filter(a => a.submissions.some(s => s.student.toString() === studentId && s.isGraded))
      .map(a => a.submissions.find(s => s.student.toString() === studentId))
      .filter(s => s && s.grade !== undefined)
      .map(s => s.grade);

    const examGrades = exams
      .filter(e => e.results.some(r => r.student.toString() === studentId))
      .map(e => e.results.find(r => r.student.toString() === studentId))
      .filter(r => r)
      .map(r => r.percentage);

    const averageAssignmentGrade = assignmentGrades.length > 0 ? 
      assignmentGrades.reduce((sum, grade) => sum + grade, 0) / assignmentGrades.length : 0;

    const averageExamGrade = examGrades.length > 0 ? 
      examGrades.reduce((sum, grade) => sum + grade, 0) / examGrades.length : 0;

    // Subject-wise statistics
    const subjectStats = {};
    assignments.forEach(assignment => {
      if (!subjectStats[assignment.subject]) {
        subjectStats[assignment.subject] = { 
          total: 0, 
          completed: 0, 
          averageGrade: 0,
          grades: []
        };
      }
      subjectStats[assignment.subject].total++;
      
      const submission = assignment.submissions.find(s => s.student.toString() === studentId);
      if (submission && submission.isGraded) {
        subjectStats[assignment.subject].completed++;
        if (submission.grade !== undefined) {
          subjectStats[assignment.subject].grades.push(submission.grade);
        }
      }
    });

    // Calculate average grades per subject
    Object.keys(subjectStats).forEach(subject => {
      const grades = subjectStats[subject].grades;
      subjectStats[subject].averageGrade = grades.length > 0 ? 
        Math.round(grades.reduce((sum, grade) => sum + grade, 0) / grades.length) : 0;
      subjectStats[subject].completionRate = subjectStats[subject].total > 0 ? 
        Math.round((subjectStats[subject].completed / subjectStats[subject].total) * 100) : 0;
    });

    // Plan completion statistics
    const totalTasks = plans.reduce((sum, plan) => sum + plan.subjects.reduce((s, sub) => s + sub.topics.length, 0), 0);
    const completedTasks = plans.reduce((sum, plan) => 
      sum + plan.subjects.reduce((s, sub) => s + sub.topics.filter(topic => topic.completed).length, 0), 0);
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const totalGoals = goals.length;
    const achievedGoals = goals.filter(goal => goal.status === 'completed').length;
    const goalAchievementRate = totalGoals > 0 ? (achievedGoals / totalGoals) * 100 : 0;

    // Recent activity
    const recentActivity = [
      ...assignments.slice(0, 5).map(a => ({
        type: 'assignment',
        title: a.title,
        subject: a.subject,
        date: a.createdAt,
        status: a.submissions.some(s => s.student.toString() === studentId && s.isGraded) ? 'completed' : 'pending'
      })),
      ...exams.slice(0, 5).map(e => ({
        type: 'exam',
        title: e.title,
        subject: e.subject,
        date: e.createdAt,
        status: e.results.some(r => r.student.toString() === studentId) ? 'completed' : 'pending'
      })),
      ...goals.slice(0, 5).map(g => ({
        type: 'goal',
        title: g.title,
        subject: g.category,
        date: g.createdAt,
        status: g.status
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

    // Generate monthly progress data (last 6 months)
    const monthlyProgress = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthAssignments = assignments.filter(a => 
        a.createdAt >= monthStart && a.createdAt <= monthEnd
      ).length;
      
      const monthExams = exams.filter(e => 
        e.createdAt >= monthStart && e.createdAt <= monthEnd
      ).length;
      
      const monthGoals = goals.filter(g => 
        g.createdAt >= monthStart && g.createdAt <= monthEnd
      ).length;
      
      monthlyProgress.push({
        month: monthStart,
        assignments: monthAssignments,
        exams: monthExams,
        goals: monthGoals
      });
    }

    // Generate performance trend data (last 30 days)
    const performanceTrend = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
      
      const dayAssignments = assignments.filter(a => 
        a.createdAt >= dayStart && a.createdAt < dayEnd
      );
      
      const dayExams = exams.filter(e => 
        e.createdAt >= dayStart && e.createdAt < dayEnd
      );
      
      const avgGrade = [...dayAssignments, ...dayExams]
        .map(item => {
          if (item.submissions) {
            const submission = item.submissions.find(s => s.student.toString() === studentId);
            return submission?.grade || 0;
          } else if (item.results) {
            const result = item.results.find(r => r.student.toString() === studentId);
            return result?.percentage || 0;
          }
          return 0;
        })
        .filter(grade => grade > 0);
      
      const avgGradeValue = avgGrade.length > 0 ? 
        avgGrade.reduce((sum, grade) => sum + grade, 0) / avgGrade.length : 0;
      
      performanceTrend.push({
        date: dayStart,
        grade: Math.round(avgGradeValue),
        completion: dayAssignments.length + dayExams.length
      });
    }

    res.json({
      success: true,
      data: {
        statistics: {
          assignments: {
            total: totalAssignments,
            completed: completedAssignments,
            completionRate: Math.round(assignmentCompletionRate),
            averageGrade: Math.round(averageAssignmentGrade)
          },
          exams: {
            total: totalExams,
            completed: completedExams,
            completionRate: Math.round(examCompletionRate),
            averageGrade: Math.round(averageExamGrade)
          },
          plans: {
            totalTasks,
            completedTasks,
            taskCompletionRate: Math.round(taskCompletionRate),
            totalGoals,
            achievedGoals,
            goalAchievementRate: Math.round(goalAchievementRate)
          }
        },
        subjectStats,
        recentActivity,
        performanceTrend,
        monthlyProgress
      }
    });
  } catch (error) {
    console.error('Get student analytics error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Get student classes
router.get('/classes', auth, async (req, res) => {
  try {
    const studentId = req.user.id;

    const classes = await Class.find({
      students: studentId,
      isActive: true
    })
    .populate('teacher', 'firstName lastName')
    .populate('collaboratingTeachers', 'firstName lastName')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: classes
    });
  } catch (error) {
    console.error('Get student classes error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Get student teachers
router.get('/teachers', auth, async (req, res) => {
  try {
    const studentId = req.user.id;

    const student = await User.findById(studentId).populate('teachers', 'firstName lastName email subjects experience bio');
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Öğrenci bulunamadı' });
    }

    res.json({
      success: true,
      data: student.teachers || []
    });
  } catch (error) {
    console.error('Get student teachers error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Submit assignment
router.post('/assignments/:id/submit', auth, [
  body('content').notEmpty().trim(),
  body('attachments').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const studentId = req.user.id;
    const assignmentId = req.params.id;
    const { content, attachments = [] } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Ödev bulunamadı' });
    }

    // Check if student is assigned to this assignment
    if (!assignment.students.includes(studentId)) {
      return res.status(403).json({ success: false, message: 'Bu ödeve erişim yetkiniz yok' });
    }

    // Check if already submitted
    const existingSubmission = assignment.submissions.find(s => s.student.toString() === studentId);
    if (existingSubmission) {
      return res.status(400).json({ success: false, message: 'Bu ödev zaten teslim edilmiş' });
    }

    // Add submission
    assignment.submissions.push({
      student: studentId,
      content,
      attachments,
      submittedAt: new Date(),
      isGraded: false
    });

    await assignment.save();

    res.json({
      success: true,
      message: 'Ödev başarıyla teslim edildi'
    });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Submit exam
router.post('/exams/:id/submit', auth, [
  body('answers').isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const studentId = req.user.id;
    const examId = req.params.id;
    const { answers } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Sınav bulunamadı' });
    }

    // Check if student is assigned to this exam
    const isAssigned = exam.assignedTo.some(a => a.student.toString() === studentId);
    if (!isAssigned) {
      return res.status(403).json({ success: false, message: 'Bu sınava erişim yetkiniz yok' });
    }

    // Check if already submitted
    const existingResult = exam.results.find(r => r.student.toString() === studentId);
    if (existingResult) {
      return res.status(400).json({ success: false, message: 'Bu sınav zaten tamamlanmış' });
    }

    // Calculate score
    let correctAnswers = 0;
    let totalQuestions = exam.questions.length;

    exam.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    // Add result
    exam.results.push({
      student: studentId,
      answers,
      score: correctAnswers,
      totalQuestions,
      percentage,
      submittedAt: new Date()
    });

    await exam.save();

    res.json({
      success: true,
      message: 'Sınav başarıyla tamamlandı',
      data: {
        score: correctAnswers,
        totalQuestions,
        percentage
      }
    });
  } catch (error) {
    console.error('Submit exam error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Update plan task
router.put('/plans/:id/tasks/:taskIndex', auth, [
  body('isCompleted').isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const studentId = req.user.id;
    const planId = req.params.id;
    const taskIndex = parseInt(req.params.taskIndex);
    const { isCompleted } = req.body;

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan bulunamadı' });
    }

    // Check if student owns this plan
    if (plan.student.toString() !== studentId) {
      return res.status(403).json({ success: false, message: 'Bu plana erişim yetkiniz yok' });
    }

    // Find and update the task
    let taskFound = false;
    for (let subjectIndex = 0; subjectIndex < plan.subjects.length; subjectIndex++) {
      const subject = plan.subjects[subjectIndex];
      if (taskIndex < subject.topics.length) {
        subject.topics[taskIndex].completed = isCompleted;
        taskFound = true;
        break;
      }
    }

    if (!taskFound) {
      return res.status(404).json({ success: false, message: 'Görev bulunamadı' });
    }

    await plan.save();

    res.json({
      success: true,
      message: 'Görev durumu güncellendi'
    });
  } catch (error) {
    console.error('Update plan task error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

module.exports = router;