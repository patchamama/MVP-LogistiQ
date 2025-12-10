#!/bin/bash

###############################################################################
# OCR Unit Tests Runner
# Runs pytest on OCR engines validation tests
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
    print_header "OCR Unit Tests Runner"

    # Get script directory
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    cd "$SCRIPT_DIR"

    # Check if pytest is installed
    if ! command -v pytest &> /dev/null; then
        print_error "pytest is not installed"
        echo ""
        echo "Install with:"
        echo "  pip3 install pytest"
        exit 1
    fi

    print_success "pytest found"
    pytest --version
    echo ""

    # Parse arguments
    TEST_TYPE="${1:-all}"

    case $TEST_TYPE in
        all)
            print_info "Running ALL tests..."
            pytest test_ocr_engines.py -v
            ;;

        validation)
            print_info "Running IMAGE VALIDATION tests..."
            pytest test_ocr_engines.py::TestImageValidation -v
            ;;

        tesseract)
            print_info "Running TESSERACT tests..."
            pytest test_ocr_engines.py::TestTesseractOCR -v
            ;;

        easyocr)
            print_info "Running EASYOCR tests..."
            pytest test_ocr_engines.py::TestEasyOCROCR -v
            ;;

        comparison)
            print_info "Running COMPARISON tests..."
            pytest test_ocr_engines.py::TestOCRComparison -v
            ;;

        basic)
            print_info "Running BASIC IMAGES tests..."
            pytest test_ocr_engines.py -k "basic_images" -v
            ;;

        advanced)
            print_info "Running ADVANCED IMAGES tests..."
            pytest test_ocr_engines.py -k "advanced_images" -v
            ;;

        real)
            print_info "Running REAL WORLD IMAGES tests..."
            pytest test_ocr_engines.py -k "real_world" -v
            ;;

        quick)
            print_info "Running QUICK validation only (no OCR)..."
            pytest test_ocr_engines.py::TestImageValidation -v
            pytest test_ocr_engines.py::TestOCRComparison -v
            ;;

        *)
            print_error "Unknown test type: $TEST_TYPE"
            echo ""
            echo "Available options:"
            echo "  ./run_tests.sh all          - Run all tests"
            echo "  ./run_tests.sh validation   - Validate images exist"
            echo "  ./run_tests.sh tesseract    - Run Tesseract tests"
            echo "  ./run_tests.sh easyocr      - Run EasyOCR tests"
            echo "  ./run_tests.sh comparison   - Run comparison tests"
            echo "  ./run_tests.sh basic        - Test basic images"
            echo "  ./run_tests.sh advanced     - Test advanced images"
            echo "  ./run_tests.sh real         - Test real-world images"
            echo "  ./run_tests.sh quick        - Quick validation only"
            exit 1
            ;;
    esac

    echo ""
    print_header "Tests Completed"
    print_success "Test run finished! Check results above."
    echo ""
    echo "For detailed logs, check:"
    echo "  cat test_results.log"
    echo ""
}

main "$@"
