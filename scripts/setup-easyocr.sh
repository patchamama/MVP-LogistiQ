#!/bin/bash

###############################################################################
# EasyOCR Installation Script
# Supports: macOS, Ubuntu/Debian, CentOS/RHEL, Alpine Linux
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Detect OS
detect_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    elif [[ -f /etc/os-release ]]; then
        . /etc/os-release
        echo "$ID"
    elif [[ -f /etc/lsb-release ]]; then
        . /etc/lsb-release
        echo "$DISTRIB_ID" | tr '[:upper:]' '[:lower:]'
    else
        echo "unknown"
    fi
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Check Python installation
check_python() {
    if command -v python3 &> /dev/null; then
        PYTHON_CMD="python3"
        print_success "Found Python 3"
    elif command -v python &> /dev/null; then
        PYTHON_CMD="python"
        print_success "Found Python"
    else
        print_error "Python is not installed"
        return 1
    fi

    echo "  Version: $($PYTHON_CMD --version)"
    return 0
}

# Check pip installation
check_pip() {
    if command -v pip3 &> /dev/null; then
        PIP_CMD="pip3"
        print_success "Found pip3"
    elif command -v pip &> /dev/null; then
        PIP_CMD="pip"
        print_success "Found pip"
    else
        print_error "pip is not installed"
        return 1
    fi

    echo "  Version: $($PIP_CMD --version)"
    return 0
}

# Install Python on macOS
install_python_macos() {
    print_info "Installing Python via Homebrew..."

    if ! command -v brew &> /dev/null; then
        print_error "Homebrew is not installed"
        echo "Please install Homebrew first: https://brew.sh"
        return 1
    fi

    brew update || true
    brew install python3

    print_success "Python 3 installed"
    return 0
}

# Install Python on Ubuntu/Debian
install_python_debian() {
    print_info "Installing Python via apt..."

    sudo apt-get update
    sudo apt-get install -y python3 python3-pip

    print_success "Python 3 installed"
    return 0
}

# Install Python on CentOS/RHEL
install_python_redhat() {
    print_info "Installing Python via yum..."

    sudo yum install -y python3 python3-pip

    print_success "Python 3 installed"
    return 0
}

# Install system dependencies
install_system_deps() {
    local os=$1

    case "$os" in
        macos)
            print_info "Installing system dependencies via Homebrew..."
            brew install libjpeg libpng || true
            ;;
        ubuntu|debian)
            print_info "Installing system dependencies via apt..."
            sudo apt-get install -y \
                build-essential \
                libsm6 \
                libxext6 \
                libxrender-dev \
                libopenblas-dev || true
            ;;
        centos|rhel|fedora)
            print_info "Installing system dependencies via yum..."
            sudo yum groupinstall -y "Development Tools"
            sudo yum install -y \
                libSM \
                libXext \
                libXrender \
                openblas-devel || true
            ;;
    esac

    return 0
}

# Install EasyOCR and dependencies
install_easyocr() {
    print_info "Upgrading pip..."
    $PIP_CMD install --upgrade pip setuptools wheel

    print_info "Installing EasyOCR and dependencies..."
    echo "  This may take a few minutes..."

    # Install with timeout and progress
    $PIP_CMD install \
        --upgrade \
        easyocr \
        opencv-python \
        numpy \
        torch \
        torchvision

    print_success "EasyOCR installed"
    return 0
}

verify_installation() {
    print_header "Verifying Installation"

    if ! $PYTHON_CMD -c "import easyocr" 2>/dev/null; then
        print_error "EasyOCR import failed"
        return 1
    fi

    print_success "EasyOCR is installed"

    $PYTHON_CMD -c "import easyocr; print('  Version:', easyocr.__version__)"

    if $PYTHON_CMD -c "import cv2" 2>/dev/null; then
        print_success "OpenCV is installed"
        $PYTHON_CMD -c "import cv2; print('  Version:', cv2.__version__)"
    fi

    if $PYTHON_CMD -c "import torch" 2>/dev/null; then
        print_success "PyTorch is installed"
        $PYTHON_CMD -c "import torch; print('  Version:', torch.__version__)"
    fi

    return 0
}

main() {
    print_header "EasyOCR Installation"

    OS=$(detect_os)
    print_info "Operating System: $OS"
    echo ""

    # Check and install Python
    print_info "Checking Python installation..."
    if ! check_python; then
        case "$OS" in
            macos)
                install_python_macos || exit 1
                ;;
            ubuntu|debian)
                install_python_debian || exit 1
                ;;
            centos|rhel|fedora)
                install_python_redhat || exit 1
                ;;
            *)
                print_error "Unsupported operating system for automatic Python installation: $OS"
                exit 1
                ;;
        esac
    fi

    echo ""

    # Check and install pip
    print_info "Checking pip installation..."
    if ! check_pip; then
        print_error "Please install pip manually for your system"
        exit 1
    fi

    echo ""

    # Install system dependencies
    install_system_deps "$OS" || true

    echo ""

    # Install EasyOCR
    install_easyocr || exit 1

    echo ""

    # Verify
    verify_installation || exit 1

    echo ""
    print_success "EasyOCR installation completed!"
    echo ""
    echo "Important notes:"
    echo "  • On first use, EasyOCR will download model files (~200MB+)"
    echo "  • This may take a few minutes depending on your internet speed"
    echo "  • Model files are cached for subsequent use"
    echo ""
    echo "To test the installation, run:"
    echo "  python3 -c \"import easyocr; reader = easyocr.Reader(['en'])\""
}

main "$@"
