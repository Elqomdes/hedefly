# Hedefly Vercel Deployment Rehberi

## 🚀 Vercel'e Deploy Etme Adımları

### 1. Vercel Hesabı Oluştur
- [vercel.com](https://vercel.com) adresine gidin
- GitHub hesabınızla giriş yapın

### 2. Projeyi Vercel'e Bağla
```bash
# Vercel CLI'yi yükleyin
npm i -g vercel

# Proje klasöründe
cd client
vercel

# Veya GitHub repository'yi Vercel'e import edin
```

### 3. Environment Variables Ayarla
Vercel dashboard'da Settings > Environment Variables'a gidin:

```
MONGODB_URI=mongodb+srv://hedefly32_db_user:elqomdes7419638*@hedefly32.px22byg.mongodb.net/hedefly?retryWrites=true&w=majority&appName=Hedefly32
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
NEXT_PUBLIC_API_URL=https://hedefly.net/api
```

### 4. Build Ayarları
- Framework: Next.js
- Build Command: `cd client && npm run build`
- Output Directory: `client/.next`
- Install Command: `npm install && cd client && npm install`

### 5. Domain Ayarları
- Custom domain ekleyin: `hedefly.net`
- DNS ayarlarını yapın
- SSL otomatik olarak aktif olacak

## 🔧 Önemli Notlar

### MongoDB Atlas Ayarları
1. Network Access'te `0.0.0.0/0` IP'sini ekleyin
2. Database user oluşturun
3. Connection string'i Vercel'e ekleyin

### API Routes
- Tüm API routes `/api/` altında çalışır
- Serverless functions olarak çalışır
- 30 saniye timeout limiti var

### Static Files
- Uploads klasörü Vercel'de çalışmaz
- Cloudinary veya AWS S3 kullanın
- Veya Vercel Blob Storage kullanın

## 🐛 Sorun Giderme

### Build Hataları
```bash
cd client
npm run build
```

### Environment Variables
- Vercel dashboard'da kontrol edin
- Production, Preview, Development için ayrı ayrı ayarlayın

### MongoDB Bağlantı Hatası
- Connection string'i kontrol edin
- Network access ayarlarını kontrol edin
- Database user permissions'ı kontrol edin

## 📊 Monitoring

### Vercel Analytics
- Vercel dashboard'da Analytics bölümü
- Performance metrikleri
- Error tracking

### MongoDB Atlas Monitoring
- Atlas dashboard'da metrics
- Connection monitoring
- Performance insights

## 🔒 Security

### JWT Secret
- Güçlü bir secret key kullanın
- Production'da farklı key kullanın

### CORS
- Sadece gerekli domain'lere izin verin
- Production'da wildcard (*) kullanmayın

### MongoDB
- Database user'ı sadece gerekli permissions ile oluşturun
- Network access'i sınırlayın

## 🚀 Deployment Sonrası

1. Domain'in çalıştığını test edin
2. API endpoints'leri test edin
3. MongoDB bağlantısını test edin
4. User registration/login'i test edin
5. Performance'ı kontrol edin

## 📞 Destek

Herhangi bir sorun yaşarsanız:
- Vercel logs'ları kontrol edin
- MongoDB Atlas logs'ları kontrol edin
- Browser console'da hataları kontrol edin
