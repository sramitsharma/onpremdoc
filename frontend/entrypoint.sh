#!/bin/sh

# Entrypoint script for Nginx with SSL support
set -e

echo "🚀 Starting OnPrem TechPrimer application..."

# Function to generate self-signed SSL certificate
generate_ssl_cert() {
    echo "🔐 Generating SSL certificate..."
    
    # Check if certificates already exist
    if [ -f /etc/nginx/ssl/cert.pem ] && [ -f /etc/nginx/ssl/key.pem ]; then
        echo "✅ SSL certificates already exist"
        return 0
    fi
    
    # Create SSL directory if it doesn't exist
    mkdir -p /etc/nginx/ssl
    
    # Generate self-signed certificate
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/key.pem \
        -out /etc/nginx/ssl/cert.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/OU=IT/CN=localhost" \
        -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
    
    echo "✅ SSL certificate generated successfully"
}

# Function to check if running in development mode
is_development() {
    [ "$NODE_ENV" = "development" ] || [ "$ENVIRONMENT" = "dev" ]
}

# Function to start Nginx in development mode (HTTP only)
start_development() {
    echo "🔧 Starting in development mode (HTTP only)..."
    
    # Create development nginx config
    cat > /etc/nginx/conf.d/default.conf << 'EOF'
server {
    listen 80;
    server_name _;
    
    root /usr/share/nginx/html;
    index index.html index.htm;
    
    # React Router - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Logging
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;
}
EOF
    
    echo "✅ Development configuration created"
}

# Function to start Nginx in production mode (HTTPS)
start_production() {
    echo "🏭 Starting in production mode (HTTPS)..."
    
    # Generate SSL certificate
    generate_ssl_cert
    
    # Set proper permissions
    chmod 600 /etc/nginx/ssl/key.pem
    chmod 644 /etc/nginx/ssl/cert.pem
    
    echo "✅ Production configuration ready"
}

# Function to validate Nginx configuration
validate_nginx_config() {
    echo "🔍 Validating Nginx configuration..."
    
    if nginx -t; then
        echo "✅ Nginx configuration is valid"
        return 0
    else
        echo "❌ Nginx configuration validation failed"
        return 1
    fi
}

# Function to start Nginx
start_nginx() {
    echo "🌐 Starting Nginx..."
    
    # Validate configuration first
    if ! validate_nginx_config; then
        exit 1
    fi
    
    # Start Nginx in foreground
    exec nginx -g "daemon off;"
}

# Main execution
main() {
    echo "📋 Environment: ${ENVIRONMENT:-production}"
    echo "🔧 Node Environment: ${NODE_ENV:-production}"
    
    # Check if we should run in development mode
    if is_development; then
        start_development
    else
        start_production
    fi
    
    # Start Nginx
    start_nginx
}

# Handle signals for graceful shutdown
trap 'echo "🛑 Received shutdown signal, stopping Nginx..."; nginx -s quit; exit 0' SIGTERM SIGINT

# Run main function
main "$@"
