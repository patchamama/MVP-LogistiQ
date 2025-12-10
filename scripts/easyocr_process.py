#!/usr/bin/env python3

"""
EasyOCR Image Processing Script
Processes an image file and extracts text using EasyOCR
Returns JSON output with extracted text
"""

import sys
import json
import os

def process_image(image_path):
    """
    Process an image file with EasyOCR

    Args:
        image_path: Path to the image file

    Returns:
        Dictionary with 'raw_text' key containing recognized text
    """
    try:
        import easyocr

        # Validate image file exists
        if not os.path.exists(image_path):
            return {
                'raw_text': '',
                'error': f'Image file not found: {image_path}'
            }

        # Initialize reader for Spanish and English
        reader = easyocr.Reader(['en', 'es'], gpu=False)

        # Process image
        results = reader.readtext(image_path)

        # Extract text from results
        extracted_text = '\n'.join([text[1] for text in results])

        return {
            'raw_text': extracted_text.strip()
        }

    except ImportError:
        return {
            'raw_text': '',
            'error': 'EasyOCR is not installed. Run: pip install easyocr'
        }
    except Exception as e:
        return {
            'raw_text': '',
            'error': f'Error processing image: {str(e)}'
        }

def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print(json.dumps({
            'raw_text': '',
            'error': 'Usage: easyocr_process.py <image_path>'
        }))
        sys.exit(1)

    image_path = sys.argv[1]
    result = process_image(image_path)

    # Output JSON response
    print(json.dumps(result))

if __name__ == '__main__':
    main()
