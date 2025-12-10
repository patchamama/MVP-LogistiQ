#!/bin/bash

# Setup EasyOCR on Ubuntu/Debian

echo "Installing EasyOCR..."

# Check if Python3 is installed
if ! command -v python3 &> /dev/null; then
    echo "Python3 is not installed. Installing..."
    sudo apt-get update
    sudo apt-get install -y python3 python3-pip
fi

# Check if pip3 is installed
if ! command -v pip3 &> /dev/null; then
    echo "pip3 is not installed. Installing..."
    sudo apt-get install -y python3-pip
fi

# Install EasyOCR and dependencies
echo "Installing EasyOCR and dependencies..."
pip3 install --upgrade pip
pip3 install easyocr opencv-python-headless numpy

# Verify installation
echo ""
echo "Verifying EasyOCR installation..."
python3 -c "import easyocr; print('✓ EasyOCR version:', easyocr.__version__)"

echo ""
echo "✓ EasyOCR installed successfully!"
echo ""
echo "Note: The first time you use EasyOCR, it will download the model files (~200MB+)"
echo "This may take a few minutes on first run."
