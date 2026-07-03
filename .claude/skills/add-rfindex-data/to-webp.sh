#!/usr/bin/env bash
# Convert a source image to an RF Index WebP (target <= ~200 KB, the CMS cap).
#
# Destinations:
#   device  -> data/mesh_devices/images/<name>.webp   (field: /devices/<name>.webp)
#   antenna -> data/mesh_antennas/images/<name>.webp  (field: <name>.webp)
#
# Width is capped at MAX_WIDTH (default 800, override with a 3rd arg) but the
# source is NEVER upscaled: a source narrower than the cap is converted at its
# native width, so a small thumbnail is not blown up into a blurry image.
#
# Usage: to-webp.sh <source-image> <dest.webp> [max-width]
set -euo pipefail

src="${1:-}"
dest="${2:-}"
max_width="${3:-800}"
if [ -z "$src" ] || [ -z "$dest" ]; then
  echo "usage: to-webp.sh <source-image> <dest.webp> [max-width]" >&2
  exit 2
fi
if ! command -v cwebp >/dev/null 2>&1; then
  echo "cwebp not found. install with: brew install webp" >&2
  exit 1
fi

# Read the source width with whatever is available (macOS sips or ImageMagick).
# If neither is present we skip resizing rather than risk an upscale.
src_width() {
  if command -v sips >/dev/null 2>&1; then
    sips -g pixelWidth "$1" 2>/dev/null | awk '/pixelWidth:/ {print $2}'
  elif command -v identify >/dev/null 2>&1; then
    identify -format '%w' "$1[0]" 2>/dev/null
  fi
}

w="$(src_width "$src" || true)"
if printf '%s' "$w" | grep -qE '^[0-9]+$' && [ "$w" -gt "$max_width" ]; then
  # Source is wider than the cap: downscale to max_width (height auto).
  cwebp -q 80 -resize "$max_width" 0 "$src" -o "$dest"
else
  # Source at/below the cap, or width unknown: keep native width, never upscale.
  if [ -z "$w" ]; then
    echo "note: could not read source width; converting at native size (no resize)" >&2
  fi
  cwebp -q 80 "$src" -o "$dest"
fi

size=$(wc -c < "$dest" | tr -d ' ')
echo "wrote $dest (${size} bytes)"
if [ "$size" -gt 200000 ]; then
  echo "WARNING: >200 KB. re-run with a lower -q or a smaller max-width" >&2
fi
