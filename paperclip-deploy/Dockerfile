# Multi-stage build for Paperclip with custom branding
FROM node:20-alpine AS builder

# Install git for cloning
RUN apk add --no-cache git

# Clone Paperclip
WORKDIR /app
RUN git clone --depth 1 https://github.com/paperclipai/paperclip.git .

# Install dependencies
RUN npm install -g pnpm@9.15.4
RUN pnpm install

# Copy custom assets
COPY custom-assets/logo.png ./ui/public/logo.png
COPY custom-assets/login-bg.jpg ./ui/public/login-bg.jpg
COPY custom-branding/ ./ui/src/branding/

# Apply custom branding patches
COPY patches/apply-branding.sh ./apply-branding.sh
RUN chmod +x ./apply-branding.sh
RUN ./apply-branding.sh

# Build the application
RUN pnpm build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy built application
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/package.json ./server/package.json
COPY --from=builder /app/ui/dist ./ui/dist
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/package.json ./package.json

# Install production dependencies only
RUN npm install -g pnpm@9.15.4
RUN pnpm install --production

# Create data directory
RUN mkdir -p /app/data

# Expose port
EXPOSE 3100

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3100/api/health || exit 1

# Start command
CMD ["pnpm", "--filter", "@paperclipai/server", "start"]
