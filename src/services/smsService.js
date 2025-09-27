const twilio = require('twilio')

class SMSService {
  constructor() {
    this.client = null
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER
    this.mockMode = process.env.MOCK_SMS_PROVIDER === 'true'
    
    if (!this.mockMode && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      )
    } else if (!this.mockMode) {
      console.warn('Twilio credentials not configured. Falling back to mock mode.')
      this.mockMode = true
    }
  }

  async sendSMS(to, message) {
    if (this.mockMode) {
      console.log(`[MOCK SMS] To: ${to}, Message: ${message}`)
      return {
        sid: 'mock_' + Date.now(),
        to,
        from: this.fromNumber,
        body: message,
        status: 'sent',
        dateCreated: new Date()
      }
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: to
      })

      return {
        sid: result.sid,
        to: result.to,
        from: result.from,
        body: result.body,
        status: result.status,
        dateCreated: result.dateCreated
      }
    } catch (error) {
      throw new Error(`Failed to send SMS: ${error.message}`)
    }
  }

  async sendLocationSMS(to, location, message = '') {
    const locationUrl = location.getGoogleMapsUrl()
    const customMessage = message || 'Here is my current location:'
    const fullMessage = `${customMessage}\n${locationUrl}\n\nCoordinates: ${location.latitude}, ${location.longitude}`

    return await this.sendSMS(to, fullMessage)
  }

  validatePhoneNumber(phoneNumber) {
    // Basic phone number validation - require at least 7 digits total
    const phoneRegex = /^\+?[1-9]\d{6,14}$/
    return phoneRegex.test(phoneNumber)
  }

  formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters except +
    let formatted = phoneNumber.replace(/[^\d+]/g, '')
    
    // Add + if not present and doesn't start with 00
    if (!formatted.startsWith('+') && !formatted.startsWith('00')) {
      formatted = '+' + formatted
    }
    
    return formatted
  }
}

module.exports = SMSService