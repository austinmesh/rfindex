# RF Index

RF Index (rfindex.com) is a Next.js web app for comparing mesh networking and radio hardware (devices and antennas) with specs, pricing, test results, and purchase links. This repository hosts both the production website and the open dataset that powers it (under `rfindex-data/`). It is maintained by Austin Mesh.

## Commands

- `pnpm dev`: generate device and antenna data from `rfindex-data/`, then start the dev server
- `pnpm dev:clean`: same as dev but clears the `.next` cache first (use when the dev server has stale errors)
- `pnpm build`: generate data from `rfindex-data/`, then run a production build (TypeScript/ESLint errors are ignored via next.config.mjs)
- `pnpm lint`: run ESLint
- `pnpm start`: start the production server

## Tech Stack

- **Framework**: Next.js 15 (App Router) with React 19, TypeScript
- **Styling**: Tailwind CSS 3 with `tailwind-merge` and `class-variance-authority`
- **UI components**: shadcn/ui (Radix UI primitives) in `components/ui/`
- **Charts**: Recharts
- **Icons**: Lucide React
- **Theming**: next-themes
- **Analytics**: Google Analytics via `@next/third-parties`
- **Package manager**: pnpm (Vercel install command: `pnpm install`). Always use pnpm, not npm.
- **Deployment**: Vercel free tier (auto-deploys on push to `main`). **Operating cost must remain $0**: do not introduce features or dependencies that require paid services.

## Architecture

### Routing (App Router)

All pages use the `SiteHeader` plus `SiteFooter` layout wrapper pattern (not nested layouts). 301 redirects from old `/meshtastic/` URLs to `/mesh/` are configured in `next.config.mjs`.

```
app/
├── page.tsx                          # Home: technology browser
├── layout.tsx                        # Root layout (html/body, GA script)
├── mesh/
│   ├── devices/
│   │   ├── page.tsx                  # Device listing: server component, passes data to DeviceFilters
│   │   └── [id]/page.tsx             # Device detail: uses generateStaticParams for SSG
│   └── antennas/
│       ├── page.tsx                  # Antenna listing: server component, passes data to AntennaFilters
│       └── [id]/page.tsx             # Antenna detail: uses generateStaticParams for SSG
├── about/page.tsx
├── sitemap.ts                        # Dynamic sitemap from device and antenna data
└── robots.ts
```

### Data Layer

All data comes from the `rfindex-data/` directory, which contains the open dataset (device and antenna JSON files, product images, JSON schemas, and a Decap CMS for editing). It is part of this repository.

- `rfindex-data/`: directory containing device and antenna JSON files and images, plus the schemas and CMS used to edit them
- `lib/prebuild.ts`: **prebuild script** that reads JSON from `rfindex-data/`, generates `data/devices-generated.ts` and `data/antennas-generated.ts`, and copies images to `public/devices/` and `public/mesh/antennas/`
- `data/devices-generated.ts`: auto-generated Device[] array (gitignored, regenerated every build)
- `data/antennas-generated.ts`: auto-generated Antenna[] array (gitignored, regenerated every build)
- `data/devices.ts`: `featureDescriptions` only (UI copy)
- `lib/data.ts`: **single import point for all consumers.** Imports generated device and antenna data, computes all derived constants (categories, features, frequencies, microcontrollers, firmwares). All app code imports from here.

Generated files are gitignored (`data/devices-generated.ts`, `data/antennas-generated.ts`, `public/devices/`, and `public/mesh/antennas/`) and are all regenerated from `rfindex-data/` at build time.

### Types

- `types/device.ts`: `Device` (includes `supported_firmware: string[]`), `DevicePrice`, `DeviceBattery`, `DeviceSpecifications`, `PurchaseUrl`, `DeviceSitemapItem`
- `types/antenna.ts`: `Antenna`, `AntennaMarker`, `AntennaTestResult`, `AntennaManufacturer`, `AntennaSupplier`, `AntennaDimensions`, `AntennaSitemapItem`, `StatusOption`

Types are the single source of truth: data files import from `types/`.

### Key Components

- `components/device-filters.tsx`: client component with search, category/feature/frequency/microcontroller/firmware filters, price slider, sort options, comparison dialog, URL-synced filter state
- `components/antenna-filters.tsx`: client component with search, category filters, status/suggestion filters, sort options, URL-synced filter state
- `components/site-header.tsx`: sticky nav with "Mesh" dropdown (Devices, Antennas, Meshtastic, MeshCore), mobile sheet menu
- `components/site-footer.tsx`
- `components/ui/`: 48 shadcn/ui components (do not modify directly unless customizing)

