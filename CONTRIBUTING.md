# Katkıda Bulunma Rehberi 🤝

Hedefly projesine katkıda bulunmak istediğiniz için teşekkürler! Bu rehber, projeye nasıl katkıda bulunabileceğinizi açıklamaktadır.

## 📋 İçindekiler

- [Kodlama Standartları](#kodlama-standartları)
- [Geliştirme Süreci](#geliştirme-süreci)
- [Pull Request Süreci](#pull-request-süreci)
- [Issue Oluşturma](#issue-oluşturma)
- [Test Etme](#test-etme)
- [Dokümantasyon](#dokümantasyon)

## 🎯 Katkı Türleri

- 🐛 Bug düzeltmeleri
- ✨ Yeni özellikler
- 📚 Dokümantasyon iyileştirmeleri
- 🎨 UI/UX iyileştirmeleri
- ⚡ Performans optimizasyonları
- 🧪 Test yazma

## 🛠️ Geliştirme Ortamı Kurulumu

### Gereksinimler
- Node.js 18+
- npm veya yarn
- MongoDB Atlas hesabı
- Git

### Kurulum Adımları

1. **Repository'yi fork edin**
2. **Local'e klonlayın**
```bash
git clone https://github.com/your-username/hedefly.git
cd hedefly
```

3. **Bağımlılıkları yükleyin**
```bash
npm install
cd client
npm install
cd ..
```

4. **Environment değişkenlerini ayarlayın**
```bash
cd client
cp .env.local.example .env.local
# .env.local dosyasını düzenleyin
```

5. **Development server'ı başlatın**
```bash
cd client
npm run dev
```

## 📝 Kodlama Standartları

### JavaScript/TypeScript
- **ESLint** kurallarına uyun
- **Prettier** ile kod formatlayın
- **TypeScript** kullanın (mümkünse)
- Anlamlı değişken ve fonksiyon isimleri kullanın
- JSDoc yorumları ekleyin

### React/Next.js
- **Functional Components** kullanın
- **Hooks** kullanın (class components yerine)
- **Props** için TypeScript interface'leri tanımlayın
- **Error Boundaries** kullanın

### CSS/Styling
- **Tailwind CSS** kullanın
- Custom CSS'den kaçının
- Responsive design uygulayın
- Dark mode desteği ekleyin

### Git
- Anlamlı commit mesajları yazın
- Conventional Commits kullanın:
  - `feat:` yeni özellik
  - `fix:` bug düzeltmesi
  - `docs:` dokümantasyon
  - `style:` kod formatı
  - `refactor:` kod yeniden düzenleme
  - `test:` test ekleme
  - `chore:` build süreci

## 🔄 Geliştirme Süreci

### 1. Issue Oluşturma
- Mevcut issue'ları kontrol edin
- Yeni issue oluştururken detaylı açıklama yapın
- Label'ları doğru kullanın

### 2. Branch Oluşturma
```bash
git checkout -b feature/amazing-feature
# veya
git checkout -b fix/bug-description
```

### 3. Geliştirme
- Küçük, odaklanmış commit'ler yapın
- Test yazın
- Dokümantasyonu güncelleyin

### 4. Test Etme
```bash
# Linting
cd client
npm run lint

# Type checking
npx tsc --noEmit

# Build test
npm run build
```

## 📤 Pull Request Süreci

### PR Oluşturmadan Önce
- [ ] Kodunuzu test ettiniz
- [ ] Linting hataları yok
- [ ] TypeScript hataları yok
- [ ] Build başarılı
- [ ] Dokümantasyon güncellendi

### PR Açıklaması
```markdown
## Değişiklik Açıklaması
- Ne değiştirildi?
- Neden değiştirildi?
- Nasıl test edildi?

## Screenshots (varsa)
- Önce/sonra görüntüleri

## Checklist
- [ ] Kod review edildi
- [ ] Testler yazıldı
- [ ] Dokümantasyon güncellendi
```

### Review Süreci
- En az 1 kişi review etmeli
- CI/CD pipeline'ı geçmeli
- Conflict'ler çözülmeli

## 🐛 Bug Raporlama

### Bug Raporu Şablonu
```markdown
## Bug Açıklaması
Kısa ve net açıklama

## Adımlar
1. '...' sayfasına git
2. '...' butonuna tıkla
3. Hata oluştu

## Beklenen Davranış
Ne olması gerekiyordu?

## Gerçek Davranış
Ne oldu?

## Screenshots
Varsa ekleyin

## Environment
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 91]
- Version: [e.g. 1.0.0]
```

## ✨ Feature İsteği

### Feature Request Şablonu
```markdown
## Feature Açıklaması
Ne istiyorsunuz?

## Problem
Hangi problemi çözüyor?

## Çözüm
Nasıl çözüyor?

## Alternatifler
Başka çözümler var mı?

## Ek Bilgiler
Ekran görüntüleri, mockup'lar vb.
```

## 🧪 Test Etme

### Unit Tests
```bash
cd client
npm run test
```

### E2E Tests
```bash
cd client
npm run test:e2e
```

### Manual Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Mobile (responsive)
- [ ] Dark mode
- [ ] Light mode

## 📚 Dokümantasyon

### Kod Dokümantasyonu
- JSDoc yorumları
- README güncellemeleri
- API dokümantasyonu

### Commit Mesajları
```
feat(auth): add password reset functionality

- Add forgot password page
- Add reset password API endpoint
- Add email verification
- Update user model with reset tokens

Closes #123
```

## 🏷️ Label'lar

### Issue Labels
- `bug` - Bug report
- `enhancement` - Feature request
- `documentation` - Documentation
- `good first issue` - Beginner friendly
- `help wanted` - Community help needed
- `priority: high` - High priority
- `priority: medium` - Medium priority
- `priority: low` - Low priority

### PR Labels
- `ready for review` - Ready for review
- `work in progress` - Still working
- `needs testing` - Needs testing
- `breaking change` - Breaking change

## 📞 İletişim

- **Discord**: [Hedefly Community](https://discord.gg/hedefly)
- **Email**: dev@hedefly.net
- **GitHub Discussions**: [Discussions](https://github.com/your-username/hedefly/discussions)

## 🙏 Teşekkürler

Katkıda bulunan herkese teşekkürler! Projeyi daha iyi hale getirmek için çalıştığınız için minnettarız.

---

**Not**: Bu rehber sürekli güncellenmektedir. Önerileriniz için issue açabilirsiniz.
