# 🐳 Docker Deployment Guide

This guide explains how to deploy the OnPrem TechPrimer application using Docker with Nginx and SSL support.

## 📋 Prerequisites

- **Docker Desktop** installed and running
- **Git** for cloning the repository
- **Node.js** (for local development only)

## 🏗️ Architecture

The deployment uses a **multi-stage Docker build** with:

1. **Builder Stage**: Node.js Alpine image for building the React app
2. **Production Stage**: Nginx Alpine image for serving the built application
3. **SSL Support**: Self-signed certificates with automatic generation
4. **Security**: Non-root user, security headers, rate limiting

## 📁 File Structure

```
├── Dockerfile              # Multi-stage Docker build
├── docker-compose.yml      # Docker Compose configuration
├── nginx.conf             # Main Nginx configuration
├── nginx-ssl.conf         # SSL-enabled server configuration
├── entrypoint.sh          # Container startup script
├── .dockerignore          # Files to exclude from build
├── scripts/
│   ├── build.sh           # Linux/macOS build script
│   └── build.bat          # Windows build script
└── DOCKER_DEPLOYMENT.md   # This guide
```

## 🚀 Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
# Build and start the application
docker-compose up -d

# View logs
docker-compose logs -f frontend

# Stop the application
docker-compose down
```

### Option 2: Using Build Scripts

#### Windows:
```cmd
# Build and deploy
scripts\build.bat

# Build with custom tag
scripts\build.bat v1.0.0
```

#### Linux/macOS:
```bash
# Make script executable (first time only)
chmod +x scripts/build.sh

# Build and deploy
./scripts/build.sh

# Build with custom tag
./scripts/build.sh v1.0.0
```

### Option 3: Manual Docker Commands

```bash
# Build the image
docker build --target production -t onprem-techprimer:latest .

# Run the container
docker run -d \
  --name onprem-techprimer-frontend \
  -p 80:80 \
  -p 443:443 \
  -e NODE_ENV=production \
  -e ENVIRONMENT=production \
  --restart unless-stopped \
  onprem-techprimer:latest
```

## 🌐 Accessing the Application

After deployment, the application will be available at:

- **HTTP**: http://localhost (redirects to HTTPS)
- **HTTPS**: https://localhost (self-signed certificate)

> **Note**: Since we're using a self-signed certificate, your browser will show a security warning. Click "Advanced" and "Proceed to localhost" to access the application.

## 🔧 Configuration Options

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Node.js environment |
| `ENVIRONMENT` | `production` | Application environment |

### Development Mode

To run in development mode (HTTP only, no SSL):

```bash
# Using Docker Compose
docker-compose --profile dev up -d frontend-dev

# Using Docker directly
docker run -d \
  --name onprem-techprimer-dev \
  -p 3000:80 \
  -e NODE_ENV=development \
  -e ENVIRONMENT=dev \
  onprem-techprimer:latest
```

## 🔐 SSL Configuration

### Self-Signed Certificates

The application automatically generates self-signed SSL certificates on first run. These are stored in `/etc/nginx/ssl/` inside the container.

### Using Your Own Certificates

To use your own SSL certificates:

1. **Create a volume mount**:
```bash
docker run -d \
  --name onprem-techprimer-frontend \
  -p 80:80 \
  -p 443:443 \
  -v /path/to/your/certs:/etc/nginx/ssl \
  onprem-techprimer:latest
```

2. **Place your certificates**:
   - `cert.pem` - Your SSL certificate
   - `key.pem` - Your private key

3. **Update nginx-ssl.conf** if needed to match your certificate paths.

## 📊 Monitoring and Management

### Health Checks

The application includes health checks:

```bash
# Check container health
docker ps

# Test health endpoint
curl http://localhost/health
```

### Logs

```bash
# View container logs
docker logs onprem-techprimer-frontend

# Follow logs in real-time
docker logs -f onprem-techprimer-frontend

# View Nginx logs
docker exec onprem-techprimer-frontend cat /var/log/nginx/access.log
docker exec onprem-techprimer-frontend cat /var/log/nginx/error.log
```

### Container Management

```bash
# Stop the container
docker stop onprem-techprimer-frontend

# Start the container
docker start onprem-techprimer-frontend

# Restart the container
docker restart onprem-techprimer-frontend

# Remove the container
docker rm -f onprem-techprimer-frontend

# Remove the image
docker rmi onprem-techprimer:latest
```

## 🔒 Security Features

### Built-in Security

- **Non-root user**: Nginx runs as non-root user (UID 1001)
- **Security headers**: XSS protection, content type options, frame options
- **Rate limiting**: API endpoints are rate-limited
- **File access restrictions**: Sensitive files are blocked
- **SSL/TLS**: Modern cipher suites and protocols

### Security Headers

The application includes these security headers:

- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer-when-downgrade`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`

## 🚀 Performance Optimizations

### Nginx Optimizations

- **Gzip compression**: Enabled for text-based files
- **Static file caching**: Long-term caching for assets
- **HTTP/2**: Enabled for HTTPS connections
- **Keep-alive connections**: Optimized connection handling

### Caching Strategy

- **Static assets** (JS, CSS, images): 1 year cache
- **HTML files**: 1 hour cache with revalidation
- **API responses**: No cache (for dynamic content)

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the ports
netstat -ano | findstr :80
netstat -ano | findstr :443

# Stop conflicting services or change ports
docker run -p 8080:80 -p 8443:443 onprem-techprimer:latest
```

#### 2. SSL Certificate Issues
```bash
# Check certificate generation
docker exec onprem-techprimer-frontend ls -la /etc/nginx/ssl/

# Regenerate certificates
docker exec onprem-techprimer-frontend rm /etc/nginx/ssl/*
docker restart onprem-techprimer-frontend
```

#### 3. Build Failures
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache --target production -t onprem-techprimer:latest .
```

#### 4. Permission Issues
```bash
# Check container logs
docker logs onprem-techprimer-frontend

# Fix permissions (if needed)
docker exec -u root onprem-techprimer-frontend chown -R nginx:nginx /usr/share/nginx/html
```

### Debug Mode

To run in debug mode with more verbose logging:

```bash
docker run -d \
  --name onprem-techprimer-debug \
  -p 8080:80 \
  -e NODE_ENV=development \
  -e ENVIRONMENT=dev \
  onprem-techprimer:latest
```

## 📈 Production Deployment

### Recommended Production Setup

1. **Use a reverse proxy** (like Traefik or HAProxy) in front of the container
2. **Use proper SSL certificates** from Let's Encrypt or your CA
3. **Set up monitoring** with Prometheus/Grafana
4. **Configure log aggregation** (ELK stack, Fluentd, etc.)
5. **Use container orchestration** (Kubernetes, Docker Swarm)

### Environment-Specific Configurations

#### Development
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  frontend:
    environment:
      - NODE_ENV=development
      - ENVIRONMENT=dev
    ports:
      - "3000:80"
```

#### Staging
```yaml
# docker-compose.staging.yml
version: '3.8'
services:
  frontend:
    environment:
      - NODE_ENV=production
      - ENVIRONMENT=staging
    ports:
      - "8080:80"
      - "8443:443"
```

#### Production
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  frontend:
    environment:
      - NODE_ENV=production
      - ENVIRONMENT=production
    ports:
      - "80:80"
      - "443:443"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [React Deployment](https://create-react-app.dev/docs/deployment/)
- [SSL/TLS Best Practices](https://ssl-config.mozilla.org/)

## 🤝 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review container logs: `docker logs onprem-techprimer-frontend`
3. Verify Docker is running: `docker info`
4. Check port availability: `netstat -ano | findstr :80`

For additional help, please refer to the project documentation or create an issue in the repository.