### Static Assets

- `public/devices/`: device product images (WebP), copied from `rfindex-data/` at build time (gitignored)
- `public/mesh/antennas/`: antenna product images (WebP), copied from `rfindex-data/` at build time (gitignored)
- `public/`: logos, PWA manifest icons, favicon

### Path Alias

`@/*` maps to the project root (configured in tsconfig.json). All imports use this alias.

## Verification

**Always run `pnpm build` before committing or finalizing work.** This is the primary verification step for this repo. There is no unit test suite, so the production build serves as the test because it:

- Statically generates every device and antenna page via `generateStaticParams`, catching missing data or broken imports
- Validates all TypeScript types and component props across the full render tree
- Surfaces any runtime errors during page generation

A successful build with no errors means the change is safe to commit.

**Dev server caveat:** After restructuring imports or moving files, the dev server (`pnpm dev`) may show stale errors due to its incremental cache. If the dev server breaks but `pnpm build` passes, clear the cache with `rm -rf .next` and restart the dev server.

## Revenue: Referral Links

The site generates revenue through referral/affiliate links in device and antenna purchase URLs. **Never remove or modify referral parameters from URLs.** See `AFFILIATES.md` for the full list of programs and link formats.

| Program | Store | URL Pattern |
|---------|-------|-------------|
| Rokland referral | Rokland | `?ref=rfindex` |
| Elecrow referral | Elecrow | `?ref=rfindex` |
| Seeed Studio affiliate | Seeed Studio | `?sensecap_affiliate=WMeIXYu&referring_service=link` |
| Amazon Associates | Amazon | `amzn.to/xxxxx` shortlinks |
| LilyGo referral | LilyGo | `?bg_ref=NMDtT4rHQo` |
| AliExpress affiliate | AliExpress | `s.click.aliexpress.com/e/xxxxx` shortlinks |
| RAKwireless affiliate | RAKwireless | `rakwireless.kckb.st/rfindex-xxx` shortlinks |

Some suppliers have no referral program (Heltec direct, AtlaVox, muzi works, SpecFive, Pacific NW 3D, Mouser, Digikey, and others), so their URLs are plain links.

When adding new purchase URLs, always use the appropriate referral format for supported stores.

## Conventions

- **Pages are server components**: listing pages pass full data arrays to client filter components
- **Detail pages use `generateStaticParams`**: all device/antenna pages are statically generated at build time
- **Devices use the `id` field, antennas use the `slug` field** as their URL parameter
- **Devices have `supported_firmware`**: multi-select array (e.g., `["Meshtastic", "MeshCore"]`) for firmware compatibility filtering
- **SEO**: every page exports `metadata` with title, description, and `alternates.canonical`
- **Firmware filtering**: the devices page (`DeviceFilters`) reads a `?firmware=Meshtastic` or `?firmware=MeshCore` query param to pre-filter by firmware
- **301 redirects** in `next.config.mjs` preserve old `/meshtastic/` URLs as `/mesh/`, and redirect the former `/mesh/meshtastic` and `/mesh/meshcore` landing pages to `/mesh/devices`
- **Images are unoptimized** (`next.config.mjs` sets `images.unoptimized: true`)
- **Filter state is URL-synced**: both filter components read/write URL search params via `useSearchParams`

## Adding Data

Device and antenna data lives in `rfindex-data/`. Because it is part of this repository, adding data is a normal edit and commit (no submodule steps). See `rfindex-data/README.md` for the full schema and the Decap CMS option.

### New Device

Add a JSON file under `rfindex-data/data/meshtastic_devices/` following the schema in `rfindex-data/admin/config.yml`. Include an `id` field matching the URL slug and a `supported_firmware` array (e.g., `["Meshtastic"]` or `["Meshtastic", "MeshCore"]`). Place the product image in `rfindex-data/data/meshtastic_devices/images/` as WebP. The device will appear in listings, detail pages, and the sitemap after the next build.

### New Antenna

Add a JSON file under `rfindex-data/data/meshtastic_antennas/` following the schema in `rfindex-data/admin/config.yml`. Use the `slug` field as the filename. Place the antenna image in `rfindex-data/data/meshtastic_antennas/images/` as WebP (bare filename in the `image` field, not a path). The antenna will appear in listings, detail pages, and the sitemap after the next build.
