# Data Source Migration Notes

Notes for converting rfindex to consume data from the `rfindex-data` repo instead of inline TypeScript arrays.

## Current State

- **rfindex**: Data lives in `data/devices.ts` and `data/antennas.ts` as TypeScript arrays. All consumers import through `lib/data.ts`.
- **rfindex-data**: Individual JSON files per entity in `data/meshtastic_devices/`, managed via Decap CMS. Images stored in `data/meshtastic_devices/images/`. No antenna data yet.

## Data Format Differences

### Meshtastic Devices

| Field | rfindex (current) | rfindex-data (new) | Action needed |
|-------|-------------------|-------------------|---------------|
| identifier | `id` field (e.g. `"heltec-lora-32-v3"`) | filename (e.g. `lora-32-v3-heltec.json`) | Derive `id` from filename or add field |
| name | `name` | `title` | Rename on import |
| image | `image_url: string[]` (array) | `image: string` (single) | Wrap in array on import |
| price.min/max | `number \| string` | `number` (floats) | rfindex type allows both, no issue |
| manufacturer | plain string | string (relation to `meshtastic_manufacturers/`) | Same value, no change |
| features | `string[]` | `string[]` (relation to `meshtastic_features/`) | Same shape |
| purchase_urls[].type | optional `type` field | not present | Will be `undefined`, fine |

### Antennas

**rfindex-data does not have antenna data yet.** Antenna migration is blocked until that collection is added to the data repo. Keep `data/antennas.ts` as-is for now.

### Missing from rfindex-data

- Antenna data (entire collection)
- `featureDescriptions` (UI copy — should stay in rfindex regardless)
- `statusOptions` (UI constant — already moved to `lib/data.ts`)

## Data Quality Issues in rfindex-data

Per `REVIEW.md` in that repo:

- 6 duplicate Seeed Studio device pairs with conflicting data
- 7 files with price type mismatches (strings instead of numbers)
- Enum violations: inconsistent casing in `power_consumption` and `battery.type` values
- 2 files misspell "Proprietary" as "Propritary" in interfaces
- No validation layer — CMS enforces enums in UI but direct JSON edits bypass checks

**These must be resolved before migration.** The rfindex site currently has clean, consistent data.

## Integration Approach Options

Must remain $0 cost (Vercel free tier).

### Option A: Git submodule
- Add `rfindex-data` as a git submodule
- Read JSON files at build time in `lib/data.ts`
- Pros: simple, no external services, Vercel supports submodules
- Cons: submodules are awkward to work with, must remember to update

### Option B: npm package
- Publish `rfindex-data` as a package (npm or GitHub Packages)
- Import JSON directly from the package
- Pros: clean dependency management, versioned
- Cons: extra publish step on every data change, GitHub Packages free tier limit

### Option C: Build-time fetch from GitHub
- Fetch raw JSON from GitHub API during `next build`
- Pros: always latest data, no submodule management
- Cons: GitHub API rate limits, build depends on external service, fragile

### Option D: Copy script
- Script that copies JSON from a local clone of `rfindex-data` into `data/`
- Pros: simple, works locally
- Cons: manual step, not automated on Vercel

**Recommendation: Option A (git submodule)** — simplest, free, works on Vercel with zero config.

## Implementation Checklist

### Pre-migration (in rfindex-data)
- [ ] Fix all data quality issues from REVIEW.md
- [ ] Add JSON Schema validation to CI
- [ ] Standardize device filenames to match rfindex `id` values (or add `id` field to JSON)
- [ ] Add antenna data collection

### Migration (in rfindex)
- [ ] Add rfindex-data as git submodule
- [ ] Create JSON loader in `lib/data.ts` that reads from submodule path
- [ ] Map field names (`title` → `name`, `image` → `image_url[]`)
- [ ] Validate imported data against `types/device.ts` shape at build time
- [ ] Move device images from `public/devices/` to use submodule images (or copy at build time)
- [ ] Update `data/devices.ts` to re-export loaded JSON (or remove entirely)
- [ ] Keep `data/antennas.ts` until antenna data exists in rfindex-data
- [ ] Verify build still passes with new data source
- [ ] Set up Vercel deploy hook triggered by rfindex-data pushes (so site rebuilds when data changes)

### Post-migration cleanup
- [ ] Remove inline device data from `data/devices.ts`
- [ ] Remove device images from `public/devices/`
- [ ] Update CLAUDE.md to reflect new data flow
- [ ] Update "Adding Data" section to point to rfindex-data repo
