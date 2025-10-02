const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDb } = require('../models/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 }, // 10MB default
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|txt|md/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only document files are allowed'));
    }
  }
});

// Upload document
router.post('/upload', authenticateToken, upload.single('document'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const db = getDb();
  
  db.run(
    'INSERT INTO documents (user_id, filename, filepath) VALUES (?, ?, ?)',
    [req.user.userId, req.file.originalname, req.file.path],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.status(201).json({
        id: this.lastID,
        filename: req.file.originalname,
        message: 'Document uploaded successfully'
      });
    }
  );
});

// Get user documents
router.get('/', authenticateToken, (req, res) => {
  const db = getDb();
  
  db.all(
    'SELECT id, filename, uploaded_at FROM documents WHERE user_id = ? ORDER BY uploaded_at DESC',
    [req.user.userId],
    (err, documents) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json(documents);
    }
  );
});

// Delete document
router.delete('/:id', authenticateToken, (req, res) => {
  const db = getDb();
  
  db.get(
    'SELECT * FROM documents WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.userId],
    (err, document) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // Delete file from filesystem
      if (fs.existsSync(document.filepath)) {
        fs.unlinkSync(document.filepath);
      }

      // Delete from database
      db.run(
        'DELETE FROM documents WHERE id = ?',
        [req.params.id],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          res.json({ message: 'Document deleted successfully' });
        }
      );
    }
  );
});

module.exports = router;
