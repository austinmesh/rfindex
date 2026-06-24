# Data Migration Cleanup Plan

Preparation tasks for migrating the data layer from inline TypeScript (`data/devices.ts`, `data/antennas.ts`) to the external `rfindex-data` repo.

## ~~1. Deduplicate types — single source of truth~~ DONE

Both `data/devices.ts` and `data/antennas.ts` define types inline, duplicating what's already in `types/device.ts` and `types/antenna.ts`. Neither data file imports from `types/`.

**Action:** Remove inline types from `data/` files, import from `types/` instead. The `types/` directory becomes the shared contract that both this repo and `rfindex-data` can reference.

**Files:**
- `data/devices.ts` (lines 1–48) — inline Device types
- `data/antennas.ts` (lines 1–64) — inline Antenna types
- `types/device.ts` — canonical Device types
- `types/antenna.ts` — canonical Antenna types

## ~~2. Separate data from derived constants~~ DONE (also completed 3, 4, 6, 7)

Data files mix raw data with computed values (`allCategories`, `allFeatures`, `allLoraFrequencies`, `allMicrocontrollers`, `featureDescriptions`, `statusOptions`, sitemap data). When raw data comes from an external source, derivation logic should live in the web app, not travel with the data.

**Action:** Move derived constants into `lib/device-utils.ts` and `lib/antenna-utils.ts`, computing them from imported data.

**Derived constants to extract:**
- `allCategories` (devices)
- `allFeatures`
- `allLoraFrequencies`
- `allMicrocontrollers`
- `deviceSitemapData`
- `allCategories` (antennas)
- `antennaSitemapData`

## ~~3. Inconsistent derived constant patterns~~ DONE

Device filter options (`allCategories`, `allFeatures`, etc.) are pre-computed in the data file. Antenna filter options are split — `allCategories` is pre-computed, but `allConnectorTypes` and `allFrequencies` are derived at runtime via `useMemo` inside `antenna-filters.tsx` (lines 51–67).

**Action:** Use one consistent pattern. Pre-computing in utility files (per #2) is preferred.

## ~~4. Move `featureDescriptions` out of data file~~ DONE

`featureDescriptions` is a hand-written `Record<string, string>` mapping feature names to UI descriptions (`data/devices.ts` lines 51–68). This is UI copy, not device data — it belongs in the web app.

**Action:** Move to a constants file (e.g. `lib/device-utils.ts` or `lib/constants.ts`).

**Consumed by:** `app/meshtastic/devices/[id]/page.tsx`

## ~~5. Fix sitemap fake dates~~ DONE

`deviceSitemapData` and `antennaSitemapData` generate random `lastModified` dates between Jan–May 2024 instead of real values.

**Action:** Add a `lastModified` field to device/antenna data, or derive from git history. At minimum, stop generating random dates.

**File:** `data/devices.ts` (lines 2677–2681), `data/antennas.ts` (lines 1437–1441)

## ~~6. Create a data access layer~~ DONE

7 files import directly from `data/devices.ts` or `data/antennas.ts`. When the data source changes, all need updating.

**Action:** Create `lib/data.ts` that re-exports everything. All consumers import from `lib/data.ts`. When the source changes, only one file needs updating.

**Current consumers:**
- `app/meshtastic/devices/page.tsx` — `devices`
- `app/meshtastic/devices/[id]/page.tsx` — `devices`, `featureDescriptions`
- `app/meshtastic/antennas/page.tsx` — `antennas`
- `app/meshtastic/antennas/[id]/page.tsx` — `antennas`
- `app/sitemap.ts` — `deviceSitemapData`, `antennaSitemapData`
- `components/device-filters.tsx` — `allCategories`, `allFeatures`, `allLoraFrequencies`, `allMicrocontrollers`
- `components/antenna-filters.tsx` — `allCategories`, `statusOptions`

## ~~7. Move `statusOptions` out of data file~~ DONE

`statusOptions` (`[{value: "true", label: "Suggested"}, ...]`) is a UI construct for filter dropdowns, not antenna data.

**Action:** Move to `antenna-filters.tsx` or a shared constants file.

**File:** `data/antennas.ts` (lines 1431–1434)
**Consumed by:** `components/antenna-filters.tsx`

## Priority order

1. Deduplicate types (#1) — prerequisite for everything else
2. Data access layer (#6) — minimize blast radius of future migration
3. Separate derived constants (#2) — clean boundary between data and app logic
4. Move UI constants (#4, #7) — `featureDescriptions`, `statusOptions`
5. Consistent derivation pattern (#3)
6. Fix sitemap dates (#5)
