# Manual Test Scenarios

## Test Environment Setup
1. Ensure the application is running: `npm start`
2. Verify environment variables are set correctly
3. Confirm mock mode is enabled for safe testing: `MOCK_SMS_PROVIDER=true`

## Scenario 1: Basic Location Sharing
**Objective:** Test basic location sharing functionality

### Steps:
1. **Share a location:**
   ```bash
   curl -X POST http://localhost:3000/share-location \
     -H "Content-Type: application/json" \
     -d '{
       "latitude": 40.7128,
       "longitude": -74.0060,
       "address": "New York City, NY",
       "expirationMinutes": 60
     }'
   ```

2. **Expected Response:**
   ```json
   {
     "success": true,
     "location": {
       "id": "...",
       "latitude": 40.7128,
       "longitude": -74.0060,
       "address": "New York City, NY",
       "timestamp": "2024-01-15T10:30:00.000Z"
     },
     "share": {
       "shareId": "...",
       "shareUrl": "http://localhost:3000/location/...",
       "expiresAt": "2024-01-15T11:30:00.000Z"
     }
   }
   ```

3. **Retrieve the shared location:**
   ```bash
   curl -X GET http://localhost:3000/location/{shareId}
   ```

4. **Verify:**
   - ✅ Location data matches input
   - ✅ Share URL is accessible
   - ✅ Access count increments

**Result:** ⬜ PASS ⬜ FAIL

---

## Scenario 2: Location Sharing with SMS
**Objective:** Test location sharing with SMS notifications

### Steps:
1. **Share location with SMS:**
   ```bash
   curl -X POST http://localhost:3000/share-location \
     -H "Content-Type: application/json" \
     -d '{
       "latitude": 34.0522,
       "longitude": -118.2437,
       "address": "Los Angeles, CA",
       "phoneNumbers": ["+1234567890", "+0987654321"],
       "message": "Meeting location - see you there!",
       "expirationMinutes": 30
     }'
   ```

2. **Expected Response:**
   ```json
   {
     "success": true,
     "location": {...},
     "share": {...},
     "smsResults": [
       {
         "phoneNumber": "+1234567890",
         "success": true,
         "messageId": "mock_..."
       },
       {
         "phoneNumber": "+0987654321",
         "success": true,
         "messageId": "mock_..."
       }
     ]
   }
   ```

3. **Check console logs for SMS output:**
   Look for: `[MOCK SMS] To: +1234567890, Message: ...`

4. **Verify SMS content includes:**
   - ✅ Custom message
   - ✅ Google Maps URL
   - ✅ Coordinates

**Result:** ⬜ PASS ⬜ FAIL

---

## Scenario 3: Error Handling
**Objective:** Test application error handling and validation

### Test 3.1: Invalid Coordinates
```bash
curl -X POST http://localhost:3000/share-location \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 91,
    "longitude": -74.0060
  }'
```

**Expected:** 400 error with validation message

### Test 3.2: Missing Required Fields
```bash
curl -X POST http://localhost:3000/share-location \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7128
  }'
```

**Expected:** 400 error indicating missing longitude

### Test 3.3: Invalid Phone Number
```bash
curl -X POST http://localhost:3000/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "to": "invalid-phone-number",
    "message": "Test message"
  }'
```

**Expected:** 400 error with invalid phone number message

### Test 3.4: Non-existent Share ID
```bash
curl -X GET http://localhost:3000/location/nonexistent-id
```

**Expected:** 404 error with "Location share not found"

**Results:**
- Test 3.1: ⬜ PASS ⬜ FAIL
- Test 3.2: ⬜ PASS ⬜ FAIL
- Test 3.3: ⬜ PASS ⬜ FAIL
- Test 3.4: ⬜ PASS ⬜ FAIL

---

## Scenario 4: Edge Cases
**Objective:** Test boundary conditions and edge cases

### Test 4.1: Extreme Coordinates
```bash
# North Pole
curl -X POST http://localhost:3000/share-location \
  -H "Content-Type: application/json" \
  -d '{"latitude": 90, "longitude": 0, "address": "North Pole"}'

# South Pole
curl -X POST http://localhost:3000/share-location \
  -H "Content-Type: application/json" \
  -d '{"latitude": -90, "longitude": 0, "address": "South Pole"}'

# International Date Line
curl -X POST http://localhost:3000/share-location \
  -H "Content-Type: application/json" \
  -d '{"latitude": 0, "longitude": 180, "address": "International Date Line"}'
```

### Test 4.2: Maximum SMS Length
```bash
curl -X POST http://localhost:3000/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+1234567890",
    "message": "'$(printf 'A%.0s' {1..1600})'"
  }'
```

### Test 4.3: Multiple Phone Numbers
```bash
curl -X POST http://localhost:3000/share-location \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7128,
    "longitude": -74.0060,
    "phoneNumbers": ["+1111111111", "+2222222222", "+3333333333", "+4444444444", "+5555555555"]
  }'
```

**Results:**
- Test 4.1: ⬜ PASS ⬜ FAIL
- Test 4.2: ⬜ PASS ⬜ FAIL
- Test 4.3: ⬜ PASS ⬜ FAIL

---

## Scenario 5: Expiration Testing
**Objective:** Test location share expiration functionality

### Steps:
1. **Share location with short expiration:**
   ```bash
   curl -X POST http://localhost:3000/share-location \
     -H "Content-Type: application/json" \
     -d '{
       "latitude": 40.7128,
       "longitude": -74.0060,
       "expirationMinutes": 1
     }'
   ```

2. **Wait 2 minutes**

3. **Try to retrieve expired location:**
   ```bash
   curl -X GET http://localhost:3000/location/{shareId}
   ```

4. **Expected:** 404 error with "Location share has expired"

**Result:** ⬜ PASS ⬜ FAIL

---

## Scenario 6: Concurrent Access
**Objective:** Test multiple simultaneous accesses

### Steps:
1. **Share a location**
2. **Retrieve the same location multiple times simultaneously:**
   ```bash
   # Run these commands simultaneously in different terminals
   curl -X GET http://localhost:3000/location/{shareId} &
   curl -X GET http://localhost:3000/location/{shareId} &
   curl -X GET http://localhost:3000/location/{shareId} &
   curl -X GET http://localhost:3000/location/{shareId} &
   wait
   ```

3. **Verify:**
   - ✅ All requests succeed
   - ✅ Access count increments correctly
   - ✅ No race conditions

**Result:** ⬜ PASS ⬜ FAIL

---

## Scenario 7: Performance Testing
**Objective:** Test application performance under load

### Test 7.1: Rapid Location Sharing
```bash
# Create 10 locations rapidly
for i in {1..10}; do
  curl -X POST http://localhost:3000/share-location \
    -H "Content-Type: application/json" \
    -d "{\"latitude\": $((40 + i * 0.01)), \"longitude\": -74.0060}" &
done
wait
```

### Test 7.2: Response Time Check
Use `time` command to measure response times:
```bash
time curl -X POST http://localhost:3000/share-location \
  -H "Content-Type: application/json" \
  -d '{"latitude": 40.7128, "longitude": -74.0060}'
```

**Target Performance:**
- Location sharing: < 100ms
- Location retrieval: < 50ms
- SMS sending: < 2s

**Results:**
- Test 7.1: ⬜ PASS ⬜ FAIL
- Test 7.2: ⬜ PASS ⬜ FAIL

---

## Test Summary

| Scenario | Status | Notes |
|----------|--------|-------|
| Basic Location Sharing | ⬜ | |
| Location Sharing with SMS | ⬜ | |
| Error Handling | ⬜ | |
| Edge Cases | ⬜ | |
| Expiration Testing | ⬜ | |
| Concurrent Access | ⬜ | |
| Performance Testing | ⬜ | |

**Overall Result:** ⬜ PASS ⬜ FAIL

**Test Date:** ________________

**Tester:** ________________

**Environment:** 
- Node.js version: ________________
- Application version: ________________
- Mock mode: ⬜ Enabled ⬜ Disabled

**Additional Notes:**
_________________________________________________
_________________________________________________
_________________________________________________