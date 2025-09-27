const request = require('supertest')
const app = require('../../src/index')

describe('SMS Location Sharing App Integration Tests', () => {
  beforeEach(() => {
    // Ensure mock mode is enabled for tests
    process.env.MOCK_SMS_PROVIDER = 'true'
    process.env.TWILIO_PHONE_NUMBER = '+1234567890'
  })

  describe('Health Check', () => {
    test('GET /health should return OK status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)

      expect(response.body).toHaveProperty('status', 'OK')
      expect(response.body).toHaveProperty('timestamp')
    })
  })

  describe('Location Sharing API', () => {
    test('POST /share-location should share location successfully', async () => {
      const locationData = {
        latitude: 40.7128,
        longitude: -74.0060,
        address: 'New York City',
        expirationMinutes: 60
      }

      const response = await request(app)
        .post('/share-location')
        .send(locationData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.location).toHaveProperty('latitude', 40.7128)
      expect(response.body.location).toHaveProperty('longitude', -74.0060)
      expect(response.body.location).toHaveProperty('address', 'New York City')
      expect(response.body.share).toHaveProperty('shareId')
      expect(response.body.share).toHaveProperty('shareUrl')
      expect(response.body.share).toHaveProperty('expiresAt')
    })

    test('POST /share-location should share location and send SMS', async () => {
      const locationData = {
        latitude: 40.7128,
        longitude: -74.0060,
        phoneNumbers: ['+1234567890', '+0987654321'],
        message: 'Here is my location!'
      }

      const response = await request(app)
        .post('/share-location')
        .send(locationData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.smsResults).toHaveLength(2)
      expect(response.body.smsResults[0]).toHaveProperty('success', true)
      expect(response.body.smsResults[0]).toHaveProperty('messageId')
    })

    test('POST /share-location should handle invalid coordinates', async () => {
      const locationData = {
        latitude: 91, // Invalid latitude
        longitude: -74.0060
      }

      const response = await request(app)
        .post('/share-location')
        .send(locationData)
        .expect(400)

      expect(response.body).toHaveProperty('error', 'Validation error')
    })

    test('POST /share-location should handle missing required fields', async () => {
      const locationData = {
        latitude: 40.7128
        // Missing longitude
      }

      const response = await request(app)
        .post('/share-location')
        .send(locationData)
        .expect(400)

      expect(response.body).toHaveProperty('error', 'Validation error')
    })

    test('GET /location/:shareId should retrieve shared location', async () => {
      // First share a location
      const locationData = {
        latitude: 40.7128,
        longitude: -74.0060,
        address: 'New York City'
      }

      const shareResponse = await request(app)
        .post('/share-location')
        .send(locationData)
        .expect(201)

      const shareId = shareResponse.body.share.shareId

      // Then retrieve it
      const retrieveResponse = await request(app)
        .get(`/location/${shareId}`)
        .expect(200)

      expect(retrieveResponse.body.success).toBe(true)
      expect(retrieveResponse.body.location).toHaveProperty('latitude', 40.7128)
      expect(retrieveResponse.body.location).toHaveProperty('longitude', -74.0060)
      expect(retrieveResponse.body.location).toHaveProperty('address', 'New York City')
      expect(retrieveResponse.body).toHaveProperty('accessCount', 1)
    })

    test('GET /location/:shareId should return 404 for non-existent share', async () => {
      const response = await request(app)
        .get('/location/nonexistent')
        .expect(404)

      expect(response.body).toHaveProperty('error', 'Location share not found')
    })
  })

  describe('SMS API', () => {
    test('POST /send-sms should send SMS successfully', async () => {
      const smsData = {
        to: '+1234567890',
        message: 'Test message'
      }

      const response = await request(app)
        .post('/send-sms')
        .send(smsData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body).toHaveProperty('messageId')
      expect(response.body).toHaveProperty('to', '+1234567890')
      expect(response.body).toHaveProperty('status', 'sent')
    })

    test('POST /send-sms should handle invalid phone number', async () => {
      const smsData = {
        to: 'invalid-phone',
        message: 'Test message'
      }

      const response = await request(app)
        .post('/send-sms')
        .send(smsData)
        .expect(400)

      expect(response.body).toHaveProperty('error', 'Invalid phone number format')
    })

    test('POST /send-sms should handle missing message', async () => {
      const smsData = {
        to: '+1234567890'
        // Missing message
      }

      const response = await request(app)
        .post('/send-sms')
        .send(smsData)
        .expect(400)

      expect(response.body).toHaveProperty('error', 'Validation error')
    })
  })

  describe('Error Handling', () => {
    test('should return 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/non-existent-endpoint')
        .expect(404)

      expect(response.body).toHaveProperty('error', 'Endpoint not found')
    })

    test('should handle invalid JSON', async () => {
      const response = await request(app)
        .post('/share-location')
        .send('invalid-json')
        .set('Content-Type', 'application/json')
        .expect(500) // Express returns 500 for JSON parse errors by default

      expect(response.body).toHaveProperty('error')
    })
  })
})