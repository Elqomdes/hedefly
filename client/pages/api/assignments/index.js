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
    
    const userId = authenticate(req);
    const { page = 1, limit = 10, subject, type, status } = req.query;
    
    const Assignment = require('../../server/models/Assignment');
    const User = require('../../server/models/User');
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: 'Geçersiz kullanıcı' });
    }

    let query = { isActive: true };
    
    if (user.role === 'teacher') {
      query.teacher = userId;
    } else if (user.role === 'student') {
      query.students = userId;
    }

    if (subject) query.subject = subject;
    if (type) query.type = type;
    if (status === 'graded') {
      query['submissions.isGraded'] = true;
    } else if (status === 'ungraded') {
      query['submissions.isGraded'] = { $ne: true };
    }

    const assignments = await Assignment.find(query)
      .populate('students', 'firstName lastName studentId email')
      .populate('class', 'name subject')
      .populate('teacher', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Assignment.countDocuments(query);

    res.status(200).json({
      assignments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get assignments error:', error);
    if (error.message === 'Token bulunamadı' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Geçersiz token' });
    }
    res.status(500).json({ message: 'Sunucu hatası' });
  }
}
