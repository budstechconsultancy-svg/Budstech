# SMS Location Sharing App - Testing Guide

This comprehensive guide explains how to test the SMS Location Sharing App across different scenarios and environments.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Testing Setup](#testing-setup)
3. [Running Tests](#running-tests)
4. [Manual Testing](#manual-testing)
5. [Testing Scenarios](#testing-scenarios)
6. [Performance Testing](#performance-testing)
7. [Security Testing](#security-testing)
8. [Troubleshooting](#troubleshooting)

## Quick Start

```bash
# Clone and setup
git clone <repository-url>
cd Budstech
npm install

# Copy environment configuration
cp .env.example .env

# Run all tests
npm test

# Start the application
npm start
```

## Testing Setup

### Environment Configuration

1. **Copy the environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Configure Twilio (for production testing):**
   ```bash
   # Edit .env file
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

3. **Enable mock mode for development:**
   ```bash
   MOCK_SMS_PROVIDER=true
   ```

### Dependencies Installation

```bash
# Install production dependencies
npm install

# Install development dependencies (if not already installed)
npm install --dev
```

## Running Tests

### Unit Tests
Test individual components in isolation:

```bash
# Run all unit tests
npm run test:unit

# Run specific unit test files
npx jest tests/unit/models/Location.test.js
npx jest tests/unit/services/smsService.test.js
npx jest tests/unit/services/locationService.test.js
```

### Integration Tests
Test API endpoints and component interactions:

```bash
# Run all integration tests
npm run test:integration

# Run specific integration test
npx jest tests/integration/app.test.js
```

### All Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode (for development)
npm run test:watch
```

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues automatically
npm run lint:fix
```

## Manual Testing

### 1. Health Check
```bash
curl -X GET http://localhost:3000/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Share Location (Basic)
```bash
curl -X POST http://localhost:3000/share-location \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "New York City",
    "expirationMinutes": 60
  }'
```

### 3. Share Location with SMS
```bash
curl -X POST http://localhost:3000/share-location \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "New York City",
    "phoneNumbers": ["+1234567890"],
    "message": "Here is my current location!",
    "expirationMinutes": 30
  }'
```

### 4. Retrieve Shared Location
```bash
# Use the shareId from previous response
curl -X GET http://localhost:3000/location/{shareId}
```

### 5. Send SMS Directly
```bash
curl -X POST http://localhost:3000/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+1234567890",
    "message": "Test SMS message"
  }'
```

## Testing Scenarios

### Happy Path Testing

#### Scenario 1: Basic Location Sharing
1. Share a location with valid coordinates
2. Verify response contains shareId, shareUrl, and expiresAt
3. Retrieve the shared location using shareId
4. Verify location data matches original input

#### Scenario 2: Location Sharing with SMS
1. Share location with phone numbers
2. Verify SMS is sent to all provided numbers
3. Check SMS content includes location URL and coordinates
4. Verify location can be retrieved via share URL

#### Scenario 3: Multiple Location Shares
1. Share multiple different locations
2. Verify each gets unique shareId
3. Verify all can be retrieved independently
4. Check access counts increment correctly

### Edge Cases and Error Handling

#### Invalid Input Testing
```bash
# Invalid coordinates
curl -X POST http://localhost:3000/share-location \
  -H "Content-Type: application/json" \
  -d '{"latitude": 91, "longitude": -74.0060}'

# Missing required fields
curl -X POST http://localhost:3000/share-location \
  -H "Content-Type: application/json" \
  -d '{"latitude": 40.7128}'

# Invalid phone number
curl -X POST http://localhost:3000/send-sms \
  -H "Content-Type: application/json" \
  -d '{"to": "invalid-phone", "message": "test"}'
```

#### Boundary Testing
- Test latitude range: -90 to +90
- Test longitude range: -180 to +180
- Test very long messages (SMS character limits)
- Test multiple phone numbers (10+ numbers)

#### Expiration Testing
1. Share location with short expiration (1 minute)
2. Wait for expiration
3. Attempt to retrieve expired location
4. Verify appropriate error message

### Load Testing Scenarios

#### Concurrent Location Sharing
```javascript
// Example load test script
const requests = [];
for (let i = 0; i < 100; i++) {
  requests.push(
    fetch('/share-location', {
      method: 'POST',
      body: JSON.stringify({
        latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
        longitude: -74.0060 + (Math.random() - 0.5) * 0.1
      })
    })
  );
}
Promise.all(requests).then(responses => {
  console.log(`Completed ${responses.length} requests`);
});
```

#### SMS Burst Testing
Test sending multiple SMS messages in rapid succession:
1. Configure rate limiting if needed
2. Monitor Twilio API rate limits
3. Test error handling for rate limit exceeded

## Performance Testing

### Response Time Benchmarks
- Location sharing: < 100ms
- Location retrieval: < 50ms
- SMS sending: < 2 seconds
- Health check: < 10ms

### Memory Usage Monitoring
```bash
# Monitor memory usage during testing
node --inspect src/index.js
# Use Chrome DevTools to monitor memory
```

### Database Performance (Future Enhancement)
When adding persistent storage:
- Test with 1000+ shared locations
- Monitor query performance
- Test cleanup of expired locations

## Security Testing

### Input Validation
1. **SQL Injection Prevention** (when database is added)
2. **XSS Prevention** in address fields
3. **Phone Number Validation** - test various formats
4. **Coordinate Validation** - test extreme values

### Authentication Testing (Future Enhancement)
When adding user authentication:
1. Test unauthorized access attempts
2. Verify token expiration
3. Test rate limiting per user

### Data Privacy
1. Verify location data expires correctly
2. Test that expired locations are inaccessible
3. Verify no sensitive data in logs

## Troubleshooting

### Common Issues

#### Tests Failing
1. **Port already in use:**
   ```bash
   # Kill process using port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **Environment variables not set:**
   ```bash
   # Verify .env file exists
   cat .env
   # Ensure MOCK_SMS_PROVIDER=true for testing
   ```

3. **Twilio credentials issues:**
   ```bash
   # Test credentials manually
   curl -X GET "https://api.twilio.com/2010-04-01/Accounts.json" \
     -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN
   ```

#### SMS Not Sending
1. **In Mock Mode:** Check console logs for mock SMS output
2. **Production Mode:** 
   - Verify Twilio credentials
   - Check phone number format
   - Verify account has SMS credits

#### Location Sharing Issues
1. **Invalid Coordinates:** Ensure latitude/longitude are within valid ranges
2. **Expired Links:** Check expiration time settings
3. **Missing Share ID:** Verify share creation response

### Debug Mode
```bash
# Run with debug logging
DEBUG=* npm start

# Run tests with verbose output
npm test -- --verbose
```

### Log Analysis
```bash
# Monitor application logs
tail -f logs/app.log

# Filter for errors
grep "ERROR" logs/app.log
```

## Test Coverage Goals

- **Unit Tests:** > 90% code coverage
- **Integration Tests:** Cover all API endpoints
- **Manual Tests:** Cover all user workflows
- **Performance Tests:** Meet response time benchmarks
- **Security Tests:** No vulnerabilities in automated scans

## Continuous Integration

### GitHub Actions (Example)
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run lint
```

### Pre-commit Hooks
```bash
# Install husky for git hooks
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "npm test && npm run lint"
```

## Test Data Management

### Test Phone Numbers
Use Twilio test credentials and phone numbers:
- Test number: +15005550006 (valid)
- Invalid number: +15005550001 (invalid)

### Test Locations
Common test coordinates:
- New York: 40.7128, -74.0060
- Los Angeles: 34.0522, -118.2437
- London: 51.5074, -0.1278
- Tokyo: 35.6762, 139.6503

### Cleanup
```bash
# Clean test artifacts
rm -rf coverage/
rm -rf node_modules/.cache/
```

This testing guide provides comprehensive coverage for testing the SMS Location Sharing App across different scenarios, environments, and use cases.