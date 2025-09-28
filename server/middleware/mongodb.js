const mongoose = require('mongoose');

// MongoDB bağlantı kontrolü middleware'i
const checkMongoDBConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Veritabanı bağlantısı yok. Lütfen daha sonra tekrar deneyin.',
      error: 'DATABASE_CONNECTION_ERROR'
    });
  }
  next();
};

module.exports = { checkMongoDBConnection };


