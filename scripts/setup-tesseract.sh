#!/bin/bash

# Setup Tesseract OCR on Ubuntu/Debian

echo "Installing Tesseract OCR..."

# Update package manager
sudo apt-get update

# Install Tesseract with language packs
sudo apt-get install -y tesseract-ocr tesseract-ocr-eng tesseract-ocr-spa

# Verify installation
echo ""
echo "Verifying Tesseract installation..."
tesseract --version

echo ""
echo "✓ Tesseract OCR installed successfully!"
echo ""
echo "Available languages:"
tesseract --list-langs
