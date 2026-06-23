#!/bin/bash

# Define the target directory
TARGET_DIR="public/devices/large"
OUTPUT_DIR="public/devices"

# Check if the target directory exists
if [ ! -d "$TARGET_DIR" ]; then
  echo "Target directory $TARGET_DIR does not exist!"
  exit 1
fi

# Define the file extensions to check
extensions=("png" "jpg" "jpeg" "webp")

# Loop over each file extension
for ext in "${extensions[@]}"; do
  for img in "$TARGET_DIR"/*."$ext"; do
    # Extract the filename without the extension and append .webp for output
    filename=$(basename "$img")
    output="$OUTPUT_DIR/${filename%.*}.webp"
    
    # Resize and convert the image to WebP format using cwebp
    cwebp "$img" -resize 500 0 -o "$output"
    
    echo "Resized $img -> $output"
  done
done
