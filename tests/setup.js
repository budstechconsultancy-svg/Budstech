// Jest setup file
// This file runs before each test suite

// Set up environment variables for testing
process.env.NODE_ENV = 'test'
process.env.MOCK_SMS_PROVIDER = 'true'
process.env.TWILIO_PHONE_NUMBER = '+1234567890'
process.env.PORT = '3001' // Use different port for testing

// Increase timeout for integration tests
jest.setTimeout(10000)

// Global test setup
beforeAll(() => {
  console.log('Starting test suite...')
})

afterAll(() => {
  console.log('Test suite completed.')
})