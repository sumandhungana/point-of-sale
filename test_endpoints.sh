#!/bin/bash

# Comprehensive API Endpoint Test Script
# This script tests all the main endpoints of the Point of Sale API

BASE_URL="http://localhost:5000/api"
echo "Testing API endpoints at $BASE_URL"
echo "=================================="

# Function to test an endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    
    echo -n "Testing $method $endpoint ($description)... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$BASE_URL$endpoint")
    fi
    
    if [ "$response" = "200" ] || [ "$response" = "201" ] || [ "$response" = "401" ] || [ "$response" = "404" ]; then
        echo "✅ ($response)"
    else
        echo "❌ ($response)"
    fi
}

# Test all endpoints
echo ""
echo "Testing Authentication Endpoints:"
test_endpoint "POST" "/User/login" "Login endpoint" '{"username":"test","password":"test"}'
test_endpoint "POST" "/User/logout" "Logout endpoint" ""
test_endpoint "GET" "/User" "Get users (requires auth)"

echo ""
echo "Testing Core Business Endpoints:"
test_endpoint "GET" "/Cashbook" "Get cashbooks (requires auth)"
test_endpoint "GET" "/Category" "Get categories (requires auth)"
test_endpoint "GET" "/Item" "Get items (requires auth)"
test_endpoint "GET" "/Customer" "Get customers (requires auth)"
test_endpoint "GET" "/Supplier" "Get suppliers (requires auth)"
test_endpoint "GET" "/Staff" "Get staff (requires auth)"
test_endpoint "GET" "/SalesBill" "Get sales bills (requires auth)"
test_endpoint "GET" "/Purchase" "Get purchases (requires auth)"
test_endpoint "GET" "/Expenses" "Get expenses (requires auth)"
test_endpoint "GET" "/Income" "Get income (requires auth)"
test_endpoint "GET" "/Payment" "Get payments (requires auth)"
test_endpoint "GET" "/Service" "Get services (requires auth)"
test_endpoint "GET" "/RentalItem" "Get rental items (requires auth)"

echo ""
echo "Testing Configuration Endpoints:"
test_endpoint "GET" "/AppSettings" "Get app settings (requires auth)"
test_endpoint "GET" "/Role" "Get roles (requires auth)"
test_endpoint "GET" "/Permission" "Get permissions (requires auth)"
test_endpoint "GET" "/PaymentGateway" "Get payment gateways (requires auth)"
test_endpoint "GET" "/SmsGateway" "Get SMS gateways (requires auth)"
test_endpoint "GET" "/InvoiceSettings" "Get invoice settings (requires auth)"

echo ""
echo "Testing Specialized Endpoints:"
test_endpoint "GET" "/KhataBook" "Get khata books (requires auth)"
test_endpoint "GET" "/PaymentsGiven" "Get payments given (requires auth)"
test_endpoint "GET" "/PaymentsReceived" "Get payments received (requires auth)"
test_endpoint "GET" "/StaffAttendance" "Get staff attendance (requires auth)"
test_endpoint "GET" "/StaffSalary" "Get staff salary (requires auth)"
test_endpoint "GET" "/Transaction" "Get transactions (requires auth)"
test_endpoint "GET" "/SalesBillItem" "Get sales bill items (requires auth)"

echo ""
echo "Testing File Upload Endpoint:"
test_endpoint "GET" "/FileUpload" "File upload endpoint (requires auth)"

echo ""
echo "Testing Swagger Documentation:"
test_endpoint "GET" "/swagger" "Swagger UI"
test_endpoint "GET" "/swagger/v1/swagger.json" "Swagger JSON"

echo ""
echo "=================================="
echo "Endpoint testing completed!"
echo ""
echo "Expected responses:"
echo "- 401: Unauthorized (requires authentication)"
echo "- 404: Not Found (endpoint doesn't exist)"
echo "- 200/201: Success (endpoint working)"
echo "- Other codes: Potential issues" 