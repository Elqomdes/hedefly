# Vercel Environment Variables Setup

Vercel dashboard'da aşağıdaki environment variables'ları ekleyin:

## Required Environment Variables

### MongoDB
```
MONGODB_URI=mongodb+srv://hedefly32_db_user:elqomdes7419638*@hedefly32.px22byg.mongodb.net/hedefly?retryWrites=true&w=majority&appName=Hedefly32
```

### JWT Secret
```
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
```

### API URL
```
NEXT_PUBLIC_API_URL=https://hedefly.net/api
```

### Email Configuration (Optional)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### File Upload (Optional)
```
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

## Vercel Dashboard Setup Steps

1. Vercel dashboard'a gidin
2. Projenizi seçin
3. Settings > Environment Variables'a gidin
4. Yukarıdaki değişkenleri ekleyin
5. Production, Preview ve Development için işaretleyin
6. Deploy edin

## MongoDB Atlas Setup

1. MongoDB Atlas'ta cluster oluşturun
2. Database user oluşturun
3. Network access'te 0.0.0.0/0 IP'sini ekleyin (tüm IP'lere izin)
4. Connection string'i kopyalayın
5. Vercel environment variables'a ekleyin

## Domain Setup

1. Vercel'de custom domain ekleyin
2. DNS ayarlarını yapın
3. SSL certificate otomatik olarak oluşturulacak
