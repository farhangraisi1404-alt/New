#!/usr/bin/env python3
"""
Icon Generator for Ultra-Coder PWA
Generates PNG icons from SVG for various sizes needed by PWA
"""

import base64

# SVG icon template
SVG_TEMPLATE = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6c5ce7"/>
      <stop offset="100%" style="stop-color:#00cec9"/>
    </linearGradient>
  </defs>
  <rect width="{size}" height="{size}" rx="{radius}" fill="url(#bg)"/>
  <text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" 
        font-family="Arial, sans-serif" font-size="{font_size}" fill="white">⚡</text>
</svg>'''

SIZES = [72, 96, 128, 144, 152, 167, 180, 192, 512]

def generate_svg(size):
    radius = size * 0.2
    font_size = size * 0.5
    return SVG_TEMPLATE.format(size=size, radius=radius, font_size=font_size)

def main():
    print("Generating icons...")
    for size in SIZES:
        svg = generate_svg(size)
        filename = f"icons/icon-{size}.svg"
        with open(filename, 'w') as f:
            f.write(svg)
        print(f"Generated {filename}")
    
    print("\nNote: For production, convert these SVG files to PNG using:")
    print("  - Online: https://cloudconvert.com/svg-to-png")
    print("  - CLI: inkscape -w SIZE -h SIZE icon.svg -o icon-SIZE.png")
    print("  - Or use the icon generator in the app")

if __name__ == "__main__":
    main()
