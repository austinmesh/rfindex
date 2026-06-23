# Contributing to RFIndex Data

Thanks for helping build a better reference for amateur radio and Meshtastic equipment. This guide covers how to add or update data in this repo.

## Before you start

- Read the [README](README.md) for an overview of the data structure.
- All data lives in `data/` as JSON files. Each file represents one entry (one radio, one device, one band, etc.).
- The schemas in `schemas/` define what fields are required and what values are valid. Run `npm test` to validate your changes locally before submitting.

## Ground rules

- **One device or radio per PR.** This keeps reviews fast and diffs easy to read.
- **Prices must be numbers, not strings.** Write `"min": 49.99`, not `"min": "49.99"`.
- **Use the exact enum values.** Fields like `power_consumption`, `battery.type`, `category`, and `interfaces` only accept specific values. Check `schemas/meshtastic_devices.json` or `admin/config.yml` for the allowed options.
- **Referral links may be added or modified.** Purchase URLs you submit may be updated to include affiliate tracking. See the [README disclaimers](README.md#important-disclaimers).

## Adding a new Meshtastic device

1. Create `data/meshtastic_devices/{model}-{manufacturer}.json` (lowercase kebab-case).
2. Follow the schema in `schemas/meshtastic_devices.json`. See existing files for examples.
3. If you have a product image, add it as a `.webp` file (under 200KB) in `data/meshtastic_devices/images/` and reference it as `/devices/filename.webp`.
4. Run `npm test` to validate.

## Adding a new ham radio

1. Create `data/radios/{model}.json` (lowercase kebab-case).
2. Follow the schema in `schemas/radios.json`. See `data/radios/uv-5r.json` for an example.
3. Run `npm test` to validate.

## Adding a new enum value

If a device needs a value that isn't in the current options (e.g. a new microcontroller or interface), update both:

1. `admin/config.yml` — the relevant field's `options` list
2. `schemas/*.json` — the corresponding `enum` array

## Fixing existing data

Corrections to specs, prices, or descriptions are welcome. Just edit the relevant JSON file and open a PR.

## Submitting your PR

1. Fork the repo and create a branch.
2. Make your changes.
3. Run `npm install && npm test` to verify validation passes.
4. Open a pull request. The PR template will guide you through what to include.
