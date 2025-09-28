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
  }
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    const mongodbStatus = mongoose.connection.readyState;
    const mongodbStatusText = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    }[mongodbStatus] || 'unknown';
    
    let dbHealth = 'unhealthy';
    let dbResponseTime = null;
    
    if (mongodbStatus === 1) {
      try {
        const start = Date.now();
        await mongoose.connection.db.admin().ping();
        dbResponseTime = Date.now() - start;
        dbHealth = 'healthy';
      } catch (error) {
        dbHealth = 'unhealthy';
      }
    }
    
    res.status(200).json({ 
      status: mongodbStatus === 1 ? 'OK' : 'ERROR',
      timestamp: new Date().toISOString(),
      mongodb: {
        status: mongodbStatusText,
        readyState: mongodbStatus,
        health: dbHealth,
        responseTime: dbResponseTime,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message 
    });
  }
}
