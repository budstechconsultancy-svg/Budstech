const SMSService = require('../../../src/services/smsService')
const Location = require('../../../src/models/Location')

describe('SMSService', () => {
  let smsService

  beforeEach(() => {
    // Set mock mode for testing
    process.env.MOCK_SMS_PROVIDER = 'true'
    process.env.TWILIO_PHONE_NUMBER = '+1234567890'
    smsService = new SMSService()
  })

  describe('Phone Number Validation', () => {
    test('should validate correct phone numbers', () => {
      const validNumbers = [
        '+1234567890',
        '+44123456789',
        '+91234567890123',
        '1234567890'
      ]

      validNumbers.forEach(number => {
        expect(smsService.validatePhoneNumber(number)).toBe(true)
      })
    })

    test('should invalidate incorrect phone numbers', () => {
      const invalidNumbers = [
        '',
        '+',
        '12', // too short
        'abc123456789'
      ]

      invalidNumbers.forEach(number => {
        expect(smsService.validatePhoneNumber(number)).toBe(false)
      })
    })
  })

  describe('Phone Number Formatting', () => {
    test('should format phone numbers correctly', () => {
      const testCases = [
        { input: '1234567890', expected: '+1234567890' },
        { input: '+1234567890', expected: '+1234567890' },
        { input: '(123) 456-7890', expected: '+1234567890' },
        { input: '123-456-7890', expected: '+1234567890' },
        { input: '+1 (123) 456-7890', expected: '+11234567890' }
      ]

      testCases.forEach(({ input, expected }) => {
        expect(smsService.formatPhoneNumber(input)).toBe(expected)
      })
    })
  })

  describe('SMS Sending (Mock Mode)', () => {
    test('should send SMS in mock mode', async () => {
      const to = '+1234567890'
      const message = 'Test message'

      const result = await smsService.sendSMS(to, message)

      expect(result).toHaveProperty('sid')
      expect(result.sid).toContain('mock_')
      expect(result.to).toBe(to)
      expect(result.from).toBe(process.env.TWILIO_PHONE_NUMBER)
      expect(result.body).toBe(message)
      expect(result.status).toBe('sent')
      expect(result.dateCreated).toBeInstanceOf(Date)
    })

    test('should send location SMS', async () => {
      const to = '+1234567890'
      const location = new Location(40.7128, -74.0060, 'New York City')
      const customMessage = 'Here is my location'

      const result = await smsService.sendLocationSMS(to, location, customMessage)

      expect(result).toHaveProperty('sid')
      expect(result.body).toContain(customMessage)
      expect(result.body).toContain('https://maps.google.com/?q=40.7128,-74.006')
      expect(result.body).toContain('40.7128, -74.006')
    })

    test('should send location SMS with default message', async () => {
      const to = '+1234567890'
      const location = new Location(40.7128, -74.0060)

      const result = await smsService.sendLocationSMS(to, location)

      expect(result.body).toContain('Here is my current location:')
      expect(result.body).toContain('https://maps.google.com/?q=40.7128,-74.006')
    })
  })

  describe('Error Handling', () => {
    test('should handle Twilio errors in production mode', async () => {
      // This test checks that the service gracefully falls back to mock mode
      // when Twilio credentials are not configured
      const originalMockSetting = process.env.MOCK_SMS_PROVIDER
      process.env.MOCK_SMS_PROVIDER = 'false'
      delete process.env.TWILIO_ACCOUNT_SID
      delete process.env.TWILIO_AUTH_TOKEN
      
      const prodSmsService = new SMSService()
      
      // The service should have fallen back to mock mode
      expect(prodSmsService.mockMode).toBe(true)
      
      // And should still be able to send SMS in mock mode
      const result = await prodSmsService.sendSMS('+1234567890', 'test')
      expect(result.sid).toContain('mock_')

      // Restore mock mode
      process.env.MOCK_SMS_PROVIDER = originalMockSetting
    })
  })
})