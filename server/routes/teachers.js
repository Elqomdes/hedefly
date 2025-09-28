const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Class = require('../models/Class');
const Assignment = require('../models/Assignment');
const Exam = require('../models/Exam');
const Plan = require('../models/Plan');
const { teacherAuth, auth } = require('../middleware/auth');
const { checkMongoDBConnection } = require('../middleware/mongodb');

const router = express.Router();

// Get all students for a teacher
router.get('/students', teacherAuth, async (req, res) => {
  try {
    const students = await User.find({
      $or: [
        { teachers: req.user._id },
        { 'collaboratingTeachers': req.user._id }
      ],
      role: 'student'
    }).select('-password');

    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Add student to teacher
router.post('/students', teacherAuth, [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, grade, school, parentName, parentPhone } = req.body;

    // Check if student already exists
    let student = await User.findOne({ email });
    
    if (student) {
      // If student exists, add teacher to their teachers list
      if (!student.teachers.includes(req.user._id)) {
        student.teachers.push(req.user._id);
        await student.save();
      }
    } else {
      // Create new student
      student = new User({
        email,
        password,
        firstName,
        lastName,
        role: 'student',
        grade: grade || '',
        school: school || '',
        parentName: parentName || '',
        parentPhone: parentPhone || '',
        teachers: [req.user._id]
      });
      await student.save();
    }

    res.status(201).json({
      message: 'Öğrenci başarıyla eklendi',
      student: {
        id: student._id,
        email: student.email,
        firstName: student.firstName,
        lastName: student.lastName,
        studentId: student.studentId,
        grade: student.grade,
        school: student.school
      }
    });
  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Add collaborating teacher
router.post('/collaborate', teacherAuth, [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Check if teacher exists
    const teacher = await User.findOne({ email, role: 'teacher' });
    if (!teacher) {
      return res.status(404).json({ message: 'Öğretmen bulunamadı.' });
    }

    // Check if already collaborating
    if (req.user.collaboratingTeachers.includes(teacher._id)) {
      return res.status(400).json({ message: 'Bu öğretmen zaten işbirliği yapıyor.' });
    }

    // Check collaboration limit (max 3)
    if (req.user.collaboratingTeachers.length >= 3) {
      return res.status(400).json({ message: 'Maksimum 3 öğretmen ile işbirliği yapabilirsiniz.' });
    }

    // Add to collaborating teachers
    req.user.collaboratingTeachers.push(teacher._id);
    teacher.collaboratingTeachers.push(req.user._id);
    
    await req.user.save();
    await teacher.save();

    res.json({
      message: 'İşbirliği başarıyla eklendi',
      teacher: {
        id: teacher._id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email
      }
    });
  } catch (error) {
    console.error('Add collaboration error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Get collaborating teachers
router.get('/collaborate', teacherAuth, async (req, res) => {
  try {
    const teachers = await User.find({
      _id: { $in: req.user.collaboratingTeachers },
      role: 'teacher'
    }).select('-password');

    res.json(teachers);
  } catch (error) {
    console.error('Get collaborating teachers error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Remove collaborating teacher
router.delete('/collaborate/:teacherId', teacherAuth, async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Remove from both teachers
    req.user.collaboratingTeachers = req.user.collaboratingTeachers.filter(
      id => id.toString() !== teacherId
    );
    
    const otherTeacher = await User.findById(teacherId);
    if (otherTeacher) {
      otherTeacher.collaboratingTeachers = otherTeacher.collaboratingTeachers.filter(
        id => id.toString() !== req.user._id.toString()
      );
      await otherTeacher.save();
    }

    await req.user.save();

    res.json({ message: 'İşbirliği kaldırıldı' });
  } catch (error) {
    console.error('Remove collaboration error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Get teacher's classes
router.get('/classes', teacherAuth, async (req, res) => {
  try {
    const classes = await Class.find({
      $or: [
        { teacher: req.user._id },
        { collaboratingTeachers: req.user._id }
      ],
      isActive: true
    }).populate('students', 'firstName lastName studentId email')
      .populate('teacher', 'firstName lastName')
      .populate('collaboratingTeachers', 'firstName lastName');

    res.json(classes);
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Create class
router.post('/classes', teacherAuth, [
  body('name').notEmpty().trim(),
  body('subject').notEmpty().trim(),
  body('grade').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, subject, grade, color } = req.body;

    const newClass = new Class({
      name,
      description: description || '',
      teacher: req.user._id,
      subject,
      grade,
      color: color || '#3B82F6'
    });

    await newClass.save();

    res.status(201).json({
      message: 'Sınıf başarıyla oluşturuldu',
      class: newClass
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Add students to class
router.post('/classes/:classId/students', teacherAuth, [
  body('studentIds').isArray().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { classId } = req.params;
    const { studentIds } = req.body;

    const classObj = await Class.findById(classId);
    if (!classObj) {
      return res.status(404).json({ message: 'Sınıf bulunamadı.' });
    }

    // Check if teacher has access to this class
    if (classObj.teacher.toString() !== req.user._id.toString() && 
        !classObj.collaboratingTeachers.includes(req.user._id)) {
      return res.status(403).json({ message: 'Bu sınıfa erişim yetkiniz yok.' });
    }

    // Add students to class
    for (const studentId of studentIds) {
      if (!classObj.students.includes(studentId)) {
        classObj.students.push(studentId);
        
        // Add class to student's classes
        const student = await User.findById(studentId);
        if (student && !student.classes.includes(classId)) {
          student.classes.push(classId);
          await student.save();
        }
      }
    }

    await classObj.save();

    res.json({ message: 'Öğrenciler sınıfa eklendi' });
  } catch (error) {
    console.error('Add students to class error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Get student analytics
router.get('/students/:studentId/analytics', teacherAuth, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check if teacher has access to this student
    const student = await User.findById(studentId);
    if (!student || !student.teachers.includes(req.user._id)) {
      return res.status(403).json({ message: 'Bu öğrenciye erişim yetkiniz yok.' });
    }

    // Get assignments
    const assignments = await Assignment.find({
      students: studentId
    }).populate('teacher', 'firstName lastName');

    // Get exams
    const exams = await Exam.find({
      students: studentId
    }).populate('teacher', 'firstName lastName');

    // Get plans
    const plans = await Plan.find({
      student: studentId,
      teacher: req.user._id
    });

    // Calculate statistics
    const totalAssignments = assignments.length;
    const completedAssignments = assignments.filter(a => 
      a.submissions.some(s => s.student.toString() === studentId && s.isGraded)
    ).length;

    const totalExams = exams.length;
    const completedExams = exams.filter(e => 
      e.results.some(r => r.student.toString() === studentId)
    ).length;

    const assignmentCompletionRate = totalAssignments > 0 ? 
      (completedAssignments / totalAssignments) * 100 : 0;

    const examCompletionRate = totalExams > 0 ? 
      (completedExams / totalExams) * 100 : 0;

    // Subject-wise statistics
    const subjectStats = {};
    assignments.forEach(assignment => {
      if (!subjectStats[assignment.subject]) {
        subjectStats[assignment.subject] = { total: 0, completed: 0 };
      }
      subjectStats[assignment.subject].total++;
      if (assignment.submissions.some(s => s.student.toString() === studentId && s.isGraded)) {
        subjectStats[assignment.subject].completed++;
      }
    });

    res.json({
      student: {
        id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        studentId: student.studentId,
        grade: student.grade,
        school: student.school
      },
      statistics: {
        totalAssignments,
        completedAssignments,
        assignmentCompletionRate: Math.round(assignmentCompletionRate),
        totalExams,
        completedExams,
        examCompletionRate: Math.round(examCompletionRate),
        subjectStats
      },
      assignments: assignments.slice(0, 10), // Last 10 assignments
      exams: exams.slice(0, 10), // Last 10 exams
      plans: plans.slice(0, 5) // Last 5 plans
    });
  } catch (error) {
    console.error('Get student analytics error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
