const express = require('express')
const cors = require('cors')
require('dotenv').config()

const locationController = require('./controllers/locationController')
const smsController = require('./controllers/smsController')

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

app.post('/share-location', locationController.shareLocation)
app.post('/send-sms', smsController.sendSMS)
app.get('/location/:shareId', locationController.getSharedLocation)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`SMS Location Sharing App running on port ${PORT}`)
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  })
}

module.exports = app