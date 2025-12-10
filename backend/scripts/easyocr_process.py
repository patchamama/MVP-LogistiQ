#!/usr/bin/env python3
"""
EasyOCR processing script
Receives an image path and returns JSON with OCR results
"""

import sys
import json
import easyocr

def process_image(image_path):
    """Process image with EasyOCR"""
    try:
        # Initialize reader (English + Spanish)
        reader = easyocr.Reader(['en', 'es'], gpu=False)

        # Process image
        results = reader.readtext(image_path)

        # Extract text
        text_parts = [result[1] for result in results]
        raw_text = ' '.join(text_parts).strip()

        return {
            'success': True,
            'raw_text': raw_text,
            'confidence': sum(result[2] for result in results) / len(results) if results else 0
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({
            'success': False,
            'error': 'Image path required'
        }))
        sys.exit(1)

    image_path = sys.argv[1]
    result = process_image(image_path)
    print(json.dumps(result))
