const Location = require('../../../src/models/Location')

describe('Location Model', () => {
  describe('Constructor', () => {
    test('should create location with valid coordinates', () => {
      const location = new Location(40.7128, -74.0060, 'New York City')
      
      expect(location.latitude).toBe(40.7128)
      expect(location.longitude).toBe(-74.0060)
      expect(location.address).toBe('New York City')
      expect(location.id).toBeDefined()
      expect(location.timestamp).toBeInstanceOf(Date)
    })

    test('should create location without address', () => {
      const location = new Location(40.7128, -74.0060)
      
      expect(location.address).toBe('')
    })

    test('should generate unique IDs', () => {
      const location1 = new Location(40.7128, -74.0060)
      const location2 = new Location(40.7128, -74.0060)
      
      expect(location1.id).not.toBe(location2.id)
    })
  })

  describe('Validation', () => {
    test('should validate correct coordinates', () => {
      const location = new Location(40.7128, -74.0060)
      expect(location.isValid()).toBe(true)
    })

    test('should invalidate latitude out of range', () => {
      const location1 = new Location(91, -74.0060)
      const location2 = new Location(-91, -74.0060)
      
      expect(location1.isValid()).toBe(false)
      expect(location2.isValid()).toBe(false)
    })

    test('should invalidate longitude out of range', () => {
      const location1 = new Location(40.7128, 181)
      const location2 = new Location(40.7128, -181)
      
      expect(location1.isValid()).toBe(false)
      expect(location2.isValid()).toBe(false)
    })

    test('should invalidate non-numeric coordinates', () => {
      const location1 = new Location('invalid', -74.0060)
      const location2 = new Location(40.7128, 'invalid')
      
      expect(location1.isValid()).toBe(false)
      expect(location2.isValid()).toBe(false)
    })
  })

  describe('Methods', () => {
    test('should generate Google Maps URL', () => {
      const location = new Location(40.7128, -74.0060)
      const url = location.getGoogleMapsUrl()
      
      expect(url).toBe('https://maps.google.com/?q=40.7128,-74.006')
    })

    test('should convert to JSON', () => {
      const location = new Location(40.7128, -74.0060, 'New York City')
      const json = location.toJSON()
      
      expect(json).toHaveProperty('id')
      expect(json).toHaveProperty('latitude', 40.7128)
      expect(json).toHaveProperty('longitude', -74.0060)
      expect(json).toHaveProperty('address', 'New York City')
      expect(json).toHaveProperty('timestamp')
    })

    test('should calculate distance between locations', () => {
      const nyc = new Location(40.7128, -74.0060)
      const la = new Location(34.0522, -118.2437)
      
      const distance = nyc.getDistance(la)
      
      // Distance between NYC and LA is approximately 3944 km
      expect(distance).toBeGreaterThan(3900)
      expect(distance).toBeLessThan(4000)
    })

    test('should calculate zero distance for same location', () => {
      const location1 = new Location(40.7128, -74.0060)
      const location2 = new Location(40.7128, -74.0060)
      
      const distance = location1.getDistance(location2)
      
      expect(distance).toBe(0)
    })

    test('should convert to string', () => {
      const location = new Location(40.7128, -74.0060, 'New York City')
      const str = location.toString()
      
      expect(str).toBe('Location: 40.7128, -74.006 (New York City)')
    })

    test('should convert to string without address', () => {
      const location = new Location(40.7128, -74.0060)
      const str = location.toString()
      
      expect(str).toBe('Location: 40.7128, -74.006')
    })
  })
})