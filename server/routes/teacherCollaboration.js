const express = require('express');
const { body, validationResult } = require('express-validator');
const TeacherCollaboration = require('../models/TeacherCollaboration');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get teacher's collaboration data
router.get('/my-collaborations', auth, async (req, res) => {
  try {
    const teacherId = req.user.id;

    // Find collaborations where user is main teacher or collaborating teacher
    const collaborations = await TeacherCollaboration.find({
      $or: [
        { mainTeacher: teacherId },
        { 'collaboratingTeachers.teacher': teacherId }
      ],
      isActive: true
    })
    .populate('mainTeacher', 'firstName lastName email')
    .populate('collaboratingTeachers.teacher', 'firstName lastName email')
    .populate('sharedStudents.student', 'firstName lastName email grade school')
    .populate('sharedStudents.addedBy', 'firstName lastName email');

    res.json({ success: true, data: collaborations });
  } catch (error) {
    console.error('Get collaborations error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Send collaboration request
router.post('/send-request', [
  auth,
  body('teacherEmail').isEmail().normalizeEmail(),
  body('permissions').isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { teacherEmail, permissions } = req.body;
    const mainTeacherId = req.user.id;

    // Check if teacher exists
    const collaboratingTeacher = await User.findOne({ 
      email: teacherEmail, 
      role: 'teacher' 
    });

    if (!collaboratingTeacher) {
      return res.status(404).json({ 
        success: false, 
        message: 'Öğretmen bulunamadı' 
      });
    }

    if (collaboratingTeacher._id.toString() === mainTeacherId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Kendinizle işbirliği yapamazsınız' 
      });
    }

    // Check if collaboration already exists
    const existingCollaboration = await TeacherCollaboration.findOne({
      mainTeacher: mainTeacherId,
      'collaboratingTeachers.teacher': collaboratingTeacher._id,
      isActive: true
    });

    if (existingCollaboration) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bu öğretmenle zaten işbirliğiniz var' 
      });
    }

    // Check if main teacher has reached max collaborations (3)
    const mainTeacherCollaborations = await TeacherCollaboration.findOne({
      mainTeacher: mainTeacherId,
      isActive: true
    });

    if (mainTeacherCollaborations && 
        mainTeacherCollaborations.collaboratingTeachers.length >= 3) {
      return res.status(400).json({ 
        success: false, 
        message: 'Maksimum 3 öğretmenle işbirliği yapabilirsiniz' 
      });
    }

    // Create or update collaboration
    let collaboration = await TeacherCollaboration.findOne({
      mainTeacher: mainTeacherId,
      isActive: true
    });

    if (!collaboration) {
      collaboration = new TeacherCollaboration({
        mainTeacher: mainTeacherId,
        collaboratingTeachers: [],
        sharedStudents: []
      });
    }

    // Add collaborating teacher
    collaboration.collaboratingTeachers.push({
      teacher: collaboratingTeacher._id,
      permissions: permissions,
      status: 'pending'
    });

    await collaboration.save();

    res.json({ 
      success: true, 
      message: 'İşbirliği talebi gönderildi',
      data: collaboration
    });
  } catch (error) {
    console.error('Send collaboration request error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Accept collaboration request
router.post('/accept-request/:collaborationId', auth, async (req, res) => {
  try {
    const { collaborationId } = req.params;
    const teacherId = req.user.id;

    const collaboration = await TeacherCollaboration.findById(collaborationId);
    if (!collaboration) {
      return res.status(404).json({ 
        success: false, 
        message: 'İşbirliği bulunamadı' 
      });
    }

    // Find the collaborating teacher
    const collaboratingTeacher = collaboration.collaboratingTeachers.find(
      ct => ct.teacher.toString() === teacherId
    );

    if (!collaboratingTeacher) {
      return res.status(403).json({ 
        success: false, 
        message: 'Bu işbirliği talebini kabul etme yetkiniz yok' 
      });
    }

    if (collaboratingTeacher.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Bu talep zaten işlenmiş' 
      });
    }

    // Update status to accepted
    collaboratingTeacher.status = 'accepted';
    await collaboration.save();

    res.json({ 
      success: true, 
      message: 'İşbirliği talebi kabul edildi' 
    });
  } catch (error) {
    console.error('Accept collaboration request error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Reject collaboration request
router.post('/reject-request/:collaborationId', auth, async (req, res) => {
  try {
    const { collaborationId } = req.params;
    const teacherId = req.user.id;

    const collaboration = await TeacherCollaboration.findById(collaborationId);
    if (!collaboration) {
      return res.status(404).json({ 
        success: false, 
        message: 'İşbirliği bulunamadı' 
      });
    }

    // Find the collaborating teacher
    const collaboratingTeacher = collaboration.collaboratingTeachers.find(
      ct => ct.teacher.toString() === teacherId
    );

    if (!collaboratingTeacher) {
      return res.status(403).json({ 
        success: false, 
        message: 'Bu işbirliği talebini reddetme yetkiniz yok' 
      });
    }

    if (collaboratingTeacher.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Bu talep zaten işlenmiş' 
      });
    }

    // Update status to rejected
    collaboratingTeacher.status = 'rejected';
    await collaboration.save();

    res.json({ 
      success: true, 
      message: 'İşbirliği talebi reddedildi' 
    });
  } catch (error) {
    console.error('Reject collaboration request error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Add student to shared students
router.post('/add-shared-student', [
  auth,
  body('studentId').isMongoId(),
  body('collaborationId').isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { studentId, collaborationId } = req.body;
    const teacherId = req.user.id;

    const collaboration = await TeacherCollaboration.findById(collaborationId);
    if (!collaboration) {
      return res.status(404).json({ 
        success: false, 
        message: 'İşbirliği bulunamadı' 
      });
    }

    // Check if teacher has permission to add students
    const isMainTeacher = collaboration.mainTeacher.toString() === teacherId;
    const isCollaboratingTeacher = collaboration.collaboratingTeachers.some(
      ct => ct.teacher.toString() === teacherId && 
            ct.status === 'accepted' && 
            ct.permissions.canAddStudents
    );

    if (!isMainTeacher && !isCollaboratingTeacher) {
      return res.status(403).json({ 
        success: false, 
        message: 'Öğrenci ekleme yetkiniz yok' 
      });
    }

    // Check if student is already shared
    const isAlreadyShared = collaboration.sharedStudents.some(
      ss => ss.student.toString() === studentId
    );

    if (isAlreadyShared) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bu öğrenci zaten paylaşılmış' 
      });
    }

    // Add student to shared students
    collaboration.sharedStudents.push({
      student: studentId,
      addedBy: teacherId
    });

    await collaboration.save();

    res.json({ 
      success: true, 
      message: 'Öğrenci paylaşıldı' 
    });
  } catch (error) {
    console.error('Add shared student error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Remove student from shared students
router.delete('/remove-shared-student/:collaborationId/:studentId', auth, async (req, res) => {
  try {
    const { collaborationId, studentId } = req.params;
    const teacherId = req.user.id;

    const collaboration = await TeacherCollaboration.findById(collaborationId);
    if (!collaboration) {
      return res.status(404).json({ 
        success: false, 
        message: 'İşbirliği bulunamadı' 
      });
    }

    // Check if teacher has permission to remove students
    const isMainTeacher = collaboration.mainTeacher.toString() === teacherId;
    const isCollaboratingTeacher = collaboration.collaboratingTeachers.some(
      ct => ct.teacher.toString() === teacherId && 
            ct.status === 'accepted' && 
            ct.permissions.canDeleteStudents
    );

    if (!isMainTeacher && !isCollaboratingTeacher) {
      return res.status(403).json({ 
        success: false, 
        message: 'Öğrenci silme yetkiniz yok' 
      });
    }

    // Remove student from shared students
    collaboration.sharedStudents = collaboration.sharedStudents.filter(
      ss => ss.student.toString() !== studentId
    );

    await collaboration.save();

    res.json({ 
      success: true, 
      message: 'Öğrenci paylaşımı kaldırıldı' 
    });
  } catch (error) {
    console.error('Remove shared student error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Update collaboration permissions
router.put('/update-permissions/:collaborationId/:teacherId', [
  auth,
  body('permissions').isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { collaborationId, teacherId } = req.params;
    const { permissions } = req.body;
    const mainTeacherId = req.user.id;

    const collaboration = await TeacherCollaboration.findById(collaborationId);
    if (!collaboration) {
      return res.status(404).json({ 
        success: false, 
        message: 'İşbirliği bulunamadı' 
      });
    }

    // Check if user is main teacher
    if (collaboration.mainTeacher.toString() !== mainTeacherId) {
      return res.status(403).json({ 
        success: false, 
        message: 'İzin güncelleme yetkiniz yok' 
      });
    }

    // Find and update collaborating teacher permissions
    const collaboratingTeacher = collaboration.collaboratingTeachers.find(
      ct => ct.teacher.toString() === teacherId
    );

    if (!collaboratingTeacher) {
      return res.status(404).json({ 
        success: false, 
        message: 'İşbirliği öğretmeni bulunamadı' 
      });
    }

    collaboratingTeacher.permissions = { ...collaboratingTeacher.permissions, ...permissions };
    await collaboration.save();

    res.json({ 
      success: true, 
      message: 'İzinler güncellendi' 
    });
  } catch (error) {
    console.error('Update permissions error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Remove collaboration
router.delete('/remove-collaboration/:collaborationId/:teacherId', auth, async (req, res) => {
  try {
    const { collaborationId, teacherId } = req.params;
    const mainTeacherId = req.user.id;

    const collaboration = await TeacherCollaboration.findById(collaborationId);
    if (!collaboration) {
      return res.status(404).json({ 
        success: false, 
        message: 'İşbirliği bulunamadı' 
      });
    }

    // Check if user is main teacher
    if (collaboration.mainTeacher.toString() !== mainTeacherId) {
      return res.status(403).json({ 
        success: false, 
        message: 'İşbirliği kaldırma yetkiniz yok' 
      });
    }

    // Remove collaborating teacher
    collaboration.collaboratingTeachers = collaboration.collaboratingTeachers.filter(
      ct => ct.teacher.toString() !== teacherId
    );

    await collaboration.save();

    res.json({ 
      success: true, 
      message: 'İşbirliği kaldırıldı' 
    });
  } catch (error) {
    console.error('Remove collaboration error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

module.exports = router;

