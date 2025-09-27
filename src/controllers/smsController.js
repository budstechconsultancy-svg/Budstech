const SMSService = require('../services/smsService')
const Joi = require('joi')

const smsService = new SMSService()

// Validation schema
const sendSMSSchema = Joi.object({
  to: Joi.string().required(),
  message: Joi.string().min(1).max(1600).required() // SMS character limit
})

const smsController = {
  async sendSMS(req, res) {
    try {
      const { error, value } = sendSMSSchema.validate(req.body)
      
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.details.map(d => d.message)
        })
      }

      const { to, message } = value

      // Format and validate phone number
      const formattedPhone = smsService.formatPhoneNumber(to)
      
      if (!smsService.validatePhoneNumber(formattedPhone)) {
        return res.status(400).json({
          error: 'Invalid phone number format',
          providedNumber: to,
          formattedNumber: formattedPhone
        })
      }

      // Send SMS
      const result = await smsService.sendSMS(formattedPhone, message)

      res.status(200).json({
        success: true,
        messageId: result.sid,
        to: result.to,
        from: result.from,
        status: result.status,
        dateSent: result.dateCreated
      })
    } catch (error) {
      console.error('Error sending SMS:', error)
      res.status(500).json({
        error: 'Failed to send SMS',
        message: error.message
      })
    }
  }
}

module.exports = smsController