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

// Auth middleware
const authenticate = (req) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    throw new Error('Token bulunamadı');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded.userId;
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    const teacherId = authenticate(req);
    
    const User = require('../../server/models/User');
    const Class = require('../../server/models/Class');
    
    // Check if user is teacher
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(403).json({ message: 'Öğretmen yetkisi gerekli' });
    }

    // Get classes where teacher is the main teacher or collaborating teacher
    const classes = await Class.find({
      $or: [
        { teacher: teacherId },
        { collaboratingTeachers: teacherId }
      ],
      isActive: true
    }).populate('students', 'firstName lastName studentId email grade school');

    // Get all unique students
    const allStudents = [];
    classes.forEach(cls => {
      cls.students.forEach(student => {
        if (!allStudents.find(s => s._id.toString() === student._id.toString())) {
          allStudents.push(student);
        }
      });
    });

    res.status(200).json({
      success: true,
      students: allStudents,
      classes: classes.map(cls => ({
        id: cls._id,
        name: cls.name,
        subject: cls.subject,
        grade: cls.grade,
        studentCount: cls.students.length
      }))
    });

  } catch (error) {
    console.error('Get students error:', error);
    if (error.message === 'Token bulunamadı' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Geçersiz token' });
    }
    res.status(500).json({ message: 'Sunucu hatası' });
  }
}
