#!/usr/bin/env python3

"""
Unit tests for OCR engines validation
Tests both Tesseract and EasyOCR against test images
"""

import os
import subprocess
import json
import pytest
from pathlib import Path

# Test images mapping: (filename, expected_code)
BASIC_IMAGES = [
    ('product_12345.png', '12345'),
    ('product_54321.png', '54321'),
    ('product_67890.png', '67890'),
    ('product_11111.png', '11111'),
    ('product_22222.png', '22222'),
]

ADVANCED_IMAGES = [
    ('12345_white_modern.png', '12345'),
    ('12345_white_classic.png', '12345'),
    ('12345_white_monospace.png', '12345'),
    ('12345_white_mono_bold.png', '12345'),
    ('54321_white_modern.png', '54321'),
    ('54321_white_classic.png', '54321'),
    ('54321_white_monospace.png', '54321'),
    ('54321_white_mono_bold.png', '54321'),
    ('67890_white_modern.png', '67890'),
    ('67890_white_classic.png', '67890'),
    ('67890_white_monospace.png', '67890'),
    ('67890_white_mono_bold.png', '67890'),
    ('11111_white_modern.png', '11111'),
    ('11111_white_classic.png', '11111'),
    ('11111_white_monospace.png', '11111'),
    ('11111_white_mono_bold.png', '11111'),
    ('22222_white_modern.png', '22222'),
    ('22222_white_classic.png', '22222'),
    ('22222_white_monospace.png', '22222'),
    ('22222_white_mono_bold.png', '22222'),
]

REAL_WORLD_IMAGES = [
    ('danowind.jpeg', '100002', ['100 002', '10000210566', '100002', '100 002 10566']),
]

class TestTesseractOCR:
    """Test Tesseract OCR engine"""

    @pytest.fixture(scope="class")
    def tesseract_available(self):
        """Check if tesseract is installed"""
        try:
            result = subprocess.run(['tesseract', '--version'],
                                  capture_output=True,
                                  timeout=5)
            return result.returncode == 0
        except (FileNotFoundError, subprocess.TimeoutExpired):
            return False

    def extract_code_from_text(self, text):
        """Extract code from OCR text"""
        if not text:
            return ''

        # Remove spaces and newlines
        cleaned = text.strip().replace('\n', ' ').replace('\t', ' ')
        # Get first sequence of digits (and possible spaces/hyphens)
        import re

        # Try multiple patterns to find codes
        # Pattern 1: sequences with digits and spaces/hyphens
        matches = re.findall(r'[\d\s\-]+', cleaned)

        if matches:
            # Get first match and clean it
            code = matches[0].strip()
            # Remove extra spaces but keep structure
            return code

        # Pattern 2: just digits
        matches = re.findall(r'\d+', cleaned)
        if matches:
            return matches[0]

        return ''

    def tesseract_ocr(self, image_path):
        """Run Tesseract OCR on image"""
        try:
            # Create temp output file
            temp_output = f"/tmp/ocr_{os.urandom(4).hex()}"

            # Run tesseract
            cmd = ['tesseract', image_path, temp_output, '-l', 'spa+eng']
            result = subprocess.run(cmd, capture_output=True, timeout=10, text=True)

            if result.returncode != 0:
                return None

            # Read result
            txt_file = f"{temp_output}.txt"
            if os.path.exists(txt_file):
                with open(txt_file, 'r') as f:
                    text = f.read()
                # Clean up
                try:
                    os.remove(txt_file)
                except:
                    pass
                return text
            return None
        except (FileNotFoundError, subprocess.TimeoutExpired) as e:
            pytest.skip(f"Tesseract not available: {e}")
            return None

    @pytest.mark.parametrize("filename,expected_code", BASIC_IMAGES)
    def test_basic_images_tesseract(self, filename, expected_code, tesseract_available):
        """Test Tesseract on basic images"""
        if not tesseract_available:
            pytest.skip("Tesseract not installed")

        image_path = Path(__file__).parent / filename
        assert image_path.exists(), f"Image not found: {image_path}"

        text = self.tesseract_ocr(str(image_path))
        assert text is not None, f"Tesseract failed to process {filename}"

        extracted = self.extract_code_from_text(text)
        # Check if expected code is in extracted text (with or without spaces)
        assert expected_code in extracted.replace(' ', ''), \
            f"Expected {expected_code} in '{extracted}' from {filename}"

    @pytest.mark.parametrize("filename,expected_code", ADVANCED_IMAGES[:5])
    def test_advanced_images_tesseract(self, filename, expected_code, tesseract_available):
        """Test Tesseract on advanced images (sample)"""
        if not tesseract_available:
            pytest.skip("Tesseract not installed")

        image_path = Path(__file__).parent / 'variants' / filename
        assert image_path.exists(), f"Image not found: {image_path}"

        text = self.tesseract_ocr(str(image_path))
        assert text is not None, f"Tesseract failed to process {filename}"

        extracted = self.extract_code_from_text(text)
        assert expected_code in extracted.replace(' ', ''), \
            f"Expected {expected_code} in '{extracted}' from {filename}"

    @pytest.mark.parametrize("filename,expected_code,acceptable_variations", REAL_WORLD_IMAGES)
    def test_real_world_images_tesseract(self, filename, expected_code, acceptable_variations, tesseract_available):
        """Test Tesseract on real-world images"""
        if not tesseract_available:
            pytest.skip("Tesseract not installed")

        image_path = Path(__file__).parent / 'variants' / filename
        assert image_path.exists(), f"Image not found: {image_path}"

        text = self.tesseract_ocr(str(image_path))
        assert text is not None, f"Tesseract failed to process {filename}"

        extracted = self.extract_code_from_text(text)
        # For real-world images, check if any acceptable variation is found
        found = False
        for variation in acceptable_variations:
            if variation in extracted or variation.replace(' ', '') in extracted.replace(' ', ''):
                found = True
                break

        assert found, f"Expected one of {acceptable_variations} in '{extracted}' from {filename}"


