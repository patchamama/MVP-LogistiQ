#!/bin/bash

# Deploy script for MVP-LogistiQ frontend
# Usage: ./deploy.sh
# This script pulls the latest changes and deploys the frontend to the web server

set -e

echo "================================"
echo "MVP-LogistiQ Deployment Script"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
FRONTEND_DIST="$PROJECT_ROOT/frontend/dist"
DEPLOY_DIR="$PROJECT_ROOT"

echo -e "${BLUE}[1/4]${NC} Pulling latest changes from GitHub..."
cd "$PROJECT_ROOT"
git pull origin main
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Git pull completed successfully${NC}"
else
    echo -e "${YELLOW}✗ Git pull failed${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}[2/5]${NC} Building frontend if needed..."
if [ ! -d "$FRONTEND_DIST" ] || [ -z "$(ls -A "$FRONTEND_DIST" 2>/dev/null)" ]; then
    echo -e "${YELLOW}⚠ Dist folder empty or missing, building frontend...${NC}"
    cd "$PROJECT_ROOT/frontend"
    npm install > /dev/null 2>&1
    npm run build > /dev/null 2>&1
    cd "$PROJECT_ROOT"
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Frontend built successfully${NC}"
    else
        echo -e "${YELLOW}✗ Frontend build failed${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Dist folder found (using existing build)${NC}"
fi
echo ""

echo -e "${BLUE}[3/5]${NC} Copying frontend assets to web root..."
# Copy all files from frontend/dist to the project root (web accessible folder)
cp -r "$FRONTEND_DIST"/* "$DEPLOY_DIR/"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Files copied successfully${NC}"
    echo "  - index.html"
    echo "  - assets/"
    echo "  - manifest.webmanifest"
    echo "  - sw.js"
    echo "  - workbox-*.js"
else
    echo -e "${YELLOW}✗ Copy operation failed${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}[4/5]${NC} Updating version information..."
# Create version.json with current timestamp
CURRENT_VERSION=$(grep '"version":' "$PROJECT_ROOT/frontend/package.json" | sed 's/.*"version": "\([^"]*\)".*/\1/')
CURRENT_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")

# Create version.json in the deploy directory
cat > "$DEPLOY_DIR/version.json" << EOF
{
  "version": "$CURRENT_VERSION",
  "timestamp": "$CURRENT_TIMESTAMP"
}
EOF

# Set proper permissions
chmod -R 755 "$DEPLOY_DIR"/*.html 2>/dev/null || true
chmod -R 755 "$DEPLOY_DIR"/assets 2>/dev/null || true
chmod -R 755 "$DEPLOY_DIR"/sw.js 2>/dev/null || true
chmod -R 755 "$DEPLOY_DIR"/version.json 2>/dev/null || true
echo -e "${GREEN}✓ Permissions set${NC}"
echo "  - App version: $CURRENT_VERSION"
echo "  - Updated at: $CURRENT_TIMESTAMP"
echo ""

echo -e "${BLUE}[5/5]${NC} Deployment completed!"
echo ""
echo "================================"
echo -e "${GREEN}✓ Frontend Deployment Complete!${NC}"
echo "================================"
echo ""
echo "Your application is now live at:"
echo -e "${GREEN}https://backend.patchamama.com/MVP-LogistiQ${NC}"
echo ""
echo "Version information:"
echo "  • Current version: $CURRENT_VERSION"
echo "  • Last updated: $CURRENT_TIMESTAMP"
echo "  • Updates checked every 60 seconds"
echo ""
echo "You can now visit the above URL to see your deployed application."
echo ""
