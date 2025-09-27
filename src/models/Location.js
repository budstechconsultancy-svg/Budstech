class Location {
  constructor(latitude, longitude, address = '', timestamp = new Date()) {
    this.latitude = latitude
    this.longitude = longitude
    this.address = address
    this.timestamp = timestamp
    this.id = this.generateId()
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  }

  isValid() {
    return this.isValidLatitude() && this.isValidLongitude()
  }

  isValidLatitude() {
    return typeof this.latitude === 'number' && 
           this.latitude >= -90 && 
           this.latitude <= 90
  }

  isValidLongitude() {
    return typeof this.longitude === 'number' && 
           this.longitude >= -180 && 
           this.longitude <= 180
  }

  toJSON() {
    return {
      id: this.id,
      latitude: this.latitude,
      longitude: this.longitude,
      address: this.address,
      timestamp: this.timestamp
    }
  }

  toString() {
    return `Location: ${this.latitude}, ${this.longitude}${this.address ? ` (${this.address})` : ''}`
  }

  getGoogleMapsUrl() {
    return `https://maps.google.com/?q=${this.latitude},${this.longitude}`
  }

  getDistance(otherLocation) {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.degreesToRadians(otherLocation.latitude - this.latitude)
    const dLon = this.degreesToRadians(otherLocation.longitude - this.longitude)
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.degreesToRadians(this.latitude)) * 
              Math.cos(this.degreesToRadians(otherLocation.latitude)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c // Distance in kilometers
  }

  degreesToRadians(degrees) {
    return degrees * (Math.PI / 180)
  }
}

module.exports = Location