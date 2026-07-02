#!/usr/bin/env bash
# Convert a source image to an RF Index WebP (target <= ~200 KB, the CMS cap).
#
# Destinations:
#   device  -> data/meshtastic_devices/images/<name>.webp   (field: /devices/<name>.webp)
#   antenna -> data/meshtastic_antennas/images/<name>.webp  (field: <name>.webp)
#
# Usage: to-webp.sh <source-image> <dest.webp>
set -euo pipefail

src="${1:-}"
dest="${2:-}"
if [ -z "$src" ] || [ -z "$dest" ]; then
  echo "usage: to-webp.sh <source-image> <dest.webp>" >&2
  exit 2
fi
if ! command -v cwebp >/dev/null 2>&1; then
  echo "cwebp not found — install with: brew install webp" >&2
  exit 1
fi

cwebp -q 80 -resize 800 0 "$src" -o "$dest"

size=$(wc -c < "$dest" | tr -d ' ')
echo "wrote $dest (${size} bytes)"
if [ "$size" -gt 200000 ]; then
  echo "WARNING: >200 KB — re-run with a lower -q or a smaller -resize width" >&2
fi
