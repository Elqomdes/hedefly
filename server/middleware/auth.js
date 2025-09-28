const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Erişim reddedildi. Token bulunamadı.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Geçersiz token.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Hesap deaktif.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Geçersiz token.' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin yetkisi gerekli.' });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ message: 'Yetkilendirme hatası.' });
  }
};

const teacherAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Öğretmen yetkisi gerekli.' });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ message: 'Yetkilendirme hatası.' });
  }
};

const studentAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'student' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Öğrenci yetkisi gerekli.' });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ message: 'Yetkilendirme hatası.' });
  }
};

module.exports = { auth, adminAuth, teacherAuth, studentAuth };
