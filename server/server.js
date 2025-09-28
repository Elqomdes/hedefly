const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
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
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // 5 saniye timeout
        connectTimeoutMS: 10000, // 10 saniye bağlantı timeout
      });
      console.log('✅ MongoDB bağlantısı başarılı');
      
      // Bağlantı durumunu kontrol et
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB bağlantı hatası:', err);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB bağlantısı kesildi');
      });
      
      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB yeniden bağlandı');
      });
      
    } else {
      console.log('⚠️ MONGODB_URI tanımlanmamış, MongoDB olmadan devam ediliyor...');
    }
  } catch (err) {
    console.error('❌ MongoDB bağlantı hatası:', err.message);
    console.log('⚠️ MongoDB olmadan devam ediliyor...');
  }
};

connectDB();

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'ok',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/students', require('./routes/students'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/exams', require('./routes/exams'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/teacher-collaboration', require('./routes/teacherCollaboration'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/assignment-evaluations', require('./routes/assignmentEvaluations'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/password-reset', require('./routes/passwordReset'));
app.use('/api/email-verification', require('./routes/emailVerification'));
app.use('/api/admin', require('./routes/admin'));

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

const PORT = process.env.PORT || 5000;

// Function to start server with port fallback
const startServer = (port) => {
  // Port limit check
  if (port > 65535) {
    console.error('Mevcut port aralığında boş port bulunamadı. Lütfen sisteminizi yeniden başlatın.');
    process.exit(1);
  }

  const server = app.listen(port, () => {
    console.log(`Server ${port} portunda çalışıyor`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} zaten kullanımda. ${port + 1} portunu deniyor...`);
      startServer(port + 1);
    } else {
      console.error('Server hatası:', err);
      process.exit(1);
    }
  });
};

startServer(PORT);
