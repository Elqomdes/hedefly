const express = require('express');
const { body, validationResult } = require('express-validator');
const Class = require('../models/Class');
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const Exam = require('../models/Exam');
const { teacherAuth, auth } = require('../middleware/auth');

const router = express.Router();

// Get all classes for teacher
router.get('/', teacherAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, subject, grade } = req.query;
    
    const query = {
      $or: [
        { teacher: req.user._id },
        { collaboratingTeachers: req.user._id }
      ],
      isActive: true
    };

    if (subject) query.subject = subject;
    if (grade) query.grade = grade;

    const classes = await Class.find(query)
      .populate('teacher', 'firstName lastName')
      .populate('collaboratingTeachers', 'firstName lastName')
      .populate('students', 'firstName lastName studentId email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Class.countDocuments(query);

    res.json({
      classes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Get single class
router.get('/:id', teacherAuth, async (req, res) => {
  try {
    const classObj = await Class.findById(req.params.id)
      .populate('teacher', 'firstName lastName')
      .populate('collaboratingTeachers', 'firstName lastName')
      .populate('students', 'firstName lastName studentId email grade school')
      .populate('assignments', 'title subject dueDate type')
      .populate('exams', 'title subject examDate type');

    if (!classObj) {
      return res.status(404).json({ message: 'Sınıf bulunamadı.' });
    }

    // Check if teacher has access to this class
    if (classObj.teacher.toString() !== req.user._id.toString() && 
        !classObj.collaboratingTeachers.includes(req.user._id)) {
      return res.status(403).json({ message: 'Bu sınıfa erişim yetkiniz yok.' });
    }

    res.json(classObj);
  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Create class
router.post('/', teacherAuth, [
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

// Update class
router.put('/:id', teacherAuth, [
  body('name').optional().notEmpty().trim(),
  body('subject').optional().notEmpty().trim(),
  body('grade').optional().notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, description, subject, grade, color } = req.body;

    const classObj = await Class.findById(id);
    if (!classObj) {
      return res.status(404).json({ message: 'Sınıf bulunamadı.' });
    }

    // Check if teacher has access to this class
    if (classObj.teacher.toString() !== req.user._id.toString() && 
        !classObj.collaboratingTeachers.includes(req.user._id)) {
      return res.status(403).json({ message: 'Bu sınıfa erişim yetkiniz yok.' });
    }

    // Update fields
    if (name) classObj.name = name;
    if (description !== undefined) classObj.description = description;
    if (subject) classObj.subject = subject;
    if (grade) classObj.grade = grade;
    if (color) classObj.color = color;

    await classObj.save();

    res.json({ message: 'Sınıf güncellendi', class: classObj });
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Add students to class
router.post('/:id/students', teacherAuth, [
  body('studentIds').isArray().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { studentIds } = req.body;

    const classObj = await Class.findById(id);
    if (!classObj) {
      return res.status(404).json({ message: 'Sınıf bulunamadı.' });
    }

    // Check if teacher has access to this class
    if (classObj.teacher.toString() !== req.user._id.toString() && 
        !classObj.collaboratingTeachers.includes(req.user._id)) {
      return res.status(403).json({ message: 'Bu sınıfa erişim yetkiniz yok.' });
    }

    // Add students to class
    const addedStudents = [];
    for (const studentId of studentIds) {
      if (!classObj.students.includes(studentId)) {
        classObj.students.push(studentId);
        addedStudents.push(studentId);
        
        // Add class to student's classes
        const student = await User.findById(studentId);
        if (student && !student.classes.includes(id)) {
          student.classes.push(id);
          await student.save();
        }
      }
    }

    await classObj.save();

    res.json({ 
      message: `${addedStudents.length} öğrenci sınıfa eklendi`,
      addedCount: addedStudents.length
    });
  } catch (error) {
    console.error('Add students to class error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Remove student from class
router.delete('/:id/students/:studentId', teacherAuth, async (req, res) => {
  try {
    const { id, studentId } = req.params;

    const classObj = await Class.findById(id);
    if (!classObj) {
      return res.status(404).json({ message: 'Sınıf bulunamadı.' });
    }

    // Check if teacher has access to this class
    if (classObj.teacher.toString() !== req.user._id.toString() && 
        !classObj.collaboratingTeachers.includes(req.user._id)) {
      return res.status(403).json({ message: 'Bu sınıfa erişim yetkiniz yok.' });
    }

    // Remove student from class
    classObj.students = classObj.students.filter(
      id => id.toString() !== studentId
    );

    // Remove class from student's classes
    const student = await User.findById(studentId);
    if (student) {
      student.classes = student.classes.filter(
        classId => classId.toString() !== id
      );
      await student.save();
    }

    await classObj.save();

    res.json({ message: 'Öğrenci sınıftan çıkarıldı' });
  } catch (error) {
    console.error('Remove student from class error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Add collaborating teacher to class
router.post('/:id/collaborate', teacherAuth, [
  body('teacherId').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { teacherId } = req.body;

    const classObj = await Class.findById(id);
    if (!classObj) {
      return res.status(404).json({ message: 'Sınıf bulunamadı.' });
    }

    // Check if current user is the main teacher
    if (classObj.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Sadece sınıf öğretmeni işbirliği ekleyebilir.' });
    }

    // Check if teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ message: 'Öğretmen bulunamadı.' });
    }

    // Check if already collaborating
    if (classObj.collaboratingTeachers.includes(teacherId)) {
      return res.status(400).json({ message: 'Bu öğretmen zaten işbirliği yapıyor.' });
    }

    // Add collaborating teacher
    classObj.collaboratingTeachers.push(teacherId);
    await classObj.save();

    res.json({ message: 'İşbirliği eklendi' });
  } catch (error) {
    console.error('Add collaborating teacher error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Remove collaborating teacher from class
router.delete('/:id/collaborate/:teacherId', teacherAuth, async (req, res) => {
  try {
    const { id, teacherId } = req.params;

    const classObj = await Class.findById(id);
    if (!classObj) {
      return res.status(404).json({ message: 'Sınıf bulunamadı.' });
    }

    // Check if current user is the main teacher
    if (classObj.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Sadece sınıf öğretmeni işbirliği kaldırabilir.' });
    }

    // Remove collaborating teacher
    classObj.collaboratingTeachers = classObj.collaboratingTeachers.filter(
      id => id.toString() !== teacherId
    );

    await classObj.save();

    res.json({ message: 'İşbirliği kaldırıldı' });
  } catch (error) {
    console.error('Remove collaborating teacher error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Delete class
router.delete('/:id', teacherAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const classObj = await Class.findById(id);
    if (!classObj) {
      return res.status(404).json({ message: 'Sınıf bulunamadı.' });
    }

    // Check if teacher has access to this class
    if (classObj.teacher.toString() !== req.user._id.toString() && 
        !classObj.collaboratingTeachers.includes(req.user._id)) {
      return res.status(403).json({ message: 'Bu sınıfa erişim yetkiniz yok.' });
    }

    // Soft delete
    classObj.isActive = false;
    await classObj.save();

    res.json({ message: 'Sınıf silindi' });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Get class statistics
router.get('/:id/statistics', teacherAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const classObj = await Class.findById(id);
    if (!classObj) {
      return res.status(404).json({ message: 'Sınıf bulunamadı.' });
    }

    // Check if teacher has access to this class
    if (classObj.teacher.toString() !== req.user._id.toString() && 
        !classObj.collaboratingTeachers.includes(req.user._id)) {
      return res.status(403).json({ message: 'Bu sınıfa erişim yetkiniz yok.' });
    }

    // Get assignments
    const assignments = await Assignment.find({
      class: id,
      isActive: true
    });

    // Get exams
    const exams = await Exam.find({
      class: id,
      isActive: true
    });

    // Calculate statistics
    const totalStudents = classObj.students.length;
    const totalAssignments = assignments.length;
    const totalExams = exams.length;

    // Assignment completion rate
    let totalSubmissions = 0;
    let gradedSubmissions = 0;
    assignments.forEach(assignment => {
      totalSubmissions += assignment.submissions.length;
      gradedSubmissions += assignment.submissions.filter(s => s.isGraded).length;
    });

    // Exam completion rate
    let totalExamResults = 0;
    exams.forEach(exam => {
      totalExamResults += exam.results.length;
    });

    res.json({
      class: {
        id: classObj._id,
        name: classObj.name,
        subject: classObj.subject,
        grade: classObj.grade
      },
      statistics: {
        totalStudents,
        totalAssignments,
        totalExams,
        assignmentCompletionRate: totalAssignments > 0 ? 
          Math.round((gradedSubmissions / (totalStudents * totalAssignments)) * 100) : 0,
        examCompletionRate: totalExams > 0 ? 
          Math.round((totalExamResults / (totalStudents * totalExams)) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Get class statistics error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;

