#!/bin/bash
# Generate placeholder images using ImageMagick (if available) or create simple HTML files

# Check if ImageMagick is available
if command -v convert &> /dev/null; then
    # Generate actual images with ImageMagick
    convert -size 1200x600 xc:#667eea -pointsize 60 -fill white -gravity center -annotate +0+0 "Hero Image" /home/swift/aiaca/apps/demo-site/public/images/hero.jpg
    convert -size 400x300 xc:#4A90E2 -pointsize 40 -fill white -gravity center -annotate +0+0 "Automated\nScanning" /home/swift/aiaca/apps/demo-site/public/images/feature-1.jpg
    convert -size 400x300 xc:#48bb78 -pointsize 40 -fill white -gravity center -annotate +0+0 "Real-time\nMonitoring" /home/swift/aiaca/apps/demo-site/public/images/feature-2.jpg
    convert -size 200x60 xc:#2d3748 -pointsize 24 -fill white -gravity center -annotate +0+0 "AACA" /home/swift/aiaca/apps/demo-site/public/images/logo.png
    echo "Images generated successfully with ImageMagick"
else
    echo "ImageMagick not available - creating placeholder note"
    echo "Images will be created during Docker build or use placeholder URLs"
fi
