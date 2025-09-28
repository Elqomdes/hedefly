const express = require('express');
const { body, validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');
const { uploadSingle, uploadMultiple, uploadFields } = require('../middleware/upload');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Upload single file
router.post('/single', [
  auth,
  uploadSingle('file')
], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Dosya yüklenmedi'
      });
    }

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      url: `/uploads/${path.basename(path.dirname(req.file.path))}/${req.file.filename}`
    };

    res.json({
      success: true,
      message: 'Dosya başarıyla yüklendi',
      data: fileInfo
    });
  } catch (error) {
    console.error('Upload single file error:', error);
    res.status(500).json({
      success: false,
      message: 'Dosya yüklenirken bir hata oluştu'
    });
  }
});

// Upload multiple files
router.post('/multiple', [
  auth,
  uploadMultiple('files', 10)
], async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Dosya yüklenmedi'
      });
    }

    const filesInfo = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      url: `/uploads/${path.basename(path.dirname(file.path))}/${file.filename}`
    }));

    res.json({
      success: true,
      message: `${filesInfo.length} dosya başarıyla yüklendi`,
      data: filesInfo
    });
  } catch (error) {
    console.error('Upload multiple files error:', error);
    res.status(500).json({
      success: false,
      message: 'Dosyalar yüklenirken bir hata oluştu'
    });
  }
});

// Upload files for specific purpose
router.post('/assignment', [
  auth,
  uploadFields([
    { name: 'attachments', maxCount: 5 },
    { name: 'instructions', maxCount: 1 }
  ])
], async (req, res) => {
  try {
    const files = {
      attachments: [],
      instructions: null
    };

    if (req.files.attachments) {
      files.attachments = req.files.attachments.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        url: `/uploads/${path.basename(path.dirname(file.path))}/${file.filename}`
      }));
    }

    if (req.files.instructions && req.files.instructions.length > 0) {
      const file = req.files.instructions[0];
      files.instructions = {
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        url: `/uploads/${path.basename(path.dirname(file.path))}/${file.filename}`
      };
    }

    res.json({
      success: true,
      message: 'Ödev dosyaları başarıyla yüklendi',
      data: files
    });
  } catch (error) {
    console.error('Upload assignment files error:', error);
    res.status(500).json({
      success: false,
      message: 'Ödev dosyaları yüklenirken bir hata oluştu'
    });
  }
});

// Upload profile picture
router.post('/profile-picture', [
  auth,
  uploadSingle('profilePicture')
], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Profil resmi yüklenmedi'
      });
    }

    // Check if file is an image
    if (!req.file.mimetype.startsWith('image/')) {
      // Delete the uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Profil resmi bir resim dosyası olmalıdır'
      });
    }

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      url: `/uploads/${path.basename(path.dirname(req.file.path))}/${req.file.filename}`
    };

    res.json({
      success: true,
      message: 'Profil resmi başarıyla yüklendi',
      data: fileInfo
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Profil resmi yüklenirken bir hata oluştu'
    });
  }
});

// Upload exam files
router.post('/exam', [
  auth,
  uploadFields([
    { name: 'questions', maxCount: 10 },
    { name: 'instructions', maxCount: 1 },
    { name: 'resources', maxCount: 5 }
  ])
], async (req, res) => {
  try {
    const files = {
      questions: [],
      instructions: null,
      resources: []
    };

    if (req.files.questions) {
      files.questions = req.files.questions.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        url: `/uploads/${path.basename(path.dirname(file.path))}/${file.filename}`
      }));
    }

    if (req.files.instructions && req.files.instructions.length > 0) {
      const file = req.files.instructions[0];
      files.instructions = {
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        url: `/uploads/${path.basename(path.dirname(file.path))}/${file.filename}`
      };
    }

    if (req.files.resources) {
      files.resources = req.files.resources.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        url: `/uploads/${path.basename(path.dirname(file.path))}/${file.filename}`
      }));
    }

    res.json({
      success: true,
      message: 'Sınav dosyaları başarıyla yüklendi',
      data: files
    });
  } catch (error) {
    console.error('Upload exam files error:', error);
    res.status(500).json({
      success: false,
      message: 'Sınav dosyaları yüklenirken bir hata oluştu'
    });
  }
});

// Delete file
router.delete('/:filename', auth, async (req, res) => {
  try {
    const { filename } = req.params;
    const { subdir } = req.query;

    const filePath = path.join(__dirname, '../uploads', subdir || 'general', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Dosya bulunamadı'
      });
    }

    // Delete file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'Dosya başarıyla silindi'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Dosya silinirken bir hata oluştu'
    });
  }
});

// Get file info
router.get('/info/:filename', auth, async (req, res) => {
  try {
    const { filename } = req.params;
    const { subdir } = req.query;

    const filePath = path.join(__dirname, '../uploads', subdir || 'general', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Dosya bulunamadı'
      });
    }

    const stats = fs.statSync(filePath);
    const ext = path.extname(filename);
    const name = path.basename(filename, ext);

    const fileInfo = {
      filename: filename,
      name: name,
      extension: ext,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      url: `/uploads/${subdir || 'general'}/${filename}`
    };

    res.json({
      success: true,
      data: fileInfo
    });
  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({
      success: false,
      message: 'Dosya bilgisi alınırken bir hata oluştu'
    });
  }
});

// List files in directory
router.get('/list', auth, async (req, res) => {
  try {
    const { subdir = 'general', page = 1, limit = 20 } = req.query;
    const dirPath = path.join(__dirname, '../uploads', subdir);

    // Check if directory exists
    if (!fs.existsSync(dirPath)) {
      return res.json({
        success: true,
        data: {
          files: [],
          total: 0,
          page: parseInt(page),
          totalPages: 0
        }
      });
    }

    // Read directory
    const files = fs.readdirSync(dirPath);
    const fileStats = files.map(filename => {
      const filePath = path.join(dirPath, filename);
      const stats = fs.statSync(filePath);
      const ext = path.extname(filename);
      const name = path.basename(filename, ext);

      return {
        filename: filename,
        name: name,
        extension: ext,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        url: `/uploads/${subdir}/${filename}`
      };
    });

    // Sort by modified date (newest first)
    fileStats.sort((a, b) => new Date(b.modified) - new Date(a.modified));

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedFiles = fileStats.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        files: paginatedFiles,
        total: fileStats.length,
        page: parseInt(page),
        totalPages: Math.ceil(fileStats.length / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({
      success: false,
      message: 'Dosyalar listelenirken bir hata oluştu'
    });
  }
});

module.exports = router;

