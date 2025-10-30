#!/bin/bash
# Test script for localhost setup verification

set -e

echo "=========================================="
echo "Typie Localhost Setup Verification"
echo "=========================================="
echo ""

# Check if Docker services are running
echo "1. Checking Docker services..."
if docker compose ps | grep -q "Up"; then
    echo "   ✅ Docker services are running"
else
    echo "   ❌ Docker services are not running"
    echo "   Run: docker compose up -d postgres redis"
    exit 1
fi
echo ""

# Check if .env file exists
echo "2. Checking environment configuration..."
if [ -f "apps/api/.env" ]; then
    echo "   ✅ API .env file exists"
else
    echo "   ⚠️  API .env file missing (will use defaults)"
fi
echo ""

# Check if styled-system is generated
echo "3. Checking styled-system generation..."
if [ -d "packages/styled-system/styled-system" ]; then
    echo "   ✅ styled-system generated"
else
    echo "   ❌ styled-system not generated"
    echo "   Run: cd packages/styled-system && bun run codegen"
    exit 1
fi
echo ""

# Start API server in background
echo "4. Starting API server..."
cd apps/api
bun run dev > /tmp/test-api.log 2>&1 &
API_PID=$!
cd ../..

# Wait for server to start
echo "   Waiting for server to start..."
sleep 8

# Check if server is running
if ps -p $API_PID > /dev/null; then
    echo "   ✅ API server started (PID: $API_PID)"
else
    echo "   ❌ API server failed to start"
    echo "   Check logs: tail /tmp/test-api.log"
    exit 1
fi
echo ""

# Test health endpoint
echo "5. Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:3000/healthz)
if echo "$HEALTH_RESPONSE" | grep -q '"*":true'; then
    echo "   ✅ Health check passed: $HEALTH_RESPONSE"
else
    echo "   ❌ Health check failed: $HEALTH_RESPONSE"
    kill $API_PID
    exit 1
fi
echo ""

# Test GraphQL endpoint
echo "6. Testing GraphQL endpoint..."
GRAPHQL_RESPONSE=$(curl -s -X POST http://localhost:3000/graphql \
    -H "Content-Type: application/json" \
    -d '{"query":"query { defaultPlanRule { maxTotalCharacterCount } }"}')

if echo "$GRAPHQL_RESPONSE" | grep -q 'maxTotalCharacterCount'; then
    echo "   ✅ GraphQL query passed"
    echo "   Response: $GRAPHQL_RESPONSE"
else
    echo "   ❌ GraphQL query failed: $GRAPHQL_RESPONSE"
    kill $API_PID
    exit 1
fi
echo ""

# Test CORS
echo "7. Testing CORS configuration..."
CORS_RESPONSE=$(curl -s -I -X OPTIONS http://localhost:3000/graphql \
    -H "Origin: http://localhost:5173" \
    -H "Access-Control-Request-Method: POST")

if echo "$CORS_RESPONSE" | grep -q "access-control-allow-origin"; then
    echo "   ✅ CORS configured correctly"
else
    echo "   ⚠️  CORS response: $CORS_RESPONSE"
fi
echo ""

# Test storage initialization
echo "8. Testing storage initialization..."
if [ -d "apps/api/.storage" ]; then
    echo "   ✅ Storage directory created"
    echo "   Location: apps/api/.storage"
else
    echo "   ❌ Storage directory not created"
    kill $API_PID
    exit 1
fi
echo ""

# Cleanup
echo "9. Cleaning up..."
kill $API_PID
wait $API_PID 2>/dev/null || true
echo "   ✅ API server stopped"
echo ""

echo "=========================================="
echo "✅ All tests passed!"
echo "=========================================="
echo ""
echo "Localhost setup is working correctly."
echo "You can now start development with:"
echo "  cd apps/api && bun run dev"
echo ""
