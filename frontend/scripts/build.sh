#!/bin/bash

# Build script for OnPrem TechPrimer Docker deployment
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="onprem-techprimer"
IMAGE_TAG="${1:-latest}"
CONTAINER_NAME="onprem-techprimer-frontend"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to build the Docker image
build_image() {
    print_status "Building Docker image: ${IMAGE_NAME}:${IMAGE_TAG}"
    
    # Build the image
    docker build \
        --target production \
        -t "${IMAGE_NAME}:${IMAGE_TAG}" \
        -t "${IMAGE_NAME}:latest" \
        .
    
    if [ $? -eq 0 ]; then
        print_success "Docker image built successfully"
    else
        print_error "Failed to build Docker image"
        exit 1
    fi
}

# Function to stop and remove existing container
cleanup_container() {
    print_status "Cleaning up existing container..."
    
    if docker ps -a --format "table {{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
        docker stop "${CONTAINER_NAME}" > /dev/null 2>&1 || true
        docker rm "${CONTAINER_NAME}" > /dev/null 2>&1 || true
        print_success "Existing container cleaned up"
    else
        print_status "No existing container found"
    fi
}

# Function to run the container
run_container() {
    print_status "Starting container: ${CONTAINER_NAME}"
    
    docker run -d \
        --name "${CONTAINER_NAME}" \
        -p 80:80 \
        -p 443:443 \
        -e NODE_ENV=production \
        -e ENVIRONMENT=production \
        --restart unless-stopped \
        "${IMAGE_NAME}:${IMAGE_TAG}"
    
    if [ $? -eq 0 ]; then
        print_success "Container started successfully"
    else
        print_error "Failed to start container"
        exit 1
    fi
}

# Function to check container health
check_health() {
    print_status "Checking container health..."
    
    # Wait for container to be ready
    sleep 5
    
    if docker ps --format "table {{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
        print_success "Container is running"
        
        # Check health endpoint
        if curl -f http://localhost/health > /dev/null 2>&1; then
            print_success "Application is healthy"
        else
            print_warning "Health check failed, but container is running"
        fi
    else
        print_error "Container is not running"
        exit 1
    fi
}

# Function to show container logs
show_logs() {
    print_status "Container logs:"
    docker logs "${CONTAINER_NAME}" --tail 20
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [IMAGE_TAG]"
    echo ""
    echo "Options:"
    echo "  IMAGE_TAG    Docker image tag (default: latest)"
    echo ""
    echo "Examples:"
    echo "  $0           # Build with 'latest' tag"
    echo "  $0 v1.0.0    # Build with 'v1.0.0' tag"
    echo "  $0 dev       # Build with 'dev' tag"
}

# Main execution
main() {
    echo "🚀 OnPrem TechPrimer Docker Build Script"
    echo "========================================"
    
    # Check if help is requested
    if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
        show_usage
        exit 0
    fi
    
    # Check Docker
    check_docker
    
    # Build image
    build_image
    
    # Cleanup existing container
    cleanup_container
    
    # Run container
    run_container
    
    # Check health
    check_health
    
    # Show logs
    show_logs
    
    echo ""
    print_success "Deployment completed successfully!"
    echo ""
    echo "🌐 Application URLs:"
    echo "   HTTP:  http://localhost"
    echo "   HTTPS: https://localhost (self-signed certificate)"
    echo ""
    echo "📊 Container management:"
    echo "   View logs:    docker logs ${CONTAINER_NAME}"
    echo "   Stop:         docker stop ${CONTAINER_NAME}"
    echo "   Restart:      docker restart ${CONTAINER_NAME}"
    echo "   Remove:       docker rm -f ${CONTAINER_NAME}"
}

# Run main function
main "$@"
