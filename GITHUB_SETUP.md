# GitHub Repository Kurulum Rehberi 🐙

Bu rehber, Hedefly projesini GitHub'da nasıl kuracağınızı açıklar.

## 📋 Kurulum Adımları

### 1. GitHub Repository Oluşturma

1. **GitHub'a gidin**: [github.com](https://github.com)
2. **"New repository" butonuna tıklayın**
3. **Repository bilgilerini doldurun**:
   - Repository name: `hedefly`
   - Description: `Hedefly - Öğrenci Koçluğu Sistemi`
   - Visibility: `Public` (açık kaynak için)
   - Initialize with README: `❌` (zaten var)
   - Add .gitignore: `❌` (zaten var)
   - Choose a license: `MIT License`

### 2. Local Repository'yi GitHub'a Bağlama

```bash
# Remote repository'yi ekleyin
git remote add origin https://github.com/your-username/hedefly.git

# Main branch'i push edin
git branch -M main
git push -u origin main
```

### 3. Repository Ayarları

#### 3.1. Repository Settings
- **Settings > General**:
  - Repository name: `hedefly`
  - Description: `Hedefly - Öğrenci Koçluğu Sistemi`
  - Website: `https://hedefly.net`
  - Topics: `education`, `student-coaching`, `nextjs`, `mongodb`, `vercel`

#### 3.2. Branch Protection Rules
- **Settings > Branches**:
  - Add rule for `main` branch
  - Require pull request reviews before merging
  - Require status checks to pass before merging
  - Require branches to be up to date before merging

#### 3.3. GitHub Actions
- **Settings > Actions > General**:
  - Allow all actions and reusable workflows
  - Allow actions and reusable workflows from GitHub Marketplace

### 4. Secrets ve Environment Variables

#### 4.1. Repository Secrets
**Settings > Secrets and variables > Actions**:
```
VERCEL_TOKEN=your-vercel-token
ORG_ID=your-vercel-org-id
PROJECT_ID=your-vercel-project-id
SNYK_TOKEN=your-snyk-token (optional)
```

#### 4.2. Vercel Environment Variables
Vercel dashboard'da:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hedefly
JWT_SECRET=your-super-secret-jwt-key
NEXT_PUBLIC_API_URL=https://hedefly.net/api
```

### 5. GitHub Pages (Optional)

Eğer dokümantasyon sitesi istiyorsanız:
- **Settings > Pages**:
  - Source: `Deploy from a branch`
  - Branch: `gh-pages`
  - Folder: `/ (root)`

### 6. Issue Templates

Issue template'leri otomatik olarak çalışacak:
- Bug Report template
- Feature Request template
- Pull Request template

### 7. Labels Oluşturma

**Issues > Labels** bölümünde şu label'ları oluşturun:

#### Issue Labels
- `bug` - Bug report (kırmızı)
- `enhancement` - Feature request (yeşil)
- `documentation` - Documentation (mavi)
- `good first issue` - Beginner friendly (yeşil)
- `help wanted` - Community help needed (mor)
- `priority: high` - High priority (kırmızı)
- `priority: medium` - Medium priority (sarı)
- `priority: low` - Low priority (gri)

#### PR Labels
- `ready for review` - Ready for review (yeşil)
- `work in progress` - Still working (sarı)
- `needs testing` - Needs testing (turuncu)
- `breaking change` - Breaking change (kırmızı)

### 8. Milestones Oluşturma

**Issues > Milestones** bölümünde:
- `v1.0.0` - Initial release
- `v1.1.0` - Feature updates
- `v1.2.0` - Performance improvements

### 9. Project Boards

**Projects** bölümünde:
- **Hedefly Development** - Ana geliştirme board'u
- **Bug Tracking** - Bug takip board'u
- **Feature Requests** - Özellik istekleri board'u

### 10. Wiki ve Discussions

#### 10.1. Wiki
- **Settings > Features > Wiki**: Enable
- Ana sayfa: README.md içeriği
- API Documentation
- Deployment Guide
- Contributing Guide

#### 10.2. Discussions
- **Settings > Features > Discussions**: Enable
- Categories:
  - General
  - Q&A
  - Ideas
  - Show and tell

### 11. Code of Conduct

**Settings > General > Code of conduct**:
- Contributor Covenant Code of Conduct seçin

### 12. Security Policy

**Security > Security policy**:
- SECURITY.md dosyası oluşturun

## 🔧 Otomatik Kurulum Script'i

```bash
#!/bin/bash
# GitHub repository kurulum script'i

# Repository bilgilerini al
read -p "GitHub username: " GITHUB_USERNAME
read -p "Repository name: " REPO_NAME

# GitHub CLI ile repository oluştur
gh repo create $REPO_NAME --public --description "Hedefly - Öğrenci Koçluğu Sistemi"

# Remote ekle
git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git

# Push et
git branch -M main
git push -u origin main

echo "Repository başarıyla oluşturuldu!"
```

## 📊 Repository İstatistikleri

Kurulum sonrası kontrol edilecekler:
- [ ] README.md görünüyor
- [ ] License dosyası var
- [ ] .gitignore çalışıyor
- [ ] GitHub Actions çalışıyor
- [ ] Issue templates çalışıyor
- [ ] Labels oluşturuldu
- [ ] Branch protection aktif
- [ ] Secrets ayarlandı

## 🚀 Sonraki Adımlar

1. **Vercel'e deploy edin**
2. **Domain ayarlayın**
3. **MongoDB Atlas bağlantısını test edin**
4. **İlk kullanıcıları davet edin**
5. **Community oluşturun**

## 📞 Destek

Herhangi bir sorun yaşarsanız:
- GitHub Issues'da soru sorun
- Discussions'da tartışın
- Email: dev@hedefly.net

---

**Not**: Bu rehber sürekli güncellenmektedir. Önerileriniz için PR açabilirsiniz.
