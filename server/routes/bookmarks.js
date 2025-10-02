const express = require('express');
const { getDb } = require('../models/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create bookmark
router.post('/', authenticateToken, (req, res) => {
  const { concept, mode, content } = req.body;

  if (!concept || !mode) {
    return res.status(400).json({ error: 'Concept and mode are required' });
  }

  const db = getDb();
  
  db.run(
    'INSERT INTO bookmarks (user_id, concept, mode, content) VALUES (?, ?, ?, ?)',
    [req.user.userId, concept, mode, content || ''],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.status(201).json({
        id: this.lastID,
        concept,
        mode,
        message: 'Bookmark saved successfully'
      });
    }
  );
});

// Get user bookmarks
router.get('/', authenticateToken, (req, res) => {
  const db = getDb();
  
  db.all(
    'SELECT * FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.userId],
    (err, bookmarks) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json(bookmarks);
    }
  );
});

// Delete bookmark
router.delete('/:id', authenticateToken, (req, res) => {
  const db = getDb();
  
  db.run(
    'DELETE FROM bookmarks WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Bookmark not found' });
      }

      res.json({ message: 'Bookmark deleted successfully' });
    }
  );
});

module.exports = router;
