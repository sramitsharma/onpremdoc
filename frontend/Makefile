# Makefile for OnPrem TechPrimer Docker deployment
# Provides cross-platform commands for building and managing the application

.PHONY: help build run stop clean logs dev prod test health

# Default target
help:
	@echo "🚀 OnPrem TechPrimer Docker Management"
	@echo "====================================="
	@echo ""
	@echo "Available commands:"
	@echo "  build     - Build Docker image"
	@echo "  run       - Build and run container"
	@echo "  stop      - Stop and remove container"
	@echo "  clean     - Clean up containers and images"
	@echo "  logs      - View container logs"
	@echo "  dev       - Run in development mode"
	@echo "  prod      - Run in production mode"
	@echo "  test      - Run health checks"
	@echo "  health    - Check application health"
	@echo "  help      - Show this help message"
	@echo ""

# Configuration
IMAGE_NAME = onprem-techprimer
CONTAINER_NAME = onprem-techprimer-frontend
TAG ?= latest

# Build the Docker image
build:
	@echo "🔨 Building Docker image..."
	docker build --target production -t $(IMAGE_NAME):$(TAG) -t $(IMAGE_NAME):latest .
	@echo "✅ Build completed successfully"

# Run the container
run: build
	@echo "🚀 Starting container..."
	@docker stop $(CONTAINER_NAME) 2>/dev/null || true
	@docker rm $(CONTAINER_NAME) 2>/dev/null || true
	docker run -d \
		--name $(CONTAINER_NAME) \
		-p 80:80 \
		-p 443:443 \
		-e NODE_ENV=production \
		-e ENVIRONMENT=production \
		--restart unless-stopped \
		$(IMAGE_NAME):$(TAG)
	@echo "✅ Container started successfully"
	@echo "🌐 Application available at:"
	@echo "   HTTP:  http://localhost"
	@echo "   HTTPS: https://localhost"

# Stop and remove container
stop:
	@echo "🛑 Stopping container..."
	@docker stop $(CONTAINER_NAME) 2>/dev/null || echo "Container not running"
	@docker rm $(CONTAINER_NAME) 2>/dev/null || echo "Container not found"
	@echo "✅ Container stopped and removed"

# Clean up containers and images
clean: stop
	@echo "🧹 Cleaning up Docker resources..."
	@docker rmi $(IMAGE_NAME):$(TAG) 2>/dev/null || echo "Image not found"
	@docker rmi $(IMAGE_NAME):latest 2>/dev/null || echo "Latest image not found"
	@docker system prune -f
	@echo "✅ Cleanup completed"

# View container logs
logs:
	@echo "📋 Container logs:"
	@docker logs $(CONTAINER_NAME) --tail 50 -f

# Run in development mode
dev:
	@echo "🔧 Starting in development mode..."
	@docker stop $(CONTAINER_NAME)-dev 2>/dev/null || true
	@docker rm $(CONTAINER_NAME)-dev 2>/dev/null || true
	docker run -d \
		--name $(CONTAINER_NAME)-dev \
		-p 3000:80 \
		-e NODE_ENV=development \
		-e ENVIRONMENT=dev \
		$(IMAGE_NAME):$(TAG)
	@echo "✅ Development container started"
	@echo "🌐 Available at: http://localhost:3000"

# Run in production mode
prod: run
	@echo "🏭 Production mode activated"

# Run health checks
test:
	@echo "🧪 Running health checks..."
	@docker ps | grep $(CONTAINER_NAME) || (echo "❌ Container not running" && exit 1)
	@curl -f http://localhost/health >/dev/null 2>&1 || (echo "❌ Health check failed" && exit 1)
	@echo "✅ All health checks passed"

# Check application health
health:
	@echo "🏥 Application health status:"
	@docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep $(CONTAINER_NAME) || echo "❌ Container not running"
	@echo ""
	@echo "Health endpoint:"
	@curl -s http://localhost/health || echo "❌ Health endpoint not responding"

# Quick start (build and run)
start: run

# Restart container
restart:
	@echo "🔄 Restarting container..."
	@docker restart $(CONTAINER_NAME) 2>/dev/null || echo "Container not found"
	@echo "✅ Container restarted"

# Show container status
status:
	@echo "📊 Container status:"
	@docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep $(CONTAINER_NAME) || echo "No containers found"

# Show container resources
resources:
	@echo "💾 Container resource usage:"
	@docker stats $(CONTAINER_NAME) --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" 2>/dev/null || echo "Container not running"

# Backup SSL certificates
backup-certs:
	@echo "💾 Backing up SSL certificates..."
	@docker cp $(CONTAINER_NAME):/etc/nginx/ssl ./ssl-backup 2>/dev/null || echo "No certificates to backup"
	@echo "✅ Certificates backed up to ./ssl-backup"

# Restore SSL certificates
restore-certs:
	@echo "📥 Restoring SSL certificates..."
	@docker cp ./ssl-backup $(CONTAINER_NAME):/etc/nginx/ssl 2>/dev/null || echo "No backup found"
	@docker restart $(CONTAINER_NAME) 2>/dev/null || echo "Container not running"
	@echo "✅ Certificates restored"

# Show Nginx configuration
show-config:
	@echo "⚙️ Nginx configuration:"
	@docker exec $(CONTAINER_NAME) cat /etc/nginx/nginx.conf 2>/dev/null || echo "Container not running"

# Show Nginx logs
nginx-logs:
	@echo "📋 Nginx access logs:"
	@docker exec $(CONTAINER_NAME) tail -20 /var/log/nginx/access.log 2>/dev/null || echo "Container not running"
	@echo ""
	@echo "📋 Nginx error logs:"
	@docker exec $(CONTAINER_NAME) tail -20 /var/log/nginx/error.log 2>/dev/null || echo "Container not running"
