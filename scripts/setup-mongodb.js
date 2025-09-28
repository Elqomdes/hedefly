const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 MongoDB Kurulum Scripti');
console.log('==========================');

// MongoDB kurulum kontrolü
function checkMongoDBInstallation() {
  return new Promise((resolve) => {
    exec('mongod --version', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ MongoDB kurulu değil veya PATH\'te yok');
        console.log('📥 MongoDB kurulumu için: https://www.mongodb.com/try/download/community');
        resolve(false);
      } else {
        console.log('✅ MongoDB kurulu:', stdout.split('\n')[0]);
        resolve(true);
      }
    });
  });
}

// MongoDB servisini başlat
function startMongoDB() {
  return new Promise((resolve) => {
    console.log('🚀 MongoDB servisini başlatıyor...');
    
    // Windows için MongoDB servisini başlat
    exec('net start MongoDB', (error, stdout, stderr) => {
      if (error) {
        console.log('⚠️ MongoDB servisi zaten çalışıyor veya manuel başlatılması gerekiyor');
        console.log('💡 Manuel başlatma: mongod --dbpath "C:\\data\\db"');
      } else {
        console.log('✅ MongoDB servisi başlatıldı');
      }
      resolve();
    });
  });
}

// .env dosyasını kontrol et
function checkEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  
  if (fs.existsSync(envPath)) {
    console.log('✅ .env dosyası mevcut');
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('MONGODB_URI=')) {
      console.log('✅ MONGODB_URI tanımlanmış');
    } else {
      console.log('⚠️ MONGODB_URI tanımlanmamış');
    }
  } else {
    console.log('❌ .env dosyası bulunamadı');
    console.log('📝 env.example dosyasını .env olarak kopyalayın');
  }
}

// Ana fonksiyon
async function setupMongoDB() {
  try {
    console.log('\n1. MongoDB kurulum kontrolü...');
    const isInstalled = await checkMongoDBInstallation();
    
    console.log('\n2. .env dosyası kontrolü...');
    checkEnvFile();
    
    if (isInstalled) {
      console.log('\n3. MongoDB servisini başlatma...');
      await startMongoDB();
    }
    
    console.log('\n📋 Sonraki adımlar:');
    console.log('1. MongoDB\'yi manuel olarak başlatın: mongod');
    console.log('2. Projeyi çalıştırın: npm run dev');
    console.log('3. Health check: http://localhost:5000/api/health');
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
  }
}

setupMongoDB();


