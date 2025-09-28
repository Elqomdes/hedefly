const express = require('express');
const Assignment = require('../models/Assignment');
const Exam = require('../models/Exam');
const Plan = require('../models/Plan');
const User = require('../models/User');
const Class = require('../models/Class');
const { teacherAuth, auth } = require('../middleware/auth');

const router = express.Router();

// Get student analytics
router.get('/student/:studentId', teacherAuth, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { period = 'all' } = req.query;

    // Check if teacher has access to this student
    const student = await User.findById(studentId);
    if (!student || !student.teachers.includes(req.user._id)) {
      return res.status(403).json({ message: 'Bu öğrenciye erişim yetkiniz yok.' });
    }

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
      students: studentId,
      isActive: true,
      ...dateFilter
    }).populate('teacher', 'firstName lastName');

    // Get plans
    const plans = await Plan.find({
      student: studentId,
      teacher: req.user._id,
      isActive: true,
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
    });

    // Plan completion statistics
    const totalTasks = plans.reduce((sum, plan) => sum + plan.tasks.length, 0);
    const completedTasks = plans.reduce((sum, plan) => 
      sum + plan.tasks.filter(task => task.isCompleted).length, 0);
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const totalGoals = plans.reduce((sum, plan) => sum + plan.goals.length, 0);
    const achievedGoals = plans.reduce((sum, plan) => 
      sum + plan.goals.filter(goal => goal.isAchieved).length, 0);
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
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

    res.json({
      student: {
        id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        studentId: student.studentId,
        grade: student.grade,
        school: student.school
      },
      period,
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
        },
        subjectStats
      },
      recentActivity
    });
  } catch (error) {
    console.error('Get student analytics error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Get class analytics
router.get('/class/:classId', teacherAuth, async (req, res) => {
  try {
    const { classId } = req.params;
    const { period = 'all' } = req.query;

    const classObj = await Class.findById(classId);
    if (!classObj) {
      return res.status(404).json({ message: 'Sınıf bulunamadı.' });
    }

    // Check if teacher has access to this class
    if (classObj.teacher.toString() !== req.user._id.toString() && 
        !classObj.collaboratingTeachers.includes(req.user._id)) {
      return res.status(403).json({ message: 'Bu sınıfa erişim yetkiniz yok.' });
    }

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

    // Get assignments and exams for this class
    const assignments = await Assignment.find({
      class: classId,
      isActive: true,
      ...dateFilter
    });

    const exams = await Exam.find({
      class: classId,
      isActive: true,
      ...dateFilter
    });

    // Calculate overall statistics
    const totalStudents = classObj.students.length;
    const totalAssignments = assignments.length;
    const totalExams = exams.length;

    // Assignment statistics
    let totalAssignmentSubmissions = 0;
    let gradedAssignmentSubmissions = 0;
    let totalAssignmentGrades = 0;

    assignments.forEach(assignment => {
      totalAssignmentSubmissions += assignment.submissions.length;
      const gradedSubmissions = assignment.submissions.filter(s => s.isGraded);
      gradedAssignmentSubmissions += gradedSubmissions.length;
      gradedSubmissions.forEach(s => {
        if (s.grade !== undefined) {
          totalAssignmentGrades += s.grade;
        }
      });
    });

    // Exam statistics
    let totalExamResults = 0;
    let totalExamGrades = 0;

    exams.forEach(exam => {
      totalExamResults += exam.results.length;
      exam.results.forEach(result => {
        totalExamGrades += result.percentage;
      });
    });

    const averageAssignmentGrade = gradedAssignmentSubmissions > 0 ? 
      totalAssignmentGrades / gradedAssignmentSubmissions : 0;

    const averageExamGrade = totalExamResults > 0 ? 
      totalExamGrades / totalExamResults : 0;

    // Student performance - Batch fetch students to avoid N+1 problem
    const students = await User.find({ 
      _id: { $in: classObj.students } 
    }).select('firstName lastName studentId');
    
    const studentMap = new Map(students.map(s => [s._id.toString(), s]));
    
    const studentPerformance = [];
    for (const studentId of classObj.students) {
      const student = studentMap.get(studentId.toString());
      if (!student) continue;

      const studentAssignments = assignments.filter(a => 
        a.submissions.some(s => s.student.toString() === studentId)
      );
      const studentExams = exams.filter(e => 
        e.results.some(r => r.student.toString() === studentId)
      );

      const studentAssignmentGrades = studentAssignments
        .map(a => a.submissions.find(s => s.student.toString() === studentId))
        .filter(s => s && s.grade !== undefined)
        .map(s => s.grade);

      const studentExamGrades = studentExams
        .map(e => e.results.find(r => r.student.toString() === studentId))
        .filter(r => r)
        .map(r => r.percentage);

      const avgAssignmentGrade = studentAssignmentGrades.length > 0 ? 
        studentAssignmentGrades.reduce((sum, grade) => sum + grade, 0) / studentAssignmentGrades.length : 0;

      const avgExamGrade = studentExamGrades.length > 0 ? 
        studentExamGrades.reduce((sum, grade) => sum + grade, 0) / studentExamGrades.length : 0;

      studentPerformance.push({
        studentId: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        studentId: student.studentId,
        assignmentCount: studentAssignments.length,
        examCount: studentExams.length,
        averageAssignmentGrade: Math.round(avgAssignmentGrade),
        averageExamGrade: Math.round(avgExamGrade),
        overallAverage: Math.round((avgAssignmentGrade + avgExamGrade) / 2)
      });
    }

    // Sort by overall performance
    studentPerformance.sort((a, b) => b.overallAverage - a.overallAverage);

    res.json({
      class: {
        id: classObj._id,
        name: classObj.name,
        subject: classObj.subject,
        grade: classObj.grade
      },
      period,
      statistics: {
        totalStudents,
        totalAssignments,
        totalExams,
        assignmentCompletionRate: totalStudents * totalAssignments > 0 ? 
          Math.round((gradedAssignmentSubmissions / (totalStudents * totalAssignments)) * 100) : 0,
        examCompletionRate: totalStudents * totalExams > 0 ? 
          Math.round((totalExamResults / (totalStudents * totalExams)) * 100) : 0,
        averageAssignmentGrade: Math.round(averageAssignmentGrade),
        averageExamGrade: Math.round(averageExamGrade)
      },
      studentPerformance
    });
  } catch (error) {
    console.error('Get class analytics error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Generate student report
router.post('/student/:studentId/report', teacherAuth, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { format = 'pdf', includeCharts = true } = req.body;

    // Check if teacher has access to this student
    const student = await User.findById(studentId);
    if (!student || !student.teachers.includes(req.user._id)) {
      return res.status(403).json({ message: 'Bu öğrenciye erişim yetkiniz yok.' });
    }

    // Get analytics data
    const analyticsResponse = await fetch(`${req.protocol}://${req.get('host')}/api/analytics/student/${studentId}?period=all`);
    const analyticsData = await analyticsResponse.json();

    if (!analyticsResponse.ok) {
      return res.status(analyticsResponse.status).json(analyticsData);
    }

    // Generate report data
    const reportData = {
      student: analyticsData.student,
      generatedAt: new Date(),
      generatedBy: {
        firstName: req.user.firstName,
        lastName: req.user.lastName
      },
      statistics: analyticsData.statistics,
      recentActivity: analyticsData.recentActivity,
      includeCharts
    };

    // In a real implementation, you would generate PDF here
    // For now, we'll return the report data
    res.json({
      message: 'Rapor oluşturuldu',
      reportData,
      downloadUrl: `/api/analytics/student/${studentId}/report/download/${Date.now()}`
    });
  } catch (error) {
    console.error('Generate student report error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;

