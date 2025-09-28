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
    
    const studentId = authenticate(req);
    
    const Assignment = require('../../server/models/Assignment');
    const Exam = require('../../server/models/Exam');
    const Plan = require('../../server/models/Plan');
    const Goal = require('../../server/models/Goal');
    
    // Get recent assignments
    const recentAssignments = await Assignment.find({
      students: studentId,
      isActive: true
    })
    .populate('teacher', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(5);

    // Get recent exams
    const recentExams = await Exam.find({
      assignedTo: { $elemMatch: { student: studentId } },
      isActive: true
    })
    .populate('teacher', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(5);

    // Get active plans
    const activePlans = await Plan.find({
      student: studentId,
      status: 'active'
    })
    .populate('teacher', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(5);

    // Calculate assignment statistics
    const totalAssignments = await Assignment.countDocuments({
      students: studentId,
      isActive: true
    });

    const completedAssignments = await Assignment.countDocuments({
      students: studentId,
      isActive: true,
      'submissions.student': studentId,
      'submissions.isGraded': true
    });

    const assignmentCompletionRate = totalAssignments > 0 ? 
      Math.round((completedAssignments / totalAssignments) * 100) : 0;

    // Calculate exam statistics
    const totalExams = await Exam.countDocuments({
      assignedTo: { $elemMatch: { student: studentId } },
      isActive: true
    });

    const completedExams = await Exam.countDocuments({
      assignedTo: { $elemMatch: { student: studentId } },
      isActive: true,
      'results.student': studentId
    });

    const examCompletionRate = totalExams > 0 ? 
      Math.round((completedExams / totalExams) * 100) : 0;

    // Get active goals
    const activeGoals = await Goal.find({
      student: studentId,
      status: 'active'
    }).limit(5);

    res.status(200).json({
      success: true,
      data: {
        recentAssignments,
        recentExams,
        activePlans,
        activeGoals,
        statistics: {
          totalAssignments,
          completedAssignments,
          assignmentCompletionRate,
          totalExams,
          completedExams,
          examCompletionRate
        }
      }
    });

  } catch (error) {
    console.error('Student dashboard error:', error);
    if (error.message === 'Token bulunamadı' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Geçersiz token' });
    }
    res.status(500).json({ message: 'Sunucu hatası' });
  }
}
