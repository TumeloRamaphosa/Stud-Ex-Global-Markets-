#!/bin/bash
# Oracle Cloud Free Tier Deployment Script for Paperclip + Custom Adapters
# This deploys Paperclip with support for Naledi, Hermes, and other adapters

set -e

echo "========================================"
echo "  StudEx Paperclip Deployment"
echo "  Oracle Cloud Free Tier"
echo "========================================"

# Configuration
DOMAIN="${DOMAIN:-yourdomain.com}"
EMAIL="${EMAIL:-admin@yourdomain.com}"
PAPERCLIP_PORT=3100
OLLAMA_PORT=11434

# Update system
echo "[1/8] Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# Install Docker
echo "[2/8] Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# Install Docker Compose
echo "[3/8] Installing Docker Compose..."
sudo apt-get install -y docker-compose-plugin

# Install Nginx
echo "[4/8] Installing Nginx..."
sudo apt-get install -y nginx certbot python3-certbot-nginx

# Create directories
echo "[5/8] Creating directories..."
mkdir -p ~/paperclip
mkdir -p ~/paperclip/custom-adapters
mkdir -p ~/paperclip/data/postgres
mkdir -p ~/paperclip/data/paperclip
mkdir -p ~/paperclip/ssl

# Clone Paperclip
echo "[6/8] Cloning Paperclip..."
cd ~/paperclip
if [ ! -d "paperclip/.git" ]; then
    git clone --depth 1 https://github.com/paperclipai/paperclip.git
fi

# Copy custom assets
echo "[7/8] Setting up custom branding..."
cp /path/to/sm_logo_gold.png ./custom-assets/logo.png 2>/dev/null || echo "⚠️  Place logo.png in ~/paperclip/custom-assets/"
cp /path/to/thumb-1920-1333784.jpeg ./custom-assets/login-bg.jpg 2>/dev/null || echo "⚠️  Place login-bg.jpg in ~/paperclip/custom-assets/"

# Setup adapter plugins directory
echo "[8/8] Setting up adapter plugins directory..."
mkdir -p ~/.paperclip/adapter-plugins

# Create environment file
cat > ~/paperclip/.env << EOF
NODE_ENV=production
PORT=3100
DATABASE_URL=postgres://paperclip:paperclip@postgres:5432/paperclip
BETTER_AUTH_SECRET=$(openssl rand -hex 32)
SERVE_UI=true
PAPERCLIP_ADAPTER_PLUGINS_DIR=/app/adapters
EOF

echo ""
echo "========================================"
echo "  Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Copy your logo to: ~/paperclip/custom-assets/logo.png"
echo "2. Copy your background to: ~/paperclip/custom-assets/login-bg.jpg"
echo "3. Configure your domain: export DOMAIN=yourdomain.com"
echo "4. Run: ./deploy.sh"
echo ""
echo "For Naledi adapter:"
echo "5. Build your adapter: cd packages/adapter-naledi && pnpm build"
echo "6. Copy to: ~/.paperclip/adapter-plugins/naledi"
echo ""
echo "For Hermes adapter:"
echo "7. Install Hermes: pip install hermes-agent"
echo "8. Configure in Paperclip UI"
echo ""

# Reload groups
newgrp docker << EOF
echo "Docker group applied"
EOF
