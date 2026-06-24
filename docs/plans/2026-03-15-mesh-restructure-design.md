# Mesh Restructure Design

## Goal

Restructure the site from Meshtastic-only to support multiple mesh firmwares (Meshtastic, MeshCore, future additions). Move routes under `/mesh/`, add firmware filtering, and create SEO landing pages for each technology.

## Architecture

Routes move from `/meshtastic/devices/` to `/mesh/devices/`. Devices gain a `supported_firmware` multi-select field. SEO landing pages at `/mesh/meshtastic/` and `/mesh/meshcore/` provide content-rich entry points with preview grids of popular devices linking to filtered listings. 301 redirects preserve existing SEO equity.

## Routing

### New routes
```
app/
├── page.tsx                          # Home (unchanged)
├── mesh/
│   ├── devices/
│   │   ├── page.tsx                  # Device listing (all mesh devices, with firmware filter)
│   │   └── [id]/page.tsx             # Device detail
│   ├── antennas/
│   │   ├── page.tsx                  # Antenna listing
│   │   └── [id]/page.tsx             # Antenna detail
│   ├── meshtastic/
│   │   └── page.tsx                  # SEO landing page (content + popular device preview + CTA)
│   └── meshcore/
│       └── page.tsx                  # SEO landing page (content + popular device preview + CTA)
├── about/page.tsx
├── sitemap.ts
└── robots.ts
```

### Future expansion
```
├── ham-radio/
│   ├── devices/
│   ├── antennas/
│   └── ...
```

### Redirects (301, via next.config.mjs)
- `/meshtastic/devices` → `/mesh/devices`
- `/meshtastic/devices/:id` → `/mesh/devices/:id`
- `/meshtastic/antennas` → `/mesh/antennas`
- `/meshtastic/antennas/:id` → `/mesh/antennas/:id`
- `/meshtastic` → `/mesh/meshtastic`
- `/mesh` → `/mesh/devices`

## Data Layer

### New `supported_firmware` field on devices
- rfindex-data: add to JSON schema, CMS config, each device JSON file
- rfindex: add to `Device` TypeScript type
- Prebuild script passes through (no mapping)
- New derived constant: `allFirmwares` in `lib/data.ts`

### Antennas unchanged
Antennas are firmware-agnostic — no firmware field needed.

## Device Filters

New "Firmware" filter section in `device-filters.tsx`:
- Multi-select checkboxes (same pattern as microcontroller filter)
- URL param: `?firmware=Meshtastic,MeshCore`
- Logic: ANY match (device supports at least one selected firmware)

## SEO Landing Pages

`/mesh/meshtastic/` and `/mesh/meshcore/` each have:
- Hero section with technology name and description
- Key features / what makes it unique
- Getting started guidance
- Preview grid of popular devices for that firmware
- CTA button linking to `/mesh/devices/?firmware=<firmware>`
- Not in main navigation — accessed via Mesh dropdown or organic search

## Navigation

"Meshtastic" dropdown becomes "Mesh" dropdown:
- Devices → `/mesh/devices`
- Antennas → `/mesh/antennas`
- Meshtastic → `/mesh/meshtastic`
- MeshCore → `/mesh/meshcore`

## Sitemap & SEO

- All canonical URLs update to new `/mesh/` paths
- Sitemap generates entries for new routes
- Landing pages get optimized metadata for technology-specific search terms
