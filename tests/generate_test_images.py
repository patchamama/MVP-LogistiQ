#!/usr/bin/env python3

"""
Generate test images for LogistiQ MVP
Creates realistic product label images with barcodes and product information
"""

from PIL import Image, ImageDraw, ImageFont
import os
import json

# Test products matching backend data/products.json
TEST_PRODUCTS = [
    {
        'code': '12345',
        'name': 'Tornillo M8x20',
        'price': '0.50',
        'color_bg': '#FF6B6B',  # Red
    },
    {
        'code': '54321',
        'name': 'Arandela de nylon',
        'price': '2.50',
        'color_bg': '#4ECDC4',  # Teal
    },
    {
        'code': '67890',
        'name': 'Tuerca M10',
        'price': '0.75',
        'color_bg': '#45B7D1',  # Blue
    },
    {
        'code': '11111',
        'name': 'Rodamiento 6203',
        'price': '15.99',
        'color_bg': '#F7B731',  # Yellow
    },
    {
        'code': '22222',
        'name': 'Cable acero',
        'price': '1.20',
        'color_bg': '#95E1D3',  # Mint
    },
]

def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def generate_product_label(product, output_path):
    """
    Generate a realistic product label image

    Args:
        product: Dictionary with product information
        output_path: Path where to save the image
    """
    # Create image with specified background color
    width, height = 400, 300
    bg_color = hex_to_rgb(product['color_bg'])
    img = Image.new('RGB', (width, height), bg_color)
    draw = ImageDraw.Draw(img)

    try:
        # Try to use system fonts
        title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 28)
        code_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 48)
        info_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 18)
    except (OSError, FileNotFoundError):
        # Fallback to default font
        title_font = ImageFont.load_default()
        code_font = ImageFont.load_default()
        info_font = ImageFont.load_default()

    # Draw white background for text area
    margin = 15
    draw.rectangle(
        [margin, margin, width - margin, height - margin],
        outline='white',
        width=3
    )

    # Draw product name at top
    name_y = 25
    draw.text((width // 2, name_y), product['name'], fill='white', font=title_font, anchor='mm')

    # Draw large product code (for barcode simulation)
    code_y = height // 2
    draw.text((width // 2, code_y), product['code'], fill='white', font=code_font, anchor='mm')

    # Draw price at bottom
    price_text = f"€{product['price']}"
    price_y = height - 50
    draw.text((width // 2, price_y), price_text, fill='white', font=info_font, anchor='mm')

    # Draw barcode-like pattern at the bottom
    barcode_y = height - 25
    bar_width = 3
    for i in range(0, 10):
        x = 50 + (i * 20)
        height_variation = 15 if (i % 2 == 0) else 10
        draw.rectangle(
            [x, barcode_y - height_variation, x + bar_width, barcode_y],
            fill='white'
        )

    # Save image
    img.save(output_path, 'PNG')
    print(f"✓ Created: {output_path}")

def main():
    """Generate all test images"""
    # Get script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))

    print("=" * 50)
    print("Generating Test Product Images")
    print("=" * 50)
    print()

    for product in TEST_PRODUCTS:
        filename = f"product_{product['code']}.png"
        output_path = os.path.join(script_dir, filename)
        generate_product_label(product, output_path)

    print()
    print("=" * 50)
    print("Test images created successfully!")
    print("=" * 50)
    print()
    print("📸 How to use:")
    print("  1. Open http://localhost:5173 in your browser")
    print("  2. Click 'Seleccionar Imagen' (Select Image)")
    print("  3. Choose an image from tests/ folder")
    print("  4. Select OCR engine (Tesseract, EasyOCR, or Both)")
    print("  5. Verify the product information appears correctly")
    print()
    print("📋 Test products available:")
    for product in TEST_PRODUCTS:
        print(f"  • {product['code']}: {product['name']} - €{product['price']}")
    print()

if __name__ == '__main__':
    main()
