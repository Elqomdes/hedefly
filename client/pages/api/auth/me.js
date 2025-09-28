import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// MongoDB bağlantısını kur
const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      maxPoolSize: 1,
      serverSelectionRetryDelayMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      bufferCommands: false,
      retryWrites: true,
      w: 'majority'
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token bulunamadı' });
    }

    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // User model'ini import et
    const User = require('../../server/models/User');
    
    // Kullanıcıyı bul
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Geçersiz token' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Hesap deaktif' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        phone: user.phone,
        grade: user.grade,
        school: user.school,
        parentName: user.parentName,
        parentPhone: user.parentPhone,
        profileImage: user.profileImage,
        subjects: user.subjects,
        experience: user.experience,
        bio: user.bio,
        studentId: user.studentId,
        notificationSettings: user.notificationSettings
      }
    });

  } catch (error) {
    console.error('Me endpoint error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Geçersiz token' });
    }
    res.status(500).json({ message: 'Sunucu hatası' });
  }
}
