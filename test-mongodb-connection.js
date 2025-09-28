const mongoose = require('mongoose');

// MongoDB bağlantısını test et
const testMongoDBConnection = async () => {
  try {
    console.log('🔄 MongoDB bağlantısı test ediliyor...');
    
    const mongoUri = 'mongodb+srv://hedefly32_db_user:elqomdes7419638*@hedefly32.px22byg.mongodb.net/hedefly?retryWrites=true&w=majority&appName=Hedefly32';
    
    console.log('📍 URI:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Şifreyi gizle
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      serverSelectionRetryDelayMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      bufferCommands: false,
      retryWrites: true,
      w: 'majority'
    });
    
    console.log('✅ MongoDB bağlantısı başarılı!');
    console.log('📊 Bağlantı durumu:', mongoose.connection.readyState);
    console.log('🏠 Host:', mongoose.connection.host);
    console.log('🔌 Port:', mongoose.connection.port);
    console.log('📁 Database:', mongoose.connection.name);
    
    // Basit bir test işlemi
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📚 Koleksiyonlar:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('✅ Bağlantı kapatıldı');
    
  } catch (error) {
    console.error('❌ MongoDB bağlantı hatası:', error.message);
    console.error('🔍 Hata detayları:', error);
    process.exit(1);
  }
};

// Test'i çalıştır
testMongoDBConnection();

