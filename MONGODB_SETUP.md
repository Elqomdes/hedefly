# MongoDB Kurulum ve Yapılandırma Rehberi

## 🚀 Hızlı Başlangıç

### 1. MongoDB Kurulumu

#### Windows için:
1. [MongoDB Community Server](https://www.mongodb.com/try/download/community) indirin
2. Kurulum sırasında "Install MongoDB as a Service" seçeneğini işaretleyin
3. Kurulum tamamlandıktan sonra MongoDB servisini başlatın

#### Manuel Kurulum:
```bash
# MongoDB'yi manuel olarak başlatmak için:
mongod --dbpath "C:\data\db"
```

### 2. Proje Yapılandırması

#### Otomatik Kurulum:
```bash
npm run setup-mongodb
```

#### Manuel Yapılandırma:
1. `.env` dosyasını kontrol edin:
```env
MONGODB_URI=mongodb://localhost:27017/hedefly
```

2. Server'ı başlatın:
```bash
npm run server
```

3. Health check yapın:
```bash
npm run health-check
```

### 3. Sorun Giderme

#### MongoDB Bağlantı Hatası:
- MongoDB servisinin çalıştığından emin olun
- Port 27017'nin kullanımda olduğunu kontrol edin
- `.env` dosyasındaki `MONGODB_URI` değerini kontrol edin

#### Health Check:
```bash
curl http://localhost:5000/api/health
```

Beklenen yanıt:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-09-28T09:35:17.953Z"
}
```

### 4. Geliştirme Modu

MongoDB olmadan da geliştirme yapabilirsiniz:
- Server MongoDB bağlantısı olmadan çalışacak
- API endpoint'leri uygun hata mesajları döndürecek
- Client tarafında kullanıcı dostu hata mesajları gösterilecek

### 5. Üretim Ortamı

Üretim ortamında:
- MongoDB Atlas veya başka bir MongoDB servisi kullanın
- `.env` dosyasında doğru `MONGODB_URI` değerini ayarlayın
- Güvenlik ayarlarını yapılandırın

## 🔧 Ek Komutlar

```bash
# MongoDB kurulum kontrolü
npm run setup-mongodb

# Health check
npm run health-check

# Server'ı başlat
npm run server

# Full development mode
npm run dev
```

## 📝 Notlar

- MongoDB bağlantısı olmadığında server çalışmaya devam eder
- Tüm API endpoint'leri MongoDB bağlantı kontrolü yapar
- Client tarafında 503 hataları için özel error handling vardır
- Health check endpoint'i ile bağlantı durumu kontrol edilebilir


