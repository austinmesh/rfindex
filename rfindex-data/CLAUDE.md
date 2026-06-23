# CLAUDE.md

## Project overview

This is the data repository for [rfindex.com](https://rfindex.com) — a reference site for amateur radio and Meshtastic equipment. All content is stored as flat JSON files under `data/` and managed via a Decap CMS admin UI defined in `admin/`.

There is no build step and no application code. The repo is purely data + CMS configuration + JSON Schema validation.

## Repository structure

```
admin/
  config.yml      # Decap CMS collection/field definitions (source of truth for field types)
  index.html      # CMS entry point (loads Decap CMS from CDN)
schemas/            # JSON Schema files — one per collection, used by validation script
scripts/
  validate.js     # Validates all data/ JSON files against their schemas
.github/
  workflows/
    validate.yml  # CI: runs npm test on PRs and pushes to main
  CODEOWNERS        # Requires maintainer review on all PRs
  pull_request_template.md
  ISSUE_TEMPLATE/   # Structured forms for new devices and data corrections
data/
  bands/              # Ham radio bands (2m, 70cm, etc.) — {title, wavelength, lower_frequency, upper_frequency}
  manufacturers/      # Ham radio manufacturers — {title}
  modulations/        # Modes/protocols (FM, DMR, FT8, etc.) — {title}
  antenna_connectors/ # Connector types (SMA-F, BNC, etc.) — {title}
  radios/             # Ham radio specs — complex schema (see config.yml "radios" collection)
  meshtastic_manufacturers/ # Meshtastic device makers — {title}
  meshtastic_features/      # Feature tags (GPS, WiFi, etc.) — {title}
  meshtastic_devices/       # Meshtastic devices — complex schema (see config.yml "meshtastic_devices")
    images/                 # Device images (.webp, max 200KB)
  meshtastic_antennas/      # Meshtastic antennas — complex schema (see config.yml "meshtastic_antennas")
    images/                 # Antenna images (.webp, max 200KB)
  suppliers/                # Retailers/purchase sources — {title}
```

## Key conventions

### File naming
- All JSON files use **lowercase kebab-case**: `sma-f.json`, `d-star.json`, `uv-5r.json`
- Meshtastic devices use `{model}-{manufacturer}.json`: `t-deck-lilygo.json`, `h1-muzi.json`
- Images use descriptive kebab-case `.webp` filenames

### Data rules
- `schemas/*.json` are the **canonical schema definitions** enforced by CI — always check them before creating or modifying data files. `admin/config.yml` defines CMS field types and must be kept in sync
- Relation fields store the `title` string of the referenced collection entry (not a file path or ID)
- Frequency values in `bands/` are strings with units: `"144 MHz"`. In `radios/` frequency_ranges, they are plain numbers in MHz
- Prices are floats (not strings). Currency is always `"USD"`
- Dimensions are in mm, weight in grams, battery capacity in mAh
- `output_power` in radios is a flat list of watt values: `[1, 5]`
- Device images are referenced as `/devices/filename.webp` in the JSON but stored at `data/meshtastic_devices/images/`

### Valid enum values (from config.yml)
- **Wavelength**: LF, MF, HF, VHF, UHF, SHF, UHF/SHF
- **Form factor** (radios): Handheld, Mobile, Base, Portable, SDR, Other
- **Category** (meshtastic_devices): DIY, Complete, Solar, Standalone (multi-select)
- **Category** (meshtastic_antennas): Internal Device Antennas, Fixed (Base) Antennas, Portable Antennas, Vehicle Antennas
- **Connector type** (meshtastic_antennas): u.FL/IPEX, N-Type Male, N-Type Female, SMA Male, RP-SMA Male, NMO
- **LoRa frequencies**: 144 MHz, 433 MHz, 868 MHz, 915 MHz, 2.4 GHz
- **Microcontroller**: ARM Cortex-M4, ESP32, ESP32-S3, Raspberry Pi 5, nRF52
- **Power consumption**: Low, Average, High
- **Battery type**: 18650 Li-ion, DIY, External, Li-ion, LiPo, LTO, None
- **Interfaces**: 3.5mm audio, Bluetooth Low Energy (BLE), E-Ink, Ethernet, GPIO, Grove, I2C, LAN, M8 5-pin connector, Microphone, MicroSD, Proprietary USB magnetic charging cable, PWM, Qwiic, Speaker, SPI, UART, Micro USB, USB-C

## Validation

```
npm test
```

Runs `scripts/validate.js` which checks every JSON file in `data/` against its corresponding schema in `schemas/`. This also runs in CI on every PR via `.github/workflows/validate.yml`.

When adding a new enum value to `admin/config.yml`, also update the corresponding schema in `schemas/`.

## Running locally

```
npm install
npm run serve
# Opens CMS at http://localhost:8080/#/
```

This runs `netlify-cms-proxy-server` (for local Git backend) and `serve` (static file server) concurrently.

## Common tasks

- **Add a new device/antenna/radio/band/etc.**: Create a JSON file in the appropriate `data/` subdirectory following the schema in `config.yml`. Or use the CMS UI. Antennas go in `data/meshtastic_antennas/` and their images in `data/meshtastic_antennas/images/`.
- **Add a new enum option** (e.g. new microcontroller, interface, battery type): Update `admin/config.yml` under the relevant field's `options` list **and** the corresponding `schemas/*.json` enum array.
- **Add a new collection**: Add a new section to `admin/config.yml` and create the corresponding `data/` subdirectory.
- **Add a device image**: Place a `.webp` file (under 200KB) in `data/meshtastic_devices/images/` and reference it as `/devices/filename.webp` in the device JSON.
- **Add an antenna image**: Place a `.webp` file (under 200KB) in `data/meshtastic_antennas/images/` and reference it as `/meshtastic/antennas/filename.webp` in the antenna JSON.
