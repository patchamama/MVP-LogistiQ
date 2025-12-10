#!/bin/bash

###############################################################################
# LogistiQ OCR Setup Script
# Comprehensive setup for both Tesseract and EasyOCR
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

main() {
    print_header "LogistiQ OCR Setup"

    OS=$(detect_os)
    print_info "Operating System: $OS"
    echo ""

    # Get script directory
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    TESSERACT_SCRIPT="$SCRIPT_DIR/setup-tesseract.sh"
    EASYOCR_SCRIPT="$SCRIPT_DIR/setup-easyocr.sh"

    # Check if setup scripts exist
    if [[ ! -f "$TESSERACT_SCRIPT" ]]; then
        print_error "Tesseract setup script not found: $TESSERACT_SCRIPT"
        exit 1
    fi

    if [[ ! -f "$EASYOCR_SCRIPT" ]]; then
        print_error "EasyOCR setup script not found: $EASYOCR_SCRIPT"
        exit 1
    fi

    # Ask user which OCR engines to install
    echo ""
    print_info "Which OCR engines would you like to install?"
    echo "  1) Both Tesseract and EasyOCR (recommended)"
    echo "  2) Only Tesseract"
    echo "  3) Only EasyOCR"
    echo -n "Enter choice [1-3]: "
    read -r choice

    echo ""

    case $choice in
        1)
            print_info "Installing both Tesseract and EasyOCR..."
            echo ""

            # Install Tesseract
            if bash "$TESSERACT_SCRIPT"; then
                print_success "Tesseract installation completed"
            else
                print_error "Tesseract installation failed"
                exit 1
            fi

            echo ""

            # Install EasyOCR
            if bash "$EASYOCR_SCRIPT"; then
                print_success "EasyOCR installation completed"
            else
                print_error "EasyOCR installation failed"
                exit 1
            fi
            ;;

        2)
            print_info "Installing Tesseract only..."
            echo ""
            if bash "$TESSERACT_SCRIPT"; then
                print_success "Tesseract installation completed"
            else
                print_error "Tesseract installation failed"
                exit 1
            fi
            ;;

        3)
            print_info "Installing EasyOCR only..."
            echo ""
            if bash "$EASYOCR_SCRIPT"; then
                print_success "EasyOCR installation completed"
            else
                print_error "EasyOCR installation failed"
                exit 1
            fi
            ;;

        *)
            print_error "Invalid choice. Please enter 1, 2, or 3."
            exit 1
            ;;
    esac

    echo ""
    print_header "Setup Complete"
    echo ""
    echo "Next steps:"
    echo "  1. Start the backend server:"
    echo "     cd backend && composer install && composer run dev"
    echo ""
    echo "  2. Start the frontend development server (in another terminal):"
    echo "     cd frontend && npm install && npm run dev"
    echo ""
    echo "  3. Open your browser and navigate to:"
    echo "     http://localhost:5173"
    echo ""
    print_success "LogistiQ is ready to use!"
}

main "$@"
