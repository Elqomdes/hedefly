const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const Exam = require('../models/Exam');
const Class = require('../models/Class');
const Contact = require('../models/Contact');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Admin middleware - check if user is admin
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin yetkisi gerekli' });
  }
  next();
};

// Get all users (admin only)
router.get('/users', [auth, adminAuth], async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status, search } = req.query;

    const query = {};
    
    if (role) query.role = role;
    if (status) query.isActive = status === 'active';
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Get single user (admin only)
router.get('/users/:id', [auth, adminAuth], async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Update user status (admin only)
router.put('/users/:id/status', [auth, adminAuth], async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Geçersiz durum' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    }

    user.isActive = status === 'active';
    await user.save();

    res.json({ success: true, message: 'Kullanıcı durumu güncellendi' });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Delete user (admin only)
router.delete('/users/:id', [auth, adminAuth], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    }

    // Soft delete - mark as inactive instead of hard delete
    user.isActive = false;
    user.deletedAt = new Date();
    await user.save();

    res.json({ success: true, message: 'Kullanıcı silindi' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Get admin statistics
router.get('/stats', [auth, adminAuth], async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalAssignments = await Assignment.countDocuments();
    const totalClasses = await Class.countDocuments();
    const totalContacts = await Contact.countDocuments();

    // User growth data (last 12 months)
    const userGrowth = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthUsers = await User.countDocuments({
        createdAt: { $gte: monthStart, $lte: monthEnd }
      });
      
      userGrowth.push({
        month: date.toLocaleDateString('tr-TR', { month: 'short' }),
        users: monthUsers
      });
    }

    // Role distribution
    const roleDistribution = [
      { role: 'Öğretmen', count: totalTeachers, color: '#3B82F6' },
      { role: 'Öğrenci', count: totalStudents, color: '#10B981' }
    ];

    // Monthly activity (last 6 months)
    const monthlyActivity = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthAssignments = await Assignment.countDocuments({
        createdAt: { $gte: monthStart, $lte: monthEnd }
      });
      
      const monthExams = await Exam.countDocuments({
        createdAt: { $gte: monthStart, $lte: monthEnd }
      });
      
      monthlyActivity.push({
        month: date.toLocaleDateString('tr-TR', { month: 'short' }),
        assignments: monthAssignments,
        exams: monthExams
      });
    }

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalTeachers,
          totalStudents,
          activeUsers,
          totalAssignments,
          totalClasses,
          totalContacts
        },
        userGrowth,
        roleDistribution,
        monthlyActivity
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Get contact applications
router.get('/contacts', [auth, adminAuth], async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    const query = {};
    
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Contact.countDocuments(query);

    res.json({
      success: true,
      data: {
        contacts,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Update contact status
router.put('/contacts/:id/status', [auth, adminAuth], async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Geçersiz durum' });
    }

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Başvuru bulunamadı' });
    }

    contact.status = status;
    contact.updatedAt = new Date();
    await contact.save();

    res.json({ success: true, message: 'Başvuru durumu güncellendi' });
  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Delete contact
router.delete('/contacts/:id', [auth, adminAuth], async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Başvuru bulunamadı' });
    }

    await Contact.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Başvuru silindi' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

module.exports = router;

