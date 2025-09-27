const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const twilio = require('twilio');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Twilio client (only if credentials are properly configured)
let client = null;
if (process.env.TWILIO_ACCOUNT_SID && 
    process.env.TWILIO_AUTH_TOKEN && 
    process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
  try {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  } catch (error) {
    console.warn('⚠️  Failed to initialize Twilio client:', error.message);
  }
}

// In-memory storage for location data (in production, use a database)
const locationData = new Map();

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Send SMS endpoint
app.post('/api/send-sms', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({ 
        error: 'Phone number and message are required' 
      });
    }

    // Check if Twilio is properly configured
    if (!client) {
      return res.status(500).json({ 
        error: 'Twilio not configured. Please check your environment variables.' 
      });
    }

    // Generate a unique session ID for this location request
    const sessionId = Math.random().toString(36).substring(2, 15);
    
    // Create the location sharing link
    const locationLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/locate/${sessionId}`;
    
    // Append the link to the message
    const fullMessage = `${message}\n\nShare your location: ${locationLink}`;

    // Send SMS using Twilio
    const messageResult = await client.messages.create({
      body: fullMessage,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    // Store session info
    locationData.set(sessionId, {
      phoneNumber,
      originalMessage: message,
      sentAt: new Date().toISOString(),
      messageId: messageResult.sid,
      location: null,
      locationReceivedAt: null
    });

    res.json({
      success: true,
      sessionId,
      messageId: messageResult.sid,
      locationLink
    });

  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({ 
      error: 'Failed to send SMS',
      details: error.message 
    });
  }
});

// Receive location data endpoint
app.post('/api/location/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const { latitude, longitude, accuracy, timestamp } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ 
        error: 'Latitude and longitude are required' 
      });
    }

    const session = locationData.get(sessionId);
    if (!session) {
      return res.status(404).json({ 
        error: 'Session not found' 
      });
    }

    // Update session with location data
    session.location = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      accuracy: accuracy ? parseFloat(accuracy) : null,
      timestamp: timestamp || new Date().toISOString()
    };
    session.locationReceivedAt = new Date().toISOString();

    locationData.set(sessionId, session);

    res.json({
      success: true,
      message: 'Location received successfully'
    });

  } catch (error) {
    console.error('Error receiving location:', error);
    res.status(500).json({ 
      error: 'Failed to save location',
      details: error.message 
    });
  }
});

// Get location data endpoint
app.get('/api/location/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = locationData.get(sessionId);

    if (!session) {
      return res.status(404).json({ 
        error: 'Session not found' 
      });
    }

    res.json({
      sessionId,
      phoneNumber: session.phoneNumber,
      originalMessage: session.originalMessage,
      sentAt: session.sentAt,
      location: session.location,
      locationReceivedAt: session.locationReceivedAt
    });

  } catch (error) {
    console.error('Error retrieving location:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve location',
      details: error.message 
    });
  }
});

// Get all sessions endpoint (for admin/debugging)
app.get('/api/sessions', (req, res) => {
  try {
    const sessions = Array.from(locationData.entries()).map(([sessionId, data]) => ({
      sessionId,
      ...data
    }));

    res.json({
      sessions,
      total: sessions.length
    });

  } catch (error) {
    console.error('Error retrieving sessions:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve sessions',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Check Twilio configuration
  if (!process.env.TWILIO_ACCOUNT_SID || 
      !process.env.TWILIO_AUTH_TOKEN || 
      !process.env.TWILIO_PHONE_NUMBER ||
      !process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
    console.warn('⚠️  Twilio credentials not properly configured. SMS functionality will be disabled.');
    console.warn('   Please update your .env file with valid Twilio credentials.');
  } else if (client) {
    console.log('✅ Twilio credentials configured and client initialized');
  }
});

module.exports = app;