#!/usr/bin/env python3

"""
Advanced test image generator for LogistiQ MVP
Generates realistic product label images with multiple fonts, white backgrounds,
and hardware/parts texture backgrounds
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import random
import os

# Test products matching backend data/products.json
TEST_PRODUCTS = [
    {
        'code': '12345',
        'name': 'Tornillo M8x20',
        'price': '0.50',
        'part_type': 'screw',
    },
    {
        'code': '54321',
        'name': 'Arandela de nylon',
        'price': '2.50',
        'part_type': 'washer',
    },
    {
        'code': '67890',
        'name': 'Tuerca M10',
        'price': '0.75',
        'part_type': 'nut',
    },
    {
        'code': '11111',
        'name': 'Rodamiento 6203',
        'price': '15.99',
        'part_type': 'bearing',
    },
    {
        'code': '22222',
        'name': 'Cable acero',
        'price': '1.20',
        'part_type': 'cable',
    },
]

FONT_VARIANTS = [
    ('Helvetica', 'regular'),
    ('Helvetica', 'bold'),
    ('Courier', 'regular'),
    ('Courier', 'bold'),
]

def get_available_fonts():
    """Get available system fonts"""
    font_paths = {}

    # Common macOS font paths
    font_base_paths = [
        '/System/Library/Fonts',
        '/Library/Fonts',
        '/System/Library/Fonts/Supplemental'
    ]

    # Try to find specific fonts
    common_fonts = {
        'Helvetica': ['Helvetica.ttc'],
        'Courier': ['Courier.dfont', 'CourierNew.ttf'],
        'Arial': ['Arial.ttf'],
        'Times': ['Times.ttf', 'TimesNewRoman.ttf'],
    }

    for font_name, filenames in common_fonts.items():
        for base_path in font_base_paths:
            for filename in filenames:
                full_path = os.path.join(base_path, filename)
                if os.path.exists(full_path):
                    font_paths[font_name] = full_path
                    break
            if font_name in font_paths:
                break

    return font_paths

def load_font(font_name, size, font_paths):
    """Load a font, with fallback to default"""
    try:
        if font_name in font_paths:
            return ImageFont.truetype(font_paths[font_name], size)
    except:
        pass
    return ImageFont.load_default()

def create_metal_texture(width, height, color_base=(200, 200, 200)):
    """Create a metal/hardware texture background"""
    img = Image.new('RGB', (width, height), color_base)
    pixels = img.load()

    # Add metallic pattern with subtle variations
    for x in range(width):
        for y in range(height):
            # Add subtle metallic sheen
            noise = random.randint(-10, 10)
            r = max(0, min(255, color_base[0] + noise))
            g = max(0, min(255, color_base[1] + noise))
            b = max(0, min(255, color_base[2] + noise))

            # Add some diagonal lines every 5 pixels (machined look)
            if (x + y) % 8 == 0:
                r = max(0, r - 5)
                g = max(0, g - 5)
                b = max(0, b - 5)

            pixels[x, y] = (r, g, b)

    # Add blur for smoothness
    img = img.filter(ImageFilter.GaussianBlur(radius=1))
    return img

def draw_part_pattern(draw, width, height, part_type):
    """Draw a subtle pattern representing the part type"""
    if part_type == 'screw':
        # Draw spiral pattern for screws
        center_x, center_y = width // 2, height - 50
        for i in range(5):
            x = center_x + i * 15
            draw.ellipse([x - 3, center_y - 3, x + 3, center_y + 3],
                        outline=(220, 220, 220), width=1)

    elif part_type == 'washer':
        # Draw concentric circles for washers
        center_x, center_y = width // 2, height - 50
        for i in range(3, 0, -1):
            radius = 15 + (i * 8)
            draw.ellipse([center_x - radius, center_y - radius,
                         center_x + radius, center_y + radius],
                        outline=(220, 220, 220), width=2)

    elif part_type == 'nut':
        # Draw hexagon for nuts
        center_x, center_y = width // 2, height - 50
        import math
        points = []
        for i in range(6):
            angle = math.pi / 3 * i
            x = center_x + 20 * math.cos(angle)
            y = center_y + 20 * math.sin(angle)
            points.append((x, y))
        draw.polygon(points, outline=(220, 220, 220), width=2)

    elif part_type == 'bearing':
        # Draw rolling elements for bearings
        center_x, center_y = width // 2, height - 50
        draw.ellipse([center_x - 20, center_y - 20,
                     center_x + 20, center_y + 20],
                    outline=(220, 220, 220), width=2)
        for i in range(4):
            import math
            angle = math.pi / 2 * i
            x = center_x + 15 * math.cos(angle)
            y = center_y + 15 * math.sin(angle)
            draw.ellipse([x - 3, y - 3, x + 3, y + 3],
                        fill=(230, 230, 230), outline=(200, 200, 200))

    elif part_type == 'cable':
        # Draw rope pattern for cables
        center_x, center_y = width // 2, height - 50
        for x in range(center_x - 25, center_x + 25, 5):
            draw.arc([x - 2, center_y - 5, x + 2, center_y + 5],
                    0, 180, fill=(220, 220, 220), width=1)

def generate_product_label_variant(product, variant_name, font_variant, output_path, font_paths):
    """
    Generate a product label image variant

    Args:
        product: Dictionary with product information
        variant_name: Name of the variant (e.g., "white_modern")
        font_variant: Tuple of (font_name, font_style)
        output_path: Path where to save the image
        font_paths: Dictionary of available fonts
    """
    width, height = 500, 400

    # Create base: white background with subtle texture
    if variant_name.startswith('white'):
        # White background with subtle metallic texture
        img = Image.new('RGB', (width, height), (250, 250, 250))
        texture_img = create_metal_texture(width, height, (250, 250, 250))
        img = Image.blend(img, texture_img, 0.3)
    else:
        # Alternative: light gray with texture
        img = Image.new('RGB', (width, height), (245, 245, 245))
        texture_img = create_metal_texture(width, height, (245, 245, 245))
        img = Image.blend(img, texture_img, 0.2)

    draw = ImageDraw.Draw(img)

    # Draw subtle border
    margin = 8
    draw.rectangle([margin, margin, width - margin, height - margin],
                   outline=(180, 180, 180), width=2)

    # Draw part pattern at bottom
    draw_part_pattern(draw, width, height, product['part_type'])

    # Setup fonts
    font_name, font_style = font_variant

    # Load fonts with different sizes
    title_size = 22 if font_style == 'regular' else 24
    code_size = 60
    info_size = 16

    # Try to get bold variants when needed
    title_font = load_font(font_name, title_size, font_paths)
    code_font = load_font(font_name, code_size, font_paths)
    info_font = load_font(font_name, info_size, font_paths)

    # Draw product name
    name_y = 30
    draw.text((width // 2, name_y), product['name'],
             fill=(40, 40, 40), font=title_font, anchor='mm')

    # Draw separator line
    sep_y = 70
    draw.line([(30, sep_y), (width - 30, sep_y)], fill=(200, 200, 200), width=1)

    # Draw large product code (main feature)
    code_y = height // 2 - 20
    # Add background box for code
    code_bbox = draw.textbbox((width // 2, code_y), product['code'],
                              font=code_font, anchor='mm')
    box_margin = 15
    draw.rectangle([code_bbox[0] - box_margin, code_bbox[1] - box_margin,
                   code_bbox[2] + box_margin, code_bbox[3] + box_margin],
                   fill=(245, 245, 245), outline=(150, 150, 150), width=2)

    draw.text((width // 2, code_y), product['code'],
             fill=(0, 0, 0), font=code_font, anchor='mm')

    # Draw price below code
    price_text = f"€{product['price']}"
    price_y = height // 2 + 50
    draw.text((width // 2, price_y), price_text,
             fill=(60, 120, 200), font=info_font, anchor='mm')

    # Draw barcode-like elements at very bottom
    barcode_y = height - 40
    bar_width = 2
    bar_spacing = 4
    num_bars = 25

    start_x = width // 2 - (num_bars * (bar_width + bar_spacing)) // 2
    for i in range(num_bars):
        x = start_x + (i * (bar_width + bar_spacing))
        bar_height = 12 if (i % 3 == 0) else 8
        draw.rectangle([x, barcode_y - bar_height, x + bar_width, barcode_y],
                      fill=(100, 100, 100))

    # Add product code below barcode
    small_code_y = barcode_y + 15
    draw.text((width // 2, small_code_y), product['code'],
             fill=(100, 100, 100), font=info_font, anchor='mm')

    # Save image
    img.save(output_path, 'PNG')
    print(f"✓ Generated: {os.path.basename(output_path)}")

def main():
    """Generate all advanced test images"""
    script_dir = os.path.dirname(os.path.abspath(__file__))

    # Get available fonts
    font_paths = get_available_fonts()

    print("=" * 70)
    print("Advanced Test Image Generator for LogistiQ MVP")
    print("=" * 70)
    print()
    print(f"Available fonts found: {list(font_paths.keys())}")
    print()

    variants = [
        ('white_modern', ('Helvetica', 'bold')),
        ('white_classic', ('Times', 'regular')),
        ('white_monospace', ('Courier', 'regular')),
        ('white_mono_bold', ('Courier', 'bold')),
    ]

    total_images = 0

    for product in TEST_PRODUCTS:
        print(f"\n📦 Product: {product['name']} ({product['code']})")

        for variant_name, font_variant in variants:
            # Create variant folder if needed
            variant_dir = os.path.join(script_dir, 'variants')
            os.makedirs(variant_dir, exist_ok=True)

            # Generate filename
            filename = f"{product['code']}_{variant_name}.png"
            output_path = os.path.join(variant_dir, filename)

            try:
                generate_product_label_variant(
                    product,
                    variant_name,
                    font_variant,
                    output_path,
                    font_paths
                )
                total_images += 1
            except Exception as e:
                print(f"  ✗ Error generating {filename}: {e}")

    print()
    print("=" * 70)
    print(f"✓ Successfully generated {total_images} test images!")
    print("=" * 70)
    print()
    print("📁 Image organization:")
    print("  • tests/product_*.png - Original simple images (white background)")
    print("  • tests/variants/ - Advanced variants with different fonts")
    print()
    print("📸 Variants created:")
    for variant_name, font_variant in variants:
        font_name, font_style = font_variant
        print(f"  • {variant_name}: {font_name} ({font_style})")
    print()
    print("🧪 Testing suggestions:")
    print("  1. Test with simple images first (basic fonts)")
    print("  2. Test with variants (different fonts and styles)")
    print("  3. Compare OCR accuracy across different fonts")
    print("  4. Verify Tesseract vs EasyOCR performance")
    print()
    print("📊 Products included:")
    for product in TEST_PRODUCTS:
        print(f"  • {product['code']}: {product['name']}")
    print()

if __name__ == '__main__':
    main()
