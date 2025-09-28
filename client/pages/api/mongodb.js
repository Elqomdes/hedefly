import mongoose from 'mongoose';

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
    
    const connectionState = mongoose.connection.readyState;
    
    if (connectionState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB bağlantısı yok',
        connectionState: connectionState
      });
    }
    
    // Test database operations
    const User = require('../../server/models/User');
    const userCount = await User.countDocuments();
    
    res.status(200).json({
      success: true,
      message: 'MongoDB bağlantısı başarılı',
      connectionState: connectionState,
      userCount: userCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('MongoDB test error:', error);
    res.status(500).json({
      success: false,
      message: 'MongoDB test hatası',
      error: error.message
    });
  }
}
