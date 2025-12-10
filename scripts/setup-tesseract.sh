#!/bin/bash

###############################################################################
# Tesseract OCR Installation Script
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

# Install Tesseract on macOS
install_macos() {
    print_info "Detected macOS"

    # Check if Homebrew is installed
    if ! command -v brew &> /dev/null; then
        print_error "Homebrew is not installed"
        echo "Please install Homebrew first: https://brew.sh"
        return 1
    fi

    print_info "Updating Homebrew..."
    brew update || true

    print_info "Installing Tesseract OCR..."
    brew install tesseract

    print_info "Installing language packs..."
    brew install tesseract-lang

    # Verify installation
    if command -v tesseract &> /dev/null; then
        print_success "Tesseract installed via Homebrew"
        return 0
    else
        print_error "Tesseract installation failed"
        return 1
    fi
}

# Install Tesseract on Ubuntu/Debian
install_debian() {
    print_info "Detected Debian/Ubuntu"

    print_info "Updating package manager..."
    sudo apt-get update

    print_info "Installing Tesseract OCR..."
    sudo apt-get install -y tesseract-ocr

    print_info "Installing language packs..."
    sudo apt-get install -y tesseract-ocr-eng tesseract-ocr-spa

    print_success "Tesseract installed via apt"
    return 0
}

# Install Tesseract on CentOS/RHEL
install_redhat() {
    print_info "Detected CentOS/RHEL"

    print_info "Installing Tesseract OCR..."
    sudo yum install -y tesseract

    print_info "Installing language packs..."
    sudo yum install -y tesseract-langpack-eng tesseract-langpack-spa

    print_success "Tesseract installed via yum"
    return 0
}

# Install Tesseract on Alpine
install_alpine() {
    print_info "Detected Alpine Linux"

    print_info "Installing Tesseract OCR..."
    sudo apk add --no-cache tesseract

    print_info "Installing language packs..."
    sudo apk add --no-cache tesseract-ocr-eng tesseract-ocr-spa

    print_success "Tesseract installed via apk"
    return 0
}

verify_installation() {
    print_header "Verifying Installation"

    if ! command -v tesseract &> /dev/null; then
        print_error "Tesseract is not in PATH"
        return 1
    fi

    tesseract --version
    echo ""

    print_info "Available languages:"
    tesseract --list-langs

    return 0
}

main() {
    print_header "Tesseract OCR Installation"

    OS=$(detect_os)
    print_info "Operating System: $OS"
    echo ""

    case "$OS" in
        macos)
            install_macos || exit 1
            ;;
        ubuntu|debian)
            install_debian || exit 1
            ;;
        centos|rhel|fedora)
            install_redhat || exit 1
            ;;
        alpine)
            install_alpine || exit 1
            ;;
        *)
            print_error "Unsupported operating system: $OS"
            echo "Supported OS: macOS, Ubuntu, Debian, CentOS, RHEL, Fedora, Alpine"
            exit 1
            ;;
    esac

    echo ""
    verify_installation || exit 1

    echo ""
    print_success "Tesseract OCR installation completed!"
    echo ""
    echo "Next steps:"
    echo "  1. Verify the installation by running: tesseract --version"
    echo "  2. If needed, install additional language packs"
    echo "  3. For Python support, also run: ./scripts/setup-easyocr.sh"
}

main "$@"
