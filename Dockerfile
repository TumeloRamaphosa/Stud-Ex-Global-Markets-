# Dockerfile — Single VM for StudEx Global Markets
# Serves: store (customer site) + nexus (dashboard) + API proxies

FROM node:18-alpine

# Install curl for healthchecks
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files
COPY server/package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY server/ ./
COPY dist/ ./public/

# Create necessary directories
RUN mkdir -p public/store public/nexus agents

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the server
CMD ["node", "server.js"]
