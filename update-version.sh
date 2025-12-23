#!/bin/bash

# Update version script
# Usage: ./update-version.sh <new-version> <change-description>
# Example: ./update-version.sh 0.1.1 "Fix camera bug"

if [ -z "$1" ]; then
    echo "Usage: ./update-version.sh <new-version> [change-description]"
    echo "Example: ./update-version.sh 0.1.1 'Fix camera bug'"
    exit 1
fi

NEW_VERSION="$1"
CHANGE_DESC="${2:-Update to version $NEW_VERSION}"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Version Update Script${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Update package.json
echo -e "${BLUE}[1/4]${NC} Updating frontend/package.json..."
sed -i '' "s/\"version\": \"[^\"]*\"/\"version\": \"$NEW_VERSION\"/" frontend/package.json
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Version updated to $NEW_VERSION${NC}"
else
    echo -e "${YELLOW}✗ Failed to update version${NC}"
    exit 1
fi
echo ""

# Git add and commit
echo -e "${BLUE}[2/4]${NC} Committing changes..."
git add frontend/package.json
git commit -m "chore: bump version to $NEW_VERSION

$CHANGE_DESC"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Changes committed${NC}"
else
    echo -e "${YELLOW}✗ Commit failed${NC}"
    exit 1
fi
echo ""

# Git push
echo -e "${BLUE}[3/4]${NC} Pushing to GitHub..."
git push origin main
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Pushed to GitHub${NC}"
else
    echo -e "${YELLOW}✗ Push failed${NC}"
    exit 1
fi
echo ""

# Instructions
echo -e "${BLUE}[4/4]${NC} Next steps..."
echo ""
echo -e "${GREEN}✓ Version update completed!${NC}"
echo ""
echo "Now on your production server, run:"
echo -e "${YELLOW}  ./deploy.sh${NC}"
echo ""
echo "Users will see 'Update Available' button within 60 seconds."
echo ""