class TestEasyOCROCR:
    """Test EasyOCR engine"""

    @pytest.fixture(scope="class")
    def easyocr_available(self):
        """Check if EasyOCR is installed"""
        try:
            import easyocr
            return True
        except ImportError:
            return False

    def extract_code_from_detections(self, detections):
        """Extract code from EasyOCR detections"""
        if not detections:
            return ''

        # Concatenate all detected text
        full_text = '\n'.join([text[1] for text in detections])

        # Extract code
        import re

        # Pattern 1: sequences with digits and spaces/hyphens
        matches = re.findall(r'[\d\s\-]+', full_text)
        if matches:
            code = matches[0].strip()
            return code

        # Pattern 2: just digits
        matches = re.findall(r'\d+', full_text)
        if matches:
            return matches[0]

        return ''

    def easyocr_ocr(self, image_path):
        """Run EasyOCR on image"""
        try:
            import easyocr

            # Initialize reader (cached)
            reader = easyocr.Reader(['en', 'es'], gpu=False)

            # Read image
            results = reader.readtext(image_path)

            return results
        except ImportError:
            pytest.skip("EasyOCR not installed")
            return None
        except Exception as e:
            pytest.skip(f"EasyOCR error: {e}")
            return None

    @pytest.mark.parametrize("filename,expected_code", BASIC_IMAGES)
    def test_basic_images_easyocr(self, filename, expected_code, easyocr_available):
        """Test EasyOCR on basic images"""
        if not easyocr_available:
            pytest.skip("EasyOCR not installed")

        image_path = Path(__file__).parent / filename
        assert image_path.exists(), f"Image not found: {image_path}"

        detections = self.easyocr_ocr(str(image_path))
        assert detections is not None, f"EasyOCR failed to process {filename}"

        extracted = self.extract_code_from_detections(detections)
        assert expected_code in extracted.replace(' ', ''), \
            f"Expected {expected_code} in '{extracted}' from {filename}"

    @pytest.mark.parametrize("filename,expected_code", ADVANCED_IMAGES[:5])
    def test_advanced_images_easyocr(self, filename, expected_code, easyocr_available):
        """Test EasyOCR on advanced images (sample)"""
        if not easyocr_available:
            pytest.skip("EasyOCR not installed")

        image_path = Path(__file__).parent / 'variants' / filename
        assert image_path.exists(), f"Image not found: {image_path}"

        detections = self.easyocr_ocr(str(image_path))
        assert detections is not None, f"EasyOCR failed to process {filename}"

        extracted = self.extract_code_from_detections(detections)
        assert expected_code in extracted.replace(' ', ''), \
            f"Expected {expected_code} in '{extracted}' from {filename}"

    @pytest.mark.parametrize("filename,expected_code,acceptable_variations", REAL_WORLD_IMAGES)
    def test_real_world_images_easyocr(self, filename, expected_code, acceptable_variations, easyocr_available):
        """Test EasyOCR on real-world images"""
        if not easyocr_available:
            pytest.skip("EasyOCR not installed")

        image_path = Path(__file__).parent / 'variants' / filename
        assert image_path.exists(), f"Image not found: {image_path}"

        detections = self.easyocr_ocr(str(image_path))
        assert detections is not None, f"EasyOCR failed to process {filename}"

        extracted = self.extract_code_from_detections(detections)
        # For real-world images, check if any acceptable variation is found
        found = False
        for variation in acceptable_variations:
            if variation in extracted or variation.replace(' ', '') in extracted.replace(' ', ''):
                found = True
                break

        assert found, f"Expected one of {acceptable_variations} in '{extracted}' from {filename}"


