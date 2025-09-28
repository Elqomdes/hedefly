const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { checkMongoDBConnection } = require('../middleware/mongodb');

const router = express.Router();

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('role').isIn(['teacher', 'student'])
], checkMongoDBConnection, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }


    const { email, password, firstName, lastName, role, phone, grade, school, parentName, parentPhone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu email adresi zaten kullanılıyor.' });
    }

    // Create user
    const userData = {
      email,
      password,
      firstName,
      lastName,
      role,
      phone: phone || '',
      grade: grade || '',
      school: school || '',
      parentName: parentName || '',
      parentPhone: parentPhone || ''
    };

    const user = new User(userData);
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Kullanıcı başarıyla oluşturuldu',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        studentId: user.studentId
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], checkMongoDBConnection, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;


    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Geçersiz email veya şifre.' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Geçersiz email veya şifre.' });
    }

    if (!user.isActive) {
      return res.status(400).json({ message: 'Hesabınız deaktif durumda.' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Giriş başarılı',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        studentId: user.studentId,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {

    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        role: req.user.role,
        studentId: req.user.studentId,
        profileImage: req.user.profileImage,
        phone: req.user.phone,
        grade: req.user.grade,
        school: req.user.school,
        parentName: req.user.parentName,
        parentPhone: req.user.parentPhone,
        subjects: req.user.subjects,
        experience: req.user.experience,
        bio: req.user.bio
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Change password
router.put('/change-password', auth, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isMatch = await req.user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mevcut şifre yanlış.' });
    }

    // Update password
    req.user.password = newPassword;
    await req.user.save();

    res.json({ message: 'Şifre başarıyla güncellendi' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Update profile
router.put('/profile', [
  auth,
  body('firstName').optional().notEmpty().trim(),
  body('lastName').optional().notEmpty().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('bio').optional().trim(),
  body('school').optional().trim(),
  body('subject').optional().trim(),
  body('experience').optional().trim(),
  body('location').optional().trim(),
  body('website').optional().isURL(),
  body('socialMedia').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = req.body;
    
    // Check if email is being changed and if it's already taken
    if (updates.email && updates.email !== req.user.email) {
      const existingUser = await User.findOne({ email: updates.email });
      if (existingUser) {
        return res.status(400).json({ message: 'Bu email adresi zaten kullanılıyor' });
      }
    }

    // Update user profile
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        req.user[key] = updates[key];
      }
    });

    await req.user.save();

    res.json({ 
      message: 'Profil başarıyla güncellendi',
      user: req.user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Update notification settings
router.put('/notification-settings', [
  auth,
  body('emailNotifications').optional().isBoolean(),
  body('pushNotifications').optional().isBoolean(),
  body('assignmentReminders').optional().isBoolean(),
  body('examReminders').optional().isBoolean(),
  body('goalReminders').optional().isBoolean(),
  body('weeklyReports').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const notificationSettings = req.body;
    
    // Update notification settings
    req.user.notificationSettings = {
      ...req.user.notificationSettings,
      ...notificationSettings
    };

    await req.user.save();

    res.json({ 
      message: 'Bildirim ayarları güncellendi',
      user: req.user
    });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Upload profile picture
router.post('/upload-profile-picture', [
  auth,
  require('../middleware/upload').uploadSingle('profilePicture')
], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Profil resmi yüklenmedi' });
    }

    // Check if file is an image
    if (!req.file.mimetype.startsWith('image/')) {
      // Delete the uploaded file
      const fs = require('fs');
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Profil resmi bir resim dosyası olmalıdır' });
    }

    // Update user profile picture
    req.user.profilePicture = `/uploads/${path.basename(path.dirname(req.file.path))}/${req.file.filename}`;
    await req.user.save();

    res.json({ 
      message: 'Profil resmi güncellendi',
      user: req.user
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Create test accounts (only in development)
router.post('/create-test-accounts', async (req, res) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ message: 'Bu işlem sadece development modunda kullanılabilir' });
    }


    // Clear existing test accounts
    await User.deleteMany({
      email: { $in: ['teacher@test.com', 'student@test.com'] }
    });

    // Create teacher account
    const teacher = new User({
      email: 'teacher@test.com',
      password: '123456',
      firstName: 'Ahmet',
      lastName: 'Öğretmen',
      role: 'teacher',
      phone: '0555 123 45 67',
      subjects: ['Matematik', 'Fizik'],
      experience: 5,
      bio: 'Deneyimli matematik ve fizik öğretmeni',
      isEmailVerified: true
    });
    await teacher.save();

    // Create student account
    const student = new User({
      email: 'student@test.com',
      password: '123456',
      firstName: 'Ayşe',
      lastName: 'Öğrenci',
      role: 'student',
      phone: '0555 987 65 43',
      grade: '11',
      school: 'Test Lisesi',
      parentName: 'Mehmet Öğrenci',
      parentPhone: '0555 111 22 33',
      isEmailVerified: true
    });
    await student.save();

    // Link student to teacher
    student.teachers.push(teacher._id);
    await student.save();

    res.json({
      message: 'Test hesapları başarıyla oluşturuldu',
      accounts: {
        teacher: {
          email: 'teacher@test.com',
          password: '123456',
          role: 'teacher'
        },
        student: {
          email: 'student@test.com',
          password: '123456',
          role: 'student'
        }
      }
    });
  } catch (error) {
    console.error('Create test accounts error:', error);
    res.status(500).json({ message: 'Test hesapları oluşturulurken bir hata oluştu' });
  }
});

module.exports = router;
