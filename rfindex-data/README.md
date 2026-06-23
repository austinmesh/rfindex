# RFIndex Data

This directory holds the open dataset behind [rfindex.com](https://rfindex.com), a reference guide for amateur and LoRa mesh radio equipment. All of the device specs, band definitions, and product listings on the site are stored here as JSON files.

Contributions are welcome. Whether you want to add a missing radio, update specs on a device, or fix a typo, this repo is the place to do it.

## Important disclaimers

- **This is the data.** The rfindex.com website that renders it lives in the same repository, one directory up.
- **Referral links.** Purchase URLs in this dataset may contain affiliate/referral links. Revenue from these links supports Austin Mesh. By contributing data that includes purchase URLs, you acknowledge that these links may be modified to include referral tracking.
- **No guarantee of publication.** Contributions are reviewed before being merged. Data that appears in this repo will be displayed on rfindex.com at the maintainer's discretion.

## What's in here

Everything lives under the `data/` directory:

| Directory | What it contains |
| --- | --- |
| `radios/` | Amateur (ham) radio specifications — bands, power output, frequency ranges, connectors, dimensions, etc. |
| `meshtastic_devices/` | Meshtastic LoRa mesh devices — pricing, purchase links, specs, features, and product images |
| `bands/` | Amateur radio band definitions (2m, 70cm, 10m, etc.) with frequency ranges |
| `modulations/` | Modulation modes and digital protocols (FM, DMR, FT8, D-STAR, etc.) |
| `antenna_connectors/` | Antenna connector types (SMA-F, BNC, N-type, etc.) |
| `manufacturers/` | Radio manufacturers |
| `meshtastic_manufacturers/` | Meshtastic device manufacturers |
| `meshtastic_features/` | Feature tags for Meshtastic devices (GPS, WiFi, e-ink display, etc.) |
| `suppliers/` | Retailers and suppliers where devices can be purchased |

## Contributing

### Adding or editing data by hand

Each entry is a single JSON file. To contribute, you can edit files directly or create new ones.

**Adding a new ham radio:** Create a JSON file in `data/radios/` using this structure:

```json
{
  "title": "UV-5R",
  "manufacturer": "Baofeng",
  "form_factor": "Handheld",
  "supported_bands": ["2m", "70cm"],
  "modulations": ["FM"],
  "frequency_ranges": [
    { "lower": 144, "upper": 148, "tx": true },
    { "lower": 88, "upper": 107, "tx": false }
  ],
  "output_power": [1, 5],
  "antenna_connector": "SMA-F",
  "antenna_impedance_ohm": 50,
  "memory_channels": 128,
  "memory_banks": 1,
  "operating_voltage": 7.4,
  "battery_capacity_mah": 2000,
  "weight": 340,
  "dimensions": { "width": 180, "height": 280, "depth": 50 },
  "manufactured_country": "China",
  "manufactured_start_year": 2012
}
```

**Adding a new Meshtastic device:** Create a JSON file in `data/meshtastic_devices/` named `{model}-{manufacturer}.json`:

```json
{
  "title": "T-Deck",
  "manufacturer": "LILYGO",
  "description": "All-in-one portable ESP32-S3 device with keyboard, display, LoRa, and SX1262.",
  "image": "/devices/lilygo-t-deck.webp",
  "category": ["DIY", "Standalone", "Complete"],
  "features": ["WiFi", "Bluetooth", "Color Display", "SX1262"],
  "specifications": {
    "lora_frequencies": ["433 MHz", "868 MHz", "915 MHz"],
    "microcontroller": "ESP32",
    "power_consumption": "Average",
    "battery": { "type": "LiPo" },
    "antenna": "Internal or External via SMA connector",
    "interfaces": ["USB-C", "GPIO", "I2C", "SPI", "UART"]
  },
  "price": { "min": 43.08, "max": 94.99, "currency": "USD" },
  "purchase_urls": [
    { "supplier": "Amazon", "url": "https://amzn.to/example" }
  ]
}
```

Device images go in `data/meshtastic_devices/images/` as `.webp` files (max 200KB).

### Image optimization

A pre-commit hook automatically optimizes any staged `.webp` images in the device images directory. It resizes images to a max of 800px on the longest side, compresses at WebP quality 80, and rejects any image still over 200KB after optimization.

To run image optimization manually on all images:

```
npm run optimize-images
```

Or on specific files:

```
node scripts/optimize-images.js data/meshtastic_devices/images/my-device.webp
```

After cloning the repo, run `npm install` to set up the git hooks automatically (via the `prepare` script).

### Using the CMS editor

This repo includes a browser-based editor powered by [Decap CMS](https://decapcms.org/) for editing data without touching JSON files directly.

1. `npm install`
2. `npm run serve`
3. Open http://localhost:8080/#/

### Submitting changes

1. Fork the repository
2. Create a branch for your changes
3. Add or edit the relevant JSON files
4. Open a pull request with a brief description of what you added or changed

## License

This data is licensed under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) (Creative Commons Attribution-NonCommercial 4.0 International).

You are free to share and adapt this data for non-commercial purposes with attribution. You may **not** use this data for commercial purposes. See [LICENSE](LICENSE) for full terms.