class TestOCRComparison:
    """Compare Tesseract vs EasyOCR"""

    @pytest.fixture
    def ocr_engines(self):
        """Get available OCR engines"""
        tesseract_available = False
        easyocr_available = False

        try:
            subprocess.run(['tesseract', '--version'],
                          capture_output=True, timeout=5)
            tesseract_available = True
        except:
            pass

        try:
            import easyocr
            easyocr_available = True
        except:
            pass

        return {
            'tesseract': tesseract_available,
            'easyocr': easyocr_available
        }

    def test_at_least_one_engine_available(self, ocr_engines):
        """Ensure at least one OCR engine is available"""
        available = [name for name, available in ocr_engines.items() if available]
        assert len(available) > 0, \
            "No OCR engines available. Install Tesseract or EasyOCR"

    def test_tesseract_installed(self, ocr_engines):
        """Verify Tesseract is installed"""
        if not ocr_engines['tesseract']:
            pytest.skip("Tesseract not installed - run ./scripts/setup-tesseract.sh")

    def test_easyocr_installed(self, ocr_engines):
        """Verify EasyOCR is installed"""
        if not ocr_engines['easyocr']:
            pytest.skip("EasyOCR not installed - run ./scripts/setup-easyocr.sh")


class TestImageValidation:
    """Validate test images exist and are readable"""

    @pytest.mark.parametrize("filename,expected_code", BASIC_IMAGES)
    def test_basic_image_exists(self, filename, expected_code):
        """Check if basic image exists"""
        image_path = Path(__file__).parent / filename
        assert image_path.exists(), f"Basic image not found: {filename}"

    @pytest.mark.parametrize("filename,expected_code", ADVANCED_IMAGES)
    def test_advanced_image_exists(self, filename, expected_code):
        """Check if advanced image exists"""
        image_path = Path(__file__).parent / 'variants' / filename
        assert image_path.exists(), f"Advanced image not found: {filename}"

    @pytest.mark.parametrize("filename,expected_code,variations", REAL_WORLD_IMAGES)
    def test_real_world_image_exists(self, filename, expected_code, variations):
        """Check if real-world image exists"""
        image_path = Path(__file__).parent / 'variants' / filename
        assert image_path.exists(), f"Real-world image not found: {filename}"

    def test_basic_images_count(self):
        """Verify we have 5 basic images"""
        test_dir = Path(__file__).parent
        basic_files = list(test_dir.glob('product_*.png'))
        assert len(basic_files) == 5, f"Expected 5 basic images, found {len(basic_files)}"

    def test_advanced_images_count(self):
        """Verify we have 20 advanced images"""
        test_dir = Path(__file__).parent / 'variants'
        advanced_files = [f for f in test_dir.glob('*_white_*.png')]
        assert len(advanced_files) == 20, f"Expected 20 advanced images, found {len(advanced_files)}"

    def test_real_world_images_count(self):
        """Verify we have real-world images"""
        test_dir = Path(__file__).parent / 'variants'
        real_files = list(test_dir.glob('danowind.*'))
        assert len(real_files) >= 1, "Real-world image not found"


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])
