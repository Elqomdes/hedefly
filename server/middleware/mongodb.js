const mongoose = require('mongoose');

// MongoDB bağlantı kontrolü middleware'i
const checkMongoDBConnection = (req, res, next) => {
  const connectionState = mongoose.connection.readyState;
  
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (connectionState !== 1) {
    console.error(`MongoDB bağlantı durumu: ${connectionState}`);
    
    // Bağlantı durumuna göre farklı mesajlar
    let message = 'Veritabanı bağlantısı yok. Lütfen daha sonra tekrar deneyin.';
    let statusCode = 503;
    
    if (connectionState === 2) {
      message = 'Veritabanına bağlanılıyor. Lütfen birkaç saniye bekleyin.';
      statusCode = 202; // Accepted - işlem kabul edildi ama henüz tamamlanmadı
    } else if (connectionState === 3) {
      message = 'Veritabanı bağlantısı kesiliyor. Lütfen daha sonra tekrar deneyin.';
    }
    
    return res.status(statusCode).json({
      success: false,
      message: message,
      error: 'DATABASE_CONNECTION_ERROR',
      connectionState: connectionState,
      retryAfter: connectionState === 2 ? 5 : 30 // Saniye cinsinden
    });
  }
  next();
};

// MongoDB bağlantısını yeniden kurma fonksiyonu
const reconnectMongoDB = async (retryCount = 0, maxRetries = 5) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log(`🔄 MongoDB yeniden bağlantı denemesi ${retryCount + 1}/${maxRetries}`);
      
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 15000,
        maxPoolSize: 10,
        serverSelectionRetryDelayMS: 5000,
        socketTimeoutMS: 45000,
        bufferMaxEntries: 0,
        bufferCommands: false,
        retryWrites: true,
        w: 'majority'
      });
      console.log('✅ MongoDB yeniden bağlandı');
    }
  } catch (error) {
    console.error(`❌ MongoDB yeniden bağlantı hatası (deneme ${retryCount + 1}):`, error.message);
    
    if (retryCount < maxRetries - 1) {
      const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
      console.log(`⏳ ${delay}ms sonra tekrar denenecek...`);
      setTimeout(() => {
        reconnectMongoDB(retryCount + 1, maxRetries);
      }, delay);
    } else {
      console.error('❌ MongoDB bağlantısı kurulamadı. Maksimum deneme sayısına ulaşıldı.');
    }
  }
};

module.exports = { checkMongoDBConnection, reconnectMongoDB };


