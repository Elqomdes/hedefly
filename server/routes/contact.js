const express = require('express');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const User = require('../models/User');
const { adminAuth, auth } = require('../middleware/auth');

const router = express.Router();

// Create contact request
router.post('/', [
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('phone').notEmpty().trim(),
  body('school').notEmpty().trim(),
  body('subject').notEmpty().trim(),
  body('experience').isNumeric(),
  body('message').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, school, subject, experience, message } = req.body;

    // Create contact request
    const contact = new Contact({
      name,
      email,
      phone,
      school,
      subject,
      experience: parseInt(experience),
      message
    });

    await contact.save();

    // Send email notification to admin
    try {
      const transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'iletisim@edulyedu.com',
        subject: 'Yeni Öğretmen Başvurusu - Hedefly',
        html: `
          <h2>Yeni Öğretmen Başvurusu</h2>
          <p><strong>Ad Soyad:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Telefon:</strong> ${phone}</p>
          <p><strong>Okul:</strong> ${school}</p>
          <p><strong>Branş:</strong> ${subject}</p>
          <p><strong>Deneyim:</strong> ${experience} yıl</p>
          <p><strong>Mesaj:</strong></p>
          <p>${message}</p>
          <hr>
          <p>Bu başvuruyu admin panelinden değerlendirebilirsiniz.</p>
        `
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Email gönderme hatası:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      message: 'Başvurunuz başarıyla alındı. En kısa sürede size dönüş yapacağız.',
      contactId: contact._id
    });
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Get all contact requests (admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = {};
    if (status) query.status = status;

    const contacts = await Contact.find(query)
      .populate('processedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Contact.countDocuments(query);

    res.json({
      contacts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Get single contact request
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate('processedBy', 'firstName lastName');

    if (!contact) {
      return res.status(404).json({ message: 'Başvuru bulunamadı.' });
    }

    res.json(contact);
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Update contact request status
router.put('/:id/status', adminAuth, [
  body('status').isIn(['pending', 'approved', 'rejected']),
  body('adminNotes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ message: 'Başvuru bulunamadı.' });
    }

    contact.status = status;
    contact.adminNotes = adminNotes || '';
    contact.processedAt = new Date();
    contact.processedBy = req.user._id;

    await contact.save();

    // If approved, create teacher account
    if (status === 'approved') {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: contact.email });
        if (existingUser) {
          return res.status(400).json({ 
            message: 'Bu email adresi zaten kullanılıyor.',
            contact 
          });
        }

        // Create teacher account
        const teacher = new User({
          email: contact.email,
          password: 'temp123456', // Temporary password, should be changed on first login
          firstName: contact.name.split(' ')[0],
          lastName: contact.name.split(' ').slice(1).join(' '),
          role: 'teacher',
          phone: contact.phone,
          subjects: [contact.subject],
          experience: contact.experience,
          bio: `Okul: ${contact.school}`
        });

        await teacher.save();

        // Send welcome email
        try {
          const transporter = nodemailer.createTransporter({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS
            }
          });

          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: contact.email,
            subject: 'Hedefly Öğrenci Koçluğu Sistemi - Hoş Geldiniz!',
            html: `
              <h2>Hoş Geldiniz!</h2>
              <p>Merhaba ${contact.name},</p>
              <p>Hedefly Öğrenci Koçluğu sistemine başvurunuz onaylandı!</p>
              <p><strong>Giriş Bilgileriniz:</strong></p>
              <p>Email: ${contact.email}</p>
              <p>Şifre: temp123456</p>
              <p><em>Lütfen ilk girişinizde şifrenizi değiştirin.</em></p>
              <p>Sisteme giriş yapmak için: <a href="${process.env.FRONTEND_URL}/login">${process.env.FRONTEND_URL}/login</a></p>
              <hr>
              <p>İyi çalışmalar!</p>
              <p>Hedefly Ekibi</p>
            `
          };

          await transporter.sendMail(mailOptions);
        } catch (emailError) {
          console.error('Welcome email gönderme hatası:', emailError);
        }

        res.json({
          message: 'Başvuru onaylandı ve öğretmen hesabı oluşturuldu',
          contact,
          teacher: {
            id: teacher._id,
            email: teacher.email,
            firstName: teacher.firstName,
            lastName: teacher.lastName
          }
        });
      } catch (createError) {
        console.error('Create teacher error:', createError);
        res.status(500).json({ 
          message: 'Başvuru güncellendi ancak öğretmen hesabı oluşturulamadı',
          contact 
        });
      }
    } else {
      res.json({
        message: 'Başvuru durumu güncellendi',
        contact
      });
    }
  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Delete contact request
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ message: 'Başvuru bulunamadı.' });
    }

    await Contact.findByIdAndDelete(id);

    res.json({ message: 'Başvuru silindi' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Get contact statistics
router.get('/stats/overview', adminAuth, async (req, res) => {
  try {
    const total = await Contact.countDocuments();
    const pending = await Contact.countDocuments({ status: 'pending' });
    const approved = await Contact.countDocuments({ status: 'approved' });
    const rejected = await Contact.countDocuments({ status: 'rejected' });

    // Recent applications (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recent = await Contact.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Subject distribution
    const subjectStats = await Contact.aggregate([
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      total,
      pending,
      approved,
      rejected,
      recent,
      subjectStats
    });
  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;

