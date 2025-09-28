# Hedefly.net Domain Kurulum Rehberi

## 🌐 Domain Ayarları

### 1. Vercel'de Custom Domain Ekleme

1. **Vercel Dashboard'a gidin**
2. **Projenizi seçin**
3. **Settings > Domains** bölümüne gidin
4. **Add Domain** butonuna tıklayın
5. **hedefly.net** ve **www.hedefly.net** domainlerini ekleyin

### 2. DNS Ayarları

Domain sağlayıcınızda (GoDaddy, Namecheap, vs.) şu DNS kayıtlarını ekleyin:

```
Type: A
Name: @
Value: 76.76.19.61

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

### 3. SSL Sertifikası

Vercel otomatik olarak SSL sertifikası sağlayacaktır. Domain eklendikten sonra birkaç dakika bekleyin.

## 🔧 Environment Variables

### Production Environment Variables (Vercel Dashboard)

```env
NEXT_PUBLIC_API_URL=https://hedefly.net/api
NODE_ENV=production
MONGODB_URI=mongodb+srv://hedefly32_db_user:elqomdes7419638*@hedefly32.px22byg.mongodb.net/?retryWrites=true&w=majority&appName=Hedefly32
```

### Server Environment Variables

```env
MONGODB_URI=mongodb+srv://hedefly32_db_user:elqomdes7419638*@hedefly32.px22byg.mongodb.net/?retryWrites=true&w=majority&appName=Hedefly32
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://hedefly.net
```

## 🚀 Deployment Adımları

1. **Kodu GitHub'a push edin**
2. **Vercel otomatik deploy yapacak**
3. **Custom domain'i ekleyin**
4. **DNS ayarlarını yapın**
5. **SSL sertifikasının aktif olmasını bekleyin**

## ✅ Test Etme

Domain aktif olduktan sonra:

- `https://hedefly.net` - Ana site
- `https://hedefly.net/api/test` - MongoDB bağlantı testi
- `https://www.hedefly.net` - www subdomain

## 🔒 Güvenlik Notları

- MongoDB Atlas'ta IP whitelist'e hedefly.net'i ekleyin
- JWT_SECRET'ı güçlü bir değerle değiştirin
- Environment variables'ları güvenli tutun
- HTTPS zorunlu kullanın

## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. Vercel logs'ları kontrol edin
2. DNS propagation'ı bekleyin (24-48 saat)
3. Browser cache'ini temizleyin

