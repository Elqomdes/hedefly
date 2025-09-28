const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please check your .env file or environment configuration.');
  process.exit(1);
}

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://hedefly.net',
    'https://www.hedefly.net',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static('uploads'));

// Database connection
const connectDB = async () => {
  try {
    // MongoDB URI - environment'dan al
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error('❌ MONGODB_URI environment variable is required');
      process.exit(1);
    }
    
    console.log('🔄 MongoDB bağlantısı kuruluyor...');
    console.log('📍 URI:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Şifreyi gizle
    
    // Bağlantı event'lerini önce ayarla
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB bağlantı hatası:', err.message);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB bağlantısı kesildi');
      // Otomatik yeniden bağlantı
      const { reconnectMongoDB } = require('./middleware/mongodb');
      reconnectMongoDB();
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB yeniden bağlandı');
    });
    
    mongoose.connection.on('connected', () => {
      console.log('🔄 MongoDB bağlandı');
    });
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000, // 30 saniye timeout
      connectTimeoutMS: 30000, // 30 saniye bağlantı timeout
      maxPoolSize: 20, // Maintain up to 20 socket connections
      minPoolSize: 5, // Maintain at least 5 socket connections
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      serverSelectionRetryDelayMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
      retryWrites: true,
      w: 'majority',
      heartbeatFrequencyMS: 10000, // Send a ping every 10 seconds
      serverSelectionTimeoutMS: 30000 // How long to try to select a server
    });
    console.log('✅ MongoDB bağlantısı başarılı');
    
  } catch (err) {
    console.error('❌ MongoDB bağlantı hatası:', err.message);
    console.error('🔍 Hata detayları:', err);
    
    // Bağlantı hatası durumunda uygulamayı kapat
    console.log('🛑 Uygulama kapatılıyor...');
    process.exit(1);
  }
};

connectDB();

// Health check endpoint
app.get('/api/health', async (req, res) => {
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
  
  res.json({ 
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
});

// MongoDB test endpoint
app.get('/api/test-mongodb', async (req, res) => {
  try {
    // Test MongoDB connection
    const connectionState = mongoose.connection.readyState;
    
    if (connectionState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB bağlantısı yok',
        connectionState: connectionState
      });
    }
    
    // Test database operations
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    
    res.json({
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
});

// MongoDB bağlantı kontrolü middleware'ini import et
const { checkMongoDBConnection } = require('./middleware/mongodb');

// Routes - MongoDB bağlantı kontrolü ile
app.use('/api/auth', checkMongoDBConnection, require('./routes/auth'));
app.use('/api/teachers', checkMongoDBConnection, require('./routes/teachers'));
app.use('/api/students', checkMongoDBConnection, require('./routes/students'));
app.use('/api/classes', checkMongoDBConnection, require('./routes/classes'));
app.use('/api/assignments', checkMongoDBConnection, require('./routes/assignments'));
app.use('/api/exams', checkMongoDBConnection, require('./routes/exams'));
app.use('/api/analytics', checkMongoDBConnection, require('./routes/analytics'));
app.use('/api/contact', checkMongoDBConnection, require('./routes/contact'));
app.use('/api/teacher-collaboration', checkMongoDBConnection, require('./routes/teacherCollaboration'));
app.use('/api/plans', checkMongoDBConnection, require('./routes/plans'));
app.use('/api/goals', checkMongoDBConnection, require('./routes/goals'));
app.use('/api/assignment-evaluations', checkMongoDBConnection, require('./routes/assignmentEvaluations'));
app.use('/api/upload', checkMongoDBConnection, require('./routes/upload'));
app.use('/api/password-reset', checkMongoDBConnection, require('./routes/passwordReset'));
app.use('/api/email-verification', checkMongoDBConnection, require('./routes/emailVerification'));
app.use('/api/admin', checkMongoDBConnection, require('./routes/admin'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Sunucu hatası', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Bir hata oluştu' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint bulunamadı' });
});

const PORT = process.env.PORT || 5001;

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portunda çalışıyor`);
  console.log(`🌐 API URL: http://localhost:${PORT}/api`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} zaten kullanımda. Lütfen farklı bir port kullanın.`);
  } else {
    console.error('❌ Server hatası:', err);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});
