const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const router = express.Router();

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'noreply@edulyedu.com',
      pass: process.env.SMTP_PASS || ''
    }
  });
};

// Send verification email
router.post('/send-verification', [
  body('email').isEmail().normalizeEmail().withMessage('Geçerli bir email adresi girin')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Bu email adresi ile kayıtlı kullanıcı bulunamadı' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email adresi zaten doğrulanmış' });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Save verification token to user
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpiry = verificationTokenExpiry;
    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.SMTP_USER || 'noreply@edulyedu.com',
      to: email,
      subject: 'Hedefly - Email Doğrulama',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Email Adresinizi Doğrulayın</h2>
          <p>Merhaba ${user.firstName},</p>
          <p>Hedefly hesabınızı oluşturduğunuz için teşekkür ederiz! Email adresinizi doğrulamak için aşağıdaki bağlantıya tıklayın:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Email Adresimi Doğrula</a>
          </div>
          <p>Bu bağlantı 24 saat geçerlidir.</p>
          <p>Eğer bu hesabı siz oluşturmadıysanız, bu emaili görmezden gelebilirsiniz.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">Bu email otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ 
      message: 'Doğrulama emaili gönderildi',
      email: email
    });

  } catch (error) {
    console.error('Send verification email error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Verify email
router.post('/verify-email', [
  body('token').notEmpty().withMessage('Verification token gerekli')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { token } = req.body;

    // Find user with valid verification token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'Geçersiz veya süresi dolmuş verification token' 
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save();

    res.json({ 
      success: true,
      message: 'Email adresi başarıyla doğrulandı',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });

  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Verify email token (GET)
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        valid: false, 
        message: 'Geçersiz veya süresi dolmuş verification token' 
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save();

    res.json({ 
      valid: true, 
      success: true,
      message: 'Email adresi başarıyla doğrulandı',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });

  } catch (error) {
    console.error('Verify email token error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Resend verification email
router.post('/resend-verification', [
  body('email').isEmail().normalizeEmail().withMessage('Geçerli bir email adresi girin')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Bu email adresi ile kayıtlı kullanıcı bulunamadı' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email adresi zaten doğrulanmış' });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Save verification token to user
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpiry = verificationTokenExpiry;
    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.SMTP_USER || 'noreply@edulyedu.com',
      to: email,
      subject: 'Hedefly - Email Doğrulama (Tekrar)',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Email Adresinizi Doğrulayın</h2>
          <p>Merhaba ${user.firstName},</p>
          <p>Email doğrulama talebinde bulundunuz. Aşağıdaki bağlantıya tıklayarak email adresinizi doğrulayabilirsiniz:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Email Adresimi Doğrula</a>
          </div>
          <p>Bu bağlantı 24 saat geçerlidir.</p>
          <p>Eğer bu talebi siz yapmadıysanız, bu emaili görmezden gelebilirsiniz.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">Bu email otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ 
      message: 'Doğrulama emaili tekrar gönderildi',
      email: email
    });

  } catch (error) {
    console.error('Resend verification email error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;

