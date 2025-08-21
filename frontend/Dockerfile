# Multi-stage Docker build for React app with Nginx
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies) for build
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine AS production

# Install openssl for SSL certificate generation
RUN apk add --no-cache openssl

# Copy built application from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx-ssl.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl

# Create non-root user for security
RUN addgroup -g 1001 -S nginx 2>/dev/null || true && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx 2>/dev/null || true

# Set ownership
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    chown -R nginx:nginx /etc/nginx/ssl

# Switch to non-root user
USER nginx

# Expose ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Set entrypoint
ENTRYPOINT ["/entrypoint.sh"]
