const Location = require('../models/Location')

class LocationService {
  constructor() {
    // In-memory storage for demo purposes
    // In production, you'd use a database
    this.sharedLocations = new Map()
  }

  createLocation(latitude, longitude, address = '') {
    const location = new Location(latitude, longitude, address)
    
    if (!location.isValid()) {
      throw new Error('Invalid location coordinates')
    }
    
    return location
  }

  shareLocation(location, expirationMinutes = 60) {
    if (!location || !location.isValid()) {
      throw new Error('Invalid location provided')
    }

    const shareId = this.generateShareId()
    const expirationTime = new Date(Date.now() + expirationMinutes * 60 * 1000)
    
    const shareData = {
      id: shareId,
      location: location.toJSON(),
      createdAt: new Date(),
      expiresAt: expirationTime,
      accessCount: 0
    }

    this.sharedLocations.set(shareId, shareData)
    
    return {
      shareId,
      shareUrl: this.generateShareUrl(shareId),
      expiresAt: expirationTime
    }
  }

  getSharedLocation(shareId) {
    const shareData = this.sharedLocations.get(shareId)
    
    if (!shareData) {
      throw new Error('Location share not found')
    }

    if (new Date() > shareData.expiresAt) {
      this.sharedLocations.delete(shareId)
      throw new Error('Location share has expired')
    }

    // Increment access count
    shareData.accessCount++
    
    return {
      location: shareData.location,
      createdAt: shareData.createdAt,
      expiresAt: shareData.expiresAt,
      accessCount: shareData.accessCount
    }
  }

  generateShareId() {
    return Math.random().toString(36).substr(2, 12) + Date.now().toString(36)
  }

  generateShareUrl(shareId) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
    return `${baseUrl}/location/${shareId}`
  }

  cleanupExpiredShares() {
    const now = new Date()
    for (const [shareId, shareData] of this.sharedLocations.entries()) {
      if (now > shareData.expiresAt) {
        this.sharedLocations.delete(shareId)
      }
    }
  }

  getAllSharedLocations() {
    // For testing/admin purposes
    return Array.from(this.sharedLocations.values())
  }

  deleteSharedLocation(shareId) {
    return this.sharedLocations.delete(shareId)
  }

  getLocationStats() {
    const locations = Array.from(this.sharedLocations.values())
    const now = new Date()
    
    return {
      total: locations.length,
      active: locations.filter(loc => now <= loc.expiresAt).length,
      expired: locations.filter(loc => now > loc.expiresAt).length,
      totalAccesses: locations.reduce((sum, loc) => sum + loc.accessCount, 0)
    }
  }
}

module.exports = LocationService