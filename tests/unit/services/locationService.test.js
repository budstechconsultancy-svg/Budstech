const LocationService = require('../../../src/services/locationService')
const Location = require('../../../src/models/Location')

describe('LocationService', () => {
  let locationService

  beforeEach(() => {
    locationService = new LocationService()
  })

  describe('Location Creation', () => {
    test('should create valid location', () => {
      const location = locationService.createLocation(40.7128, -74.0060, 'New York City')
      
      expect(location).toBeInstanceOf(Location)
      expect(location.latitude).toBe(40.7128)
      expect(location.longitude).toBe(-74.0060)
      expect(location.address).toBe('New York City')
    })

    test('should throw error for invalid coordinates', () => {
      expect(() => {
        locationService.createLocation(91, -74.0060)
      }).toThrow('Invalid location coordinates')

      expect(() => {
        locationService.createLocation(40.7128, 181)
      }).toThrow('Invalid location coordinates')
    })
  })

  describe('Location Sharing', () => {
    test('should share location successfully', () => {
      const location = new Location(40.7128, -74.0060, 'New York City')
      const shareInfo = locationService.shareLocation(location)
      
      expect(shareInfo).toHaveProperty('shareId')
      expect(shareInfo).toHaveProperty('shareUrl')
      expect(shareInfo).toHaveProperty('expiresAt')
      expect(shareInfo.shareUrl).toContain(shareInfo.shareId)
    })

    test('should share location with custom expiration', () => {
      const location = new Location(40.7128, -74.0060)
      const expirationMinutes = 30
      const shareInfo = locationService.shareLocation(location, expirationMinutes)
      
      const now = new Date()
      const expectedExpiration = new Date(now.getTime() + expirationMinutes * 60 * 1000)
      
      expect(shareInfo.expiresAt.getTime()).toBeCloseTo(expectedExpiration.getTime(), -3)
    })

    test('should throw error for invalid location', () => {
      expect(() => {
        locationService.shareLocation(null)
      }).toThrow('Invalid location provided')

      const invalidLocation = new Location(91, -74.0060)
      expect(() => {
        locationService.shareLocation(invalidLocation)
      }).toThrow('Invalid location provided')
    })
  })

  describe('Location Retrieval', () => {
    test('should retrieve shared location', () => {
      const location = new Location(40.7128, -74.0060, 'New York City')
      const shareInfo = locationService.shareLocation(location)
      
      const retrievedData = locationService.getSharedLocation(shareInfo.shareId)
      
      expect(retrievedData.location.latitude).toBe(40.7128)
      expect(retrievedData.location.longitude).toBe(-74.0060)
      expect(retrievedData.location.address).toBe('New York City')
      expect(retrievedData.accessCount).toBe(1)
    })

    test('should increment access count on retrieval', () => {
      const location = new Location(40.7128, -74.0060)
      const shareInfo = locationService.shareLocation(location)
      
      locationService.getSharedLocation(shareInfo.shareId)
      const secondAccess = locationService.getSharedLocation(shareInfo.shareId)
      
      expect(secondAccess.accessCount).toBe(2)
    })

    test('should throw error for non-existent share ID', () => {
      expect(() => {
        locationService.getSharedLocation('nonexistent')
      }).toThrow('Location share not found')
    })

    test('should throw error for expired share', () => {
      const location = new Location(40.7128, -74.0060)
      const shareInfo = locationService.shareLocation(location, 0.001) // 0.06 seconds
      
      return new Promise((resolve) => {
        setTimeout(() => {
          expect(() => {
            locationService.getSharedLocation(shareInfo.shareId)
          }).toThrow('Location share has expired')
          resolve()
        }, 100)
      })
    })
  })

  describe('Utility Methods', () => {
    test('should generate unique share IDs', () => {
      const id1 = locationService.generateShareId()
      const id2 = locationService.generateShareId()
      
      expect(id1).not.toBe(id2)
      expect(typeof id1).toBe('string')
      expect(id1.length).toBeGreaterThan(10)
    })

    test('should generate share URLs', () => {
      const shareId = 'test123'
      const url = locationService.generateShareUrl(shareId)
      
      expect(url).toContain(shareId)
      expect(url).toMatch(/^https?:\/\//)
    })

    test('should cleanup expired shares', () => {
      const location = new Location(40.7128, -74.0060)
      const shareInfo = locationService.shareLocation(location, 0.001)
      
      return new Promise((resolve) => {
        setTimeout(() => {
          locationService.cleanupExpiredShares()
          
          expect(() => {
            locationService.getSharedLocation(shareInfo.shareId)
          }).toThrow('Location share not found')
          resolve()
        }, 100)
      })
    })

    test('should delete shared location', () => {
      const location = new Location(40.7128, -74.0060)
      const shareInfo = locationService.shareLocation(location)
      
      const deleted = locationService.deleteSharedLocation(shareInfo.shareId)
      expect(deleted).toBe(true)
      
      expect(() => {
        locationService.getSharedLocation(shareInfo.shareId)
      }).toThrow('Location share not found')
    })

    test('should get location stats', () => {
      const location1 = new Location(40.7128, -74.0060)
      const location2 = new Location(34.0522, -118.2437)
      
      locationService.shareLocation(location1)
      locationService.shareLocation(location2)
      
      const stats = locationService.getLocationStats()
      
      expect(stats.total).toBe(2)
      expect(stats.active).toBe(2)
      expect(stats.expired).toBe(0)
      expect(stats.totalAccesses).toBe(0)
    })
  })
})