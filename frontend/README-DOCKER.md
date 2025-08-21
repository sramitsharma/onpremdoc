# 🐳 Docker Deployment - OnPrem TechPrimer

Complete Docker setup with Nginx, SSL, and multi-stage build for the OnPrem TechPrimer React application.

## 🚀 Quick Start

### Using Docker Compose (Recommended)
```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f frontend

# Stop the application
docker-compose down
```

### Using Build Scripts
```bash
# Windows
scripts\build.bat

# Linux/macOS
chmod +x scripts/build.sh
./scripts/build.sh
```

### Using Makefile
```bash
# Build and run
make run

# Development mode
make dev

# View logs
make logs

# Stop and clean
make clean
```

## 🌐 Access URLs

- **HTTP**: http://localhost (redirects to HTTPS)
- **HTTPS**: https://localhost (self-signed certificate)

> **Note**: Accept the SSL warning in your browser for self-signed certificates.

## 📁 Files Overview

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage build (Node.js → Nginx) |
| `docker-compose.yml` | Container orchestration |
| `nginx.conf` | Main Nginx configuration |
| `nginx-ssl.conf` | SSL-enabled server config |
| `entrypoint.sh` | Container startup script |
| `scripts/build.sh` | Linux/macOS build script |
| `scripts/build.bat` | Windows build script |
| `scripts/test-docker.sh` | Docker test suite |
| `Makefile` | Cross-platform commands |
| `DOCKER_DEPLOYMENT.md` | Detailed deployment guide |

## 🔧 Features

- ✅ **Multi-stage build** for optimized image size
- ✅ **SSL/TLS support** with automatic certificate generation
- ✅ **Security hardened** with non-root user and security headers
- ✅ **Performance optimized** with Gzip compression and caching
- ✅ **Health checks** for monitoring
- ✅ **Development & production** modes
- ✅ **Cross-platform** scripts (Windows, Linux, macOS)

## 🛠️ Management Commands

```bash
# Container management
docker logs onprem-techprimer-frontend
docker restart onprem-techprimer-frontend
docker stop onprem-techprimer-frontend

# Health check
curl http://localhost/health

# SSL certificate backup
docker cp onprem-techprimer-frontend:/etc/nginx/ssl ./ssl-backup
```

## 📚 Documentation

- **[DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)** - Complete deployment guide
- **[Docker Documentation](https://docs.docker.com/)** - Official Docker docs
- **[Nginx Documentation](https://nginx.org/en/docs/)** - Nginx configuration

## 🧪 Testing

Run the Docker test suite:
```bash
chmod +x scripts/test-docker.sh
./scripts/test-docker.sh
```

## 🔒 Security

- Non-root user (UID 1001)
- Security headers (XSS, CSRF protection)
- Rate limiting on API endpoints
- File access restrictions
- Modern SSL/TLS configuration

## 🚀 Production Ready

This setup includes:
- Health monitoring
- Log aggregation
- SSL certificate management
- Performance optimizations
- Security hardening
- Container orchestration support

---

**Ready to deploy!** 🎉
