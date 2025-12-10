#!/usr/bin/env python3

"""
Validate test images for LogistiQ MVP
Checks that all test images exist and are valid PNG files
"""

from PIL import Image
import os
import json

EXPECTED_IMAGES = [
    'product_12345.png',
    'product_54321.png',
    'product_67890.png',
    'product_11111.png',
    'product_22222.png',
]

def validate_images():
    """Validate all test images"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    errors = []
    warnings = []

    print("=" * 60)
    print("LogistiQ Test Images Validation")
    print("=" * 60)
    print()

    # Check each image
    for image_name in EXPECTED_IMAGES:
        image_path = os.path.join(script_dir, image_name)

        print(f"Validating: {image_name}...", end=" ")

        # Check if file exists
        if not os.path.exists(image_path):
            print("❌ MISSING")
            errors.append(f"Image not found: {image_name}")
            continue

        try:
            # Try to open and validate as PNG
            img = Image.open(image_path)

            # Check if it's actually a valid image
            img.verify()

            # Reopen since verify closes the image
            img = Image.open(image_path)
            width, height = img.size
            file_size = os.path.getsize(image_path) / 1024  # KB

            print(f"✓ OK ({width}x{height}px, {file_size:.1f}KB)")

        except Exception as e:
            print(f"❌ INVALID")
            errors.append(f"Image validation failed for {image_name}: {str(e)}")

    print()
    print("=" * 60)
    print("Validation Summary")
    print("=" * 60)
    print()

    if errors:
        print("❌ ERRORS FOUND:")
        for error in errors:
            print(f"  • {error}")
        print()
        return False
    else:
        print("✓ All images validated successfully!")
        print()
        print("📸 Test images ready for use:")
        for image_name in EXPECTED_IMAGES:
            code = image_name.replace('product_', '').replace('.png', '')
            print(f"  • {code}: {image_name}")
        print()
        return True

if __name__ == '__main__':
    success = validate_images()
    exit(0 if success else 1)
