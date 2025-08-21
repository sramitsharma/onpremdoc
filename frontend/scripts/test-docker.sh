#!/bin/bash

# Test script for Docker deployment
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="onprem-techprimer"
CONTAINER_NAME="onprem-techprimer-test"
TEST_PORT=8080

# Function to print colored output
print_status() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# Function to cleanup test resources
cleanup() {
    print_status "Cleaning up test resources..."
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
    docker rmi $IMAGE_NAME:test 2>/dev/null || true
}

# Set trap to cleanup on exit
trap cleanup EXIT

# Test 1: Check Docker is running
test_docker_running() {
    print_status "Testing Docker is running..."
    if docker info > /dev/null 2>&1; then
        print_success "Docker is running"
        return 0
    else
        print_error "Docker is not running"
        return 1
    fi
}

# Test 2: Build Docker image
test_build_image() {
    print_status "Testing Docker image build..."
    if docker build --target production -t $IMAGE_NAME:test .; then
        print_success "Docker image built successfully"
        return 0
    else
        print_error "Docker image build failed"
        return 1
    fi
}

# Test 3: Run container
test_run_container() {
    print_status "Testing container startup..."
    if docker run -d --name $CONTAINER_NAME -p $TEST_PORT:80 -e NODE_ENV=production -e ENVIRONMENT=production $IMAGE_NAME:test; then
        print_success "Container started successfully"
        return 0
    else
        print_error "Container startup failed"
        return 1
    fi
}

# Test 4: Check container health
test_container_health() {
    print_status "Testing container health..."
    
    # Wait for container to be ready
    sleep 10
    
    if docker ps | grep -q $CONTAINER_NAME; then
        print_success "Container is running"
        return 0
    else
        print_error "Container is not running"
        return 1
    fi
}

# Test 5: Test HTTP endpoint
test_http_endpoint() {
    print_status "Testing HTTP endpoint..."
    
    # Wait a bit more for Nginx to be ready
    sleep 5
    
    if curl -f http://localhost:$TEST_PORT/health > /dev/null 2>&1; then
        print_success "HTTP endpoint is responding"
        return 0
    else
        print_warning "HTTP endpoint not responding (this might be normal if health endpoint is not configured)"
        return 0
    fi
}

# Test 6: Test application endpoint
test_app_endpoint() {
    print_status "Testing application endpoint..."
    
    if curl -f http://localhost:$TEST_PORT/ > /dev/null 2>&1; then
        print_success "Application endpoint is responding"
        return 0
    else
        print_error "Application endpoint not responding"
        return 1
    fi
}

# Test 7: Check container logs
test_container_logs() {
    print_status "Testing container logs..."
    
    if docker logs $CONTAINER_NAME 2>&1 | grep -q "Starting OnPrem TechPrimer"; then
        print_success "Container logs show proper startup"
        return 0
    else
        print_warning "Container logs don't show expected startup message"
        return 0
    fi
}

# Test 8: Test SSL configuration (if available)
test_ssl_config() {
    print_status "Testing SSL configuration..."
    
    # Check if SSL certificates exist in container
    if docker exec $CONTAINER_NAME ls /etc/nginx/ssl/cert.pem > /dev/null 2>&1; then
        print_success "SSL certificates are present"
        return 0
    else
        print_warning "SSL certificates not found (this might be normal in test mode)"
        return 0
    fi
}

# Test 9: Test Nginx configuration
test_nginx_config() {
    print_status "Testing Nginx configuration..."
    
    if docker exec $CONTAINER_NAME nginx -t > /dev/null 2>&1; then
        print_success "Nginx configuration is valid"
        return 0
    else
        print_error "Nginx configuration is invalid"
        return 1
    fi
}

# Test 10: Test file permissions
test_file_permissions() {
    print_status "Testing file permissions..."
    
    # Check if nginx user exists and has proper permissions
    if docker exec $CONTAINER_NAME id nginx > /dev/null 2>&1; then
        print_success "Nginx user exists"
        return 0
    else
        print_error "Nginx user does not exist"
        return 1
    fi
}

# Main test execution
main() {
    echo "🧪 OnPrem TechPrimer Docker Test Suite"
    echo "======================================"
    echo ""
    
    local tests_passed=0
    local tests_failed=0
    
    # Run all tests
    test_docker_running && ((tests_passed++)) || ((tests_failed++))
    test_build_image && ((tests_passed++)) || ((tests_failed++))
    test_run_container && ((tests_passed++)) || ((tests_failed++))
    test_container_health && ((tests_passed++)) || ((tests_failed++))
    test_http_endpoint && ((tests_passed++)) || ((tests_failed++))
    test_app_endpoint && ((tests_passed++)) || ((tests_failed++))
    test_container_logs && ((tests_passed++)) || ((tests_failed++))
    test_ssl_config && ((tests_passed++)) || ((tests_failed++))
    test_nginx_config && ((tests_passed++)) || ((tests_failed++))
    test_file_permissions && ((tests_passed++)) || ((tests_failed++))
    
    echo ""
    echo "📊 Test Results:"
    echo "================"
    echo "✅ Tests passed: $tests_passed"
    echo "❌ Tests failed: $tests_failed"
    echo "📈 Success rate: $(( (tests_passed * 100) / (tests_passed + tests_failed) ))%"
    echo ""
    
    if [ $tests_failed -eq 0 ]; then
        print_success "All tests passed! Docker deployment is ready."
        echo ""
        echo "🌐 Test application available at:"
        echo "   http://localhost:$TEST_PORT"
        echo ""
        echo "📋 Container logs:"
        docker logs $CONTAINER_NAME --tail 10
        return 0
    else
        print_error "Some tests failed. Please check the output above."
        return 1
    fi
}

# Run main function
main "$@"
