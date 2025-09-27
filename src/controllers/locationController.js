const LocationService = require('../services/locationService')
const SMSService = require('../services/smsService')
const Joi = require('joi')

const locationService = new LocationService()
const smsService = new SMSService()

// Validation schemas
const shareLocationSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  address: Joi.string().optional().allow(''),
  phoneNumbers: Joi.array().items(Joi.string()).optional(),
  message: Joi.string().optional().allow(''),
  expirationMinutes: Joi.number().min(1).max(1440).default(60) // 1 minute to 24 hours
})

const shareLocationController = {
  async shareLocation(req, res) {
    try {
      const { error, value } = shareLocationSchema.validate(req.body)
      
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.details.map(d => d.message)
        })
      }

      const { latitude, longitude, address, phoneNumbers, message, expirationMinutes } = value

      // Create location
      const location = locationService.createLocation(latitude, longitude, address)
      
      // Share location
      const shareInfo = locationService.shareLocation(location, expirationMinutes)

      // Send SMS if phone numbers provided
      const smsResults = []
      if (phoneNumbers && phoneNumbers.length > 0) {
        for (const phoneNumber of phoneNumbers) {
          try {
            const formattedPhone = smsService.formatPhoneNumber(phoneNumber)
            
            if (!smsService.validatePhoneNumber(formattedPhone)) {
              smsResults.push({
                phoneNumber,
                success: false,
                error: 'Invalid phone number format'
              })
              continue
            }

            const smsResult = await smsService.sendLocationSMS(formattedPhone, location, message)
            smsResults.push({
              phoneNumber: formattedPhone,
              success: true,
              messageId: smsResult.sid
            })
          } catch (smsError) {
            smsResults.push({
              phoneNumber,
              success: false,
              error: smsError.message
            })
          }
        }
      }

      res.status(201).json({
        success: true,
        location: location.toJSON(),
        share: shareInfo,
        smsResults: smsResults.length > 0 ? smsResults : undefined
      })
    } catch (error) {
      console.error('Error sharing location:', error)
      res.status(500).json({
        error: 'Failed to share location',
        message: error.message
      })
    }
  },

  async getSharedLocation(req, res) {
    try {
      const { shareId } = req.params
      
      if (!shareId) {
        return res.status(400).json({
          error: 'Share ID is required'
        })
      }

      const shareData = locationService.getSharedLocation(shareId)
      
      res.json({
        success: true,
        ...shareData
      })
    } catch (error) {
      console.error('Error getting shared location:', error)
      
      if (error.message.includes('not found') || error.message.includes('expired')) {
        return res.status(404).json({
          error: error.message
        })
      }
      
      res.status(500).json({
        error: 'Failed to retrieve shared location',
        message: error.message
      })
    }
  }
}

module.exports = shareLocationController