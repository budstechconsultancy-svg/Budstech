#!/bin/bash

# SMS Location Sharing App - Manual Test Scripts
# Usage: ./test-scripts.sh [test_name]

set -e

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ "$1" = "PASS" ]; then
        echo -e "${GREEN}✅ $2${NC}"
    elif [ "$1" = "FAIL" ]; then
        echo -e "${RED}❌ $2${NC}"
    else
        echo -e "${YELLOW}ℹ️  $2${NC}"
    fi
}

# Function to check if app is running
check_app_running() {
    echo "Checking if application is running..."
    if curl -s "${BASE_URL}/health" > /dev/null; then
        print_status "PASS" "Application is running"
        return 0
    else
        print_status "FAIL" "Application is not running. Please start it with 'npm start'"
        exit 1
    fi
}

# Test 1: Health Check
test_health_check() {
    echo -e "\n${YELLOW}=== Test 1: Health Check ===${NC}"
    
    response=$(curl -s "${BASE_URL}/health")
    
    if echo "$response" | grep -q "OK"; then
        print_status "PASS" "Health check endpoint working"
        echo "Response: $response"
    else
        print_status "FAIL" "Health check failed"
        echo "Response: $response"
    fi
}

# Test 2: Basic Location Sharing
test_basic_location_sharing() {
    echo -e "\n${YELLOW}=== Test 2: Basic Location Sharing ===${NC}"
    
    # Share location
    echo "Sharing location..."
    response=$(curl -s -X POST "${BASE_URL}/share-location" \
        -H "Content-Type: application/json" \
        -d '{
            "latitude": 40.7128,
            "longitude": -74.0060,
            "address": "New York City, NY",
            "expirationMinutes": 60
        }')
    
    if echo "$response" | grep -q "success.*true"; then
        print_status "PASS" "Location shared successfully"
        
        # Extract shareId for retrieval test
        share_id=$(echo "$response" | grep -o '"shareId":"[^"]*"' | cut -d'"' -f4)
        echo "Share ID: $share_id"
        
        # Test retrieval
        echo "Retrieving shared location..."
        retrieve_response=$(curl -s "${BASE_URL}/location/${share_id}")
        
        if echo "$retrieve_response" | grep -q "40.7128"; then
            print_status "PASS" "Location retrieved successfully"
            echo "Retrieved: $retrieve_response"
        else
            print_status "FAIL" "Location retrieval failed"
            echo "Response: $retrieve_response"
        fi
    else
        print_status "FAIL" "Location sharing failed"
        echo "Response: $response"
    fi
}

# Test 3: Location Sharing with SMS
test_location_sharing_with_sms() {
    echo -e "\n${YELLOW}=== Test 3: Location Sharing with SMS ===${NC}"
    
    response=$(curl -s -X POST "${BASE_URL}/share-location" \
        -H "Content-Type: application/json" \
        -d '{
            "latitude": 34.0522,
            "longitude": -118.2437,
            "address": "Los Angeles, CA",
            "phoneNumbers": ["+1234567890", "+0987654321"],
            "message": "Meeting location - see you there!",
            "expirationMinutes": 30
        }')
    
    if echo "$response" | grep -q "smsResults"; then
        print_status "PASS" "Location shared with SMS successfully"
        
        # Check SMS results
        success_count=$(echo "$response" | grep -o '"success":true' | wc -l)
        echo "SMS messages sent: $success_count"
        
        if [ "$success_count" -eq 2 ]; then
            print_status "PASS" "All SMS messages sent successfully"
        else
            print_status "FAIL" "Not all SMS messages sent"
        fi
    else
        print_status "FAIL" "Location sharing with SMS failed"
        echo "Response: $response"
    fi
}

# Test 4: Direct SMS Sending
test_direct_sms() {
    echo -e "\n${YELLOW}=== Test 4: Direct SMS Sending ===${NC}"
    
    response=$(curl -s -X POST "${BASE_URL}/send-sms" \
        -H "Content-Type: application/json" \
        -d '{
            "to": "+1234567890",
            "message": "Test SMS message from manual testing script"
        }')
    
    if echo "$response" | grep -q "success.*true"; then
        print_status "PASS" "SMS sent successfully"
        echo "Response: $response"
    else
        print_status "FAIL" "SMS sending failed"
        echo "Response: $response"
    fi
}

# Test 5: Error Handling
test_error_handling() {
    echo -e "\n${YELLOW}=== Test 5: Error Handling ===${NC}"
    
    # Test invalid coordinates
    echo "Testing invalid coordinates..."
    response=$(curl -s -w "%{http_code}" -X POST "${BASE_URL}/share-location" \
        -H "Content-Type: application/json" \
        -d '{
            "latitude": 91,
            "longitude": -74.0060
        }')
    
    if echo "$response" | grep -q "400"; then
        print_status "PASS" "Invalid coordinates properly rejected"
    else
        print_status "FAIL" "Invalid coordinates not properly handled"
        echo "Response: $response"
    fi
    
    # Test missing required fields
    echo "Testing missing required fields..."
    response=$(curl -s -w "%{http_code}" -X POST "${BASE_URL}/share-location" \
        -H "Content-Type: application/json" \
        -d '{
            "latitude": 40.7128
        }')
    
    if echo "$response" | grep -q "400"; then
        print_status "PASS" "Missing fields properly rejected"
    else
        print_status "FAIL" "Missing fields not properly handled"
        echo "Response: $response"
    fi
    
    # Test non-existent share ID
    echo "Testing non-existent share ID..."
    response=$(curl -s -w "%{http_code}" "${BASE_URL}/location/nonexistent-id")
    
    if echo "$response" | grep -q "404"; then
        print_status "PASS" "Non-existent share ID properly handled"
    else
        print_status "FAIL" "Non-existent share ID not properly handled"
        echo "Response: $response"
    fi
}

# Test 6: Edge Cases
test_edge_cases() {
    echo -e "\n${YELLOW}=== Test 6: Edge Cases ===${NC}"
    
    # Test extreme coordinates
    echo "Testing extreme coordinates..."
    coordinates_tests=(
        '{"latitude": 90, "longitude": 0, "address": "North Pole"}'
        '{"latitude": -90, "longitude": 0, "address": "South Pole"}'
        '{"latitude": 0, "longitude": 180, "address": "International Date Line"}'
        '{"latitude": 0, "longitude": -180, "address": "International Date Line West"}'
    )
    
    for coord_test in "${coordinates_tests[@]}"; do
        response=$(curl -s -X POST "${BASE_URL}/share-location" \
            -H "Content-Type: application/json" \
            -d "$coord_test")
        
        if echo "$response" | grep -q "success.*true"; then
            print_status "PASS" "Extreme coordinate test passed: $coord_test"
        else
            print_status "FAIL" "Extreme coordinate test failed: $coord_test"
        fi
    done
    
    # Test multiple phone numbers
    echo "Testing multiple phone numbers..."
    response=$(curl -s -X POST "${BASE_URL}/share-location" \
        -H "Content-Type: application/json" \
        -d '{
            "latitude": 40.7128,
            "longitude": -74.0060,
            "phoneNumbers": ["+1111111111", "+2222222222", "+3333333333", "+4444444444", "+5555555555"]
        }')
    
    success_count=$(echo "$response" | grep -o '"success":true' | wc -l)
    if [ "$success_count" -eq 5 ]; then
        print_status "PASS" "Multiple phone numbers handled correctly"
    else
        print_status "FAIL" "Multiple phone numbers not handled correctly"
        echo "Success count: $success_count, Expected: 5"
    fi
}

# Test 7: Performance Test
test_performance() {
    echo -e "\n${YELLOW}=== Test 7: Performance Test ===${NC}"
    
    echo "Testing rapid location sharing..."
    start_time=$(date +%s.%N)
    
    for i in {1..5}; do
        lat=$(echo "40.7128 + $i * 0.001" | bc -l)
        curl -s -X POST "${BASE_URL}/share-location" \
            -H "Content-Type: application/json" \
            -d "{\"latitude\": $lat, \"longitude\": -74.0060}" > /dev/null &
    done
    
    wait
    end_time=$(date +%s.%N)
    duration=$(echo "$end_time - $start_time" | bc -l)
    
    echo "Created 5 locations in ${duration} seconds"
    
    if (( $(echo "$duration < 2.0" | bc -l) )); then
        print_status "PASS" "Performance test passed (< 2 seconds)"
    else
        print_status "FAIL" "Performance test failed (>= 2 seconds)"
    fi
}

# Function to run all tests
run_all_tests() {
    echo -e "${YELLOW}=== SMS Location Sharing App - Manual Test Suite ===${NC}"
    echo "Starting comprehensive testing..."
    
    check_app_running
    test_health_check
    test_basic_location_sharing
    test_location_sharing_with_sms
    test_direct_sms
    test_error_handling
    test_edge_cases
    test_performance
    
    echo -e "\n${YELLOW}=== Test Suite Complete ===${NC}"
    echo "Review the results above to ensure all tests passed."
}

# Main script logic
case "${1:-all}" in
    "health")
        check_app_running
        test_health_check
        ;;
    "basic")
        check_app_running
        test_basic_location_sharing
        ;;
    "sms")
        check_app_running
        test_location_sharing_with_sms
        ;;
    "direct-sms")
        check_app_running
        test_direct_sms
        ;;
    "errors")
        check_app_running
        test_error_handling
        ;;
    "edge")
        check_app_running
        test_edge_cases
        ;;
    "performance")
        check_app_running
        test_performance
        ;;
    "all")
        run_all_tests
        ;;
    *)
        echo "Usage: $0 [health|basic|sms|direct-sms|errors|edge|performance|all]"
        echo ""
        echo "Available tests:"
        echo "  health      - Test health check endpoint"
        echo "  basic       - Test basic location sharing"
        echo "  sms         - Test location sharing with SMS"
        echo "  direct-sms  - Test direct SMS sending"
        echo "  errors      - Test error handling"
        echo "  edge        - Test edge cases"
        echo "  performance - Test performance"
        echo "  all         - Run all tests (default)"
        exit 1
        ;;
esac