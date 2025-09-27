# SMS Location Sharing App

A comprehensive Node.js application for sharing location via SMS with robust testing framework. This app allows users to share their location through SMS messages and provides temporary shareable links for location access.

## Features

- 📍 **Location Sharing**: Share GPS coordinates with optional address information
- 📱 **SMS Integration**: Send location links via SMS using Twilio
- ⏰ **Temporary Links**: Configurable expiration times for shared locations
- 🔗 **Shareable URLs**: Generate temporary URLs for location access
- 🧪 **Comprehensive Testing**: Full test suite with unit, integration, and manual tests
- 🔒 **Input Validation**: Robust validation for coordinates and phone numbers
- 📊 **Mock Mode**: Safe testing without sending actual SMS messages

## Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Twilio account (for production SMS sending)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Budstech
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your Twilio credentials (optional for testing)
   ```

4. **Start the application:**
   ```bash
   npm start
   ```

5. **Run tests:**
   ```bash
   npm test
   ```

## How to Test This SMS Location Sharing App

### 🚀 Quick Testing

**Option 1: Automated Tests**
```bash
# Run all tests
npm test

# Run specific test types
npm run test:unit        # Unit tests only
npm run test:integration # API integration tests
npm run test:coverage    # Tests with coverage report
```

**Option 2: Manual Testing Script**
```bash
# Run comprehensive manual test suite
./tests/manual/test-scripts.sh

# Run specific test categories
./tests/manual/test-scripts.sh basic      # Basic functionality
./tests/manual/test-scripts.sh sms       # SMS features
./tests/manual/test-scripts.sh errors    # Error handling
```

**Option 3: API Testing**
```bash
# Test health endpoint
curl http://localhost:3000/health

# Share a location
curl -X POST http://localhost:3000/share-location \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "New York City",
    "phoneNumbers": ["+1234567890"],
    "message": "Here is my location!",
    "expirationMinutes": 60
  }'
```

### 📖 Detailed Testing Guide

For comprehensive testing instructions, see [docs/TESTING_GUIDE.md](docs/TESTING_GUIDE.md)

## API Endpoints

### POST /share-location
Share a location with optional SMS notifications.

**Request Body:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "address": "New York City, NY",
  "phoneNumbers": ["+1234567890"],
  "message": "Custom message",
  "expirationMinutes": 60
}
```

**Response:**
```json
{
  "success": true,
  "location": {
    "id": "abc123",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "New York City, NY",
    "timestamp": "2024-01-15T10:30:00.000Z"
  },
  "share": {
    "shareId": "xyz789",
    "shareUrl": "http://localhost:3000/location/xyz789",
    "expiresAt": "2024-01-15T11:30:00.000Z"
  },
  "smsResults": [
    {
      "phoneNumber": "+1234567890",
      "success": true,
      "messageId": "mock_1234567890"
    }
  ]
}
```

### GET /location/:shareId
Retrieve a shared location by its share ID.

**Response:**
```json
{
  "success": true,
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "New York City, NY"
  },
  "createdAt": "2024-01-15T10:30:00.000Z",
  "expiresAt": "2024-01-15T11:30:00.000Z",
  "accessCount": 1
}
```

### POST /send-sms
Send SMS message directly.

**Request Body:**
```json
{
  "to": "+1234567890",
  "message": "Your message here"
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Testing Scenarios

### 1. Basic Functionality Testing
- ✅ Share location with valid coordinates
- ✅ Retrieve shared location via URL
- ✅ Verify location data accuracy
- ✅ Test expiration functionality

### 2. SMS Integration Testing  
- ✅ Send location via SMS (mock mode)
- ✅ Verify SMS content includes coordinates and URL
- ✅ Test multiple recipient phone numbers
- ✅ Validate phone number formats

### 3. Error Handling Testing
- ✅ Invalid coordinates (out of range)
- ✅ Missing required fields
- ✅ Malformed phone numbers
- ✅ Non-existent share IDs
- ✅ Expired location links

### 4. Edge Cases Testing
- ✅ Extreme coordinates (poles, date line)
- ✅ Maximum SMS message length
- ✅ Multiple simultaneous requests
- ✅ Rapid location sharing

### 5. Performance Testing
- ✅ Response time benchmarks
- ✅ Concurrent request handling
- ✅ Memory usage monitoring
- ✅ Load testing scenarios

## Configuration

### Environment Variables

```bash
# Twilio Configuration (for production SMS)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token  
TWILIO_PHONE_NUMBER=+1234567890

# Application Settings
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000

# Testing Configuration
MOCK_SMS_PROVIDER=true              # Enable for safe testing
TEST_PHONE_NUMBER=+1987654321

# Optional: Google Maps API
GOOGLE_MAPS_API_KEY=your_api_key
```

### Mock Mode vs Production Mode

**Mock Mode (Default for Testing):**
- Set `MOCK_SMS_PROVIDER=true`
- SMS messages logged to console instead of sent
- No Twilio credits consumed
- Safe for development and testing

**Production Mode:**
- Set `MOCK_SMS_PROVIDER=false`
- Requires valid Twilio credentials
- Actual SMS messages sent
- Consumes Twilio credits

## Testing Infrastructure

### Unit Tests
- **Location Model**: Coordinate validation, distance calculation, URL generation
- **SMS Service**: Phone number validation, message formatting, mock/real SMS sending
- **Location Service**: Share creation, retrieval, expiration handling

### Integration Tests  
- **API Endpoints**: Full request/response testing
- **Error Handling**: Validation and error response testing
- **SMS Integration**: Mock SMS sending verification

### Manual Testing
- **Interactive Scripts**: Automated manual testing procedures
- **Test Scenarios**: Comprehensive test case documentation
- **Performance Benchmarks**: Load and stress testing

## Development

### Running Tests
```bash
# All tests
npm test

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage

# Specific test types
npm run test:unit
npm run test:integration
```

### Code Quality
```bash
# Linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Manual Testing
```bash
# Run all manual tests
./tests/manual/test-scripts.sh all

# Run specific test categories
./tests/manual/test-scripts.sh basic
./tests/manual/test-scripts.sh sms
./tests/manual/test-scripts.sh errors
./tests/manual/test-scripts.sh edge
./tests/manual/test-scripts.sh performance
```

## Project Structure

```
Budstech/
├── src/
│   ├── controllers/          # API endpoint handlers
│   ├── services/            # Business logic services
│   ├── models/              # Data models
│   └── index.js             # Application entry point
├── tests/
│   ├── unit/                # Unit tests
│   ├── integration/         # Integration tests
│   ├── manual/              # Manual testing scripts and scenarios
│   └── setup.js             # Test configuration
├── docs/
│   └── TESTING_GUIDE.md     # Comprehensive testing documentation
├── package.json             # Dependencies and scripts
├── jest.config.js           # Jest test configuration
├── .eslintrc.js            # ESLint configuration
└── .env.example            # Environment variables template
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add comprehensive tests for new features
4. Ensure all tests pass: `npm test`
5. Run linting: `npm run lint`
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions about testing this SMS location sharing app:

1. **Check the Testing Guide**: [docs/TESTING_GUIDE.md](docs/TESTING_GUIDE.md)
2. **Run Manual Tests**: `./tests/manual/test-scripts.sh`
3. **Check Test Coverage**: `npm run test:coverage` 
4. **Review Test Scenarios**: `tests/manual/test-scenarios.md`

---

**Ready to test?** Start with `npm test` for automated testing or `./tests/manual/test-scripts.sh` for interactive manual testing!