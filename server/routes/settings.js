const express = require('express');
const { getDb } = require('../models/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user settings
router.get('/', authenticateToken, (req, res) => {
  const db = getDb();
  
  db.get(
    'SELECT * FROM settings WHERE user_id = ?',
    [req.user.userId],
    (err, settings) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!settings) {
        // Create default settings if not exists
        db.run(
          'INSERT INTO settings (user_id) VALUES (?)',
          [req.user.userId],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to create settings' });
            }
            res.json({
              tts_provider: 'ElevenLabs',
              speaking_rate: 'medium',
              pitch: 'normal'
            });
          }
        );
      } else {
        res.json(settings);
      }
    }
  );
});

// Update user settings
router.put('/', authenticateToken, (req, res) => {
  const { tts_provider, speaking_rate, pitch } = req.body;
  const db = getDb();

  db.run(
    `UPDATE settings 
     SET tts_provider = COALESCE(?, tts_provider),
         speaking_rate = COALESCE(?, speaking_rate),
         pitch = COALESCE(?, pitch)
     WHERE user_id = ?`,
    [tts_provider, speaking_rate, pitch, req.user.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ message: 'Settings updated successfully' });
    }
  );
});

module.exports = router;
