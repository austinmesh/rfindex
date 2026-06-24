# RF Index

RF Index (rfindex.com) is a Next.js web app for comparing mesh networking and radio hardware — devices and antennas — with specs, pricing, test results, and purchase links. This repo hosts the production website.

## Commands

- `pnpm dev` — generate device + antenna data from `data/` + start dev server
- `pnpm dev:clean` — same as dev but clears `.next` cache first (use when dev server has stale errors)
- `pnpm build` — production build via OpenNext (`opennextjs-cloudflare build`): regenerates device + antenna data from `data/`, runs `next build`, and bundles to `.open-next/` for Cloudflare Workers. TypeScript/ESLint errors are ignored via next.config.mjs.
- `pnpm deploy` — build via OpenNext and deploy to Cloudflare Workers
- `pnpm preview` — build via OpenNext and run the Worker locally (closest to production)
- `pnpm lint` — run ESLint
- `pnpm start` — start the Next production server locally (note: production runs on Cloudflare Workers, not `next start`)

## Tech Stack

- **Framework**: Next.js 15 (App Router) with React 19, TypeScript
- **Styling**: Tailwind CSS 3 with `tailwind-merge` and `class-variance-authority`
- **UI components**: shadcn/ui (Radix UI primitives) in `components/ui/`
- **Charts**: Recharts
- **Icons**: Lucide React
- **Theming**: next-themes
- **Analytics**: Google Analytics via `@next/third-parties`
- **Package manager**: pnpm (install command: `pnpm install`). Always use pnpm, not npm.
- **Deployment**: Cloudflare Workers via the OpenNext adapter (`@opennextjs/cloudflare`), deployed with Wrangler. Cloudflare Workers Builds auto-deploys on push to `main` (build command `pnpm run build`, deploy command `npx wrangler deploy`). **Operating cost must remain $0** — stay within the Cloudflare free tier; do not introduce features or dependencies that require paid services. See [Build & Deployment Pipeline](#build--deployment-pipeline).

## Architecture

### Routing (App Router)

All pages use the `SiteHeader` + `SiteFooter` layout wrapper pattern (not nested layouts). 301 redirects from old `/meshtastic/` URLs to `/mesh/` are configured in `next.config.mjs`.

```
app/
├── page.tsx                          # Home — technology browser
├── layout.tsx                        # Root layout (html/body, GA script)
├── mesh/
│   ├── devices/
│   │   ├── page.tsx                  # Device listing — server component, passes data to DeviceFilters
│   │   └── [id]/page.tsx             # Device detail — uses generateStaticParams for SSG
│   └── antennas/
│       ├── page.tsx                  # Antenna listing — server component, passes data to AntennaFilters
│       └── [id]/page.tsx             # Antenna detail — uses generateStaticParams for SSG
├── about/page.tsx
├── sitemap.ts                        # Dynamic sitemap from device + antenna data
└── robots.ts
```

### Data Layer

All data lives in the `data/` directory (device/antenna JSON files and images).

- `data/meshtastic_devices/` — device JSON files and images
- `data/meshtastic_antennas/` — antenna JSON files and images
- `lib/prebuild.ts` — **prebuild script** that reads JSON from `data/`, generates `data/devices-generated.ts` and `data/antennas-generated.ts`, and copies images to `public/devices/` and `public/mesh/antennas/`
- `data/devices-generated.ts` — auto-generated Device[] array (gitignored, regenerated every build)
- `data/antennas-generated.ts` — auto-generated Antenna[] array (gitignored, regenerated every build)
- `data/devices.ts` — `featureDescriptions` only (UI copy)
- `lib/data.ts` — **single import point for all consumers.** Imports generated device and antenna data, computes all derived constants (categories, features, frequencies, microcontrollers, firmwares). All app code imports from here.

Generated files are gitignored — `data/devices-generated.ts`, `data/antennas-generated.ts`, `public/devices/`, and `public/mesh/antennas/` are all regenerated from `data/` at build time.

### Types

- `types/device.ts` — `Device` (includes `supported_firmware: string[]`), `DevicePrice`, `DeviceBattery`, `DeviceSpecifications`, `PurchaseUrl`, `DeviceSitemapItem`
- `types/antenna.ts` — `Antenna`, `AntennaMarker`, `AntennaTestResult`, `AntennaManufacturer`, `AntennaSupplier`, `AntennaDimensions`, `AntennaSitemapItem`, `StatusOption`

Types are the single source of truth — data files import from `types/`.

### Key Components

- `components/device-filters.tsx` — client component with search, category/feature/frequency/microcontroller/firmware filters, price slider, sort options, comparison dialog, URL-synced filter state
- `components/antenna-filters.tsx` — client component with search, category filters, status/suggestion filters, sort options, URL-synced filter state
- `components/site-header.tsx` — sticky nav with "Mesh" dropdown (Devices, Antennas, Meshtastic, MeshCore), mobile sheet menu
- `components/site-footer.tsx`
- `components/ui/` — 48 shadcn/ui components (do not modify directly unless customizing)

### Static Assets

- `public/devices/` — device product images (WebP), copied from `data/` at build time (gitignored)
- `public/mesh/antennas/` — antenna product images (WebP), copied from `data/` at build time (gitignored)
- `public/` — logos, PWA manifest icons, favicon

### Path Alias

`@/*` maps to project root (configured in tsconfig.json). All imports use this alias.

### Build & Deployment Pipeline

The site is built and deployed to Cloudflare Workers through the OpenNext adapter.

- `pnpm build` runs `opennextjs-cloudflare build`, which builds the Next app in standalone mode and bundles it into `.open-next/` (gitignored). `wrangler.jsonc` points `main` at `.open-next/worker.js` and serves static assets from `.open-next/assets`.
- **The Next build command lives in `open-next.config.ts` as `buildCommand`, not in `package.json`.** It is set to `npx tsx lib/prebuild.ts && next build` for two reasons:
  1. It runs the data prebuild before every OpenNext build, so `deploy`, `preview`, and `upload` (which call `opennextjs-cloudflare build` directly) all regenerate data.
  2. **It prevents an infinite build loop.** Without an explicit `buildCommand`, OpenNext defaults to `pnpm build` on pnpm projects — which re-invokes `opennextjs-cloudflare build`, calling itself forever. Keep `buildCommand` pointed at `next build` (not `pnpm build`). If you ever need to skip the Next build, the real flag is `--skipNextBuild` (not `--skipBuildingNextApp`, which is silently ignored and re-triggers the loop).
- **CI (Cloudflare Workers Builds):** build command `pnpm run build` produces `.open-next/`; deploy command `npx wrangler deploy` detects the OpenNext project and delegates to `opennextjs-cloudflare deploy`, which ships the already-built `.open-next/`. The build and deploy steps run in the same workspace, so the build output persists to deploy.

## Verification

**Always run `pnpm build` before committing or finalizing work.** This is the primary verification step for this repo. There is no unit test suite — the production build serves as the test. `pnpm build` now runs the full OpenNext build, which includes `next build`, so it still:

- Statically generates every device and antenna page via `generateStaticParams`, catching missing data or broken imports
- Validates all TypeScript types and component props across the full render tree
- Surfaces any runtime errors during page generation

It additionally produces the Cloudflare Worker bundle in `.open-next/`, so a clean run verifies the deploy artifact too. It is heavier/slower than a bare `next build`. A successful build with no errors means the change is safe to commit.

**Dev server caveat:** After restructuring imports or moving files, the dev server (`pnpm dev`) may show stale errors due to its incremental cache. If the dev server breaks but `pnpm build` passes, clear the cache with `rm -rf .next` and restart the dev server.

## Revenue: Referral Links

The site generates revenue through referral/affiliate links in device and antenna purchase URLs. **Never remove or modify referral parameters from URLs.**

| Program | Store | URL Pattern |
|---------|-------|-------------|
| Rokland referral | Rokland | `?ref=rfindex` |
| Elecrow referral | Elecrow | `?ref=rfindex` |
| Seeed Studio affiliate | Seeed Studio | `?sensecap_affiliate=WMeIXYu&referring_service=link` |
| Amazon Associates | Amazon | `amzn.to/xxxxx` shortlinks |
| LilyGo referral | LilyGo | `?bg_ref=NMDtT4rHQo` |
| AliExpress affiliate | AliExpress | `s.click.aliexpress.com/e/xxxxx` shortlinks |
| RAKwireless affiliate | RAKwireless | `rakwireless.kckb.st/rfindex-xxx` shortlinks |

Some suppliers have no referral program so their URLs are plain links.

When adding new purchase URLs, always use the appropriate referral format for supported stores.

## Conventions

- **Pages are server components** — listing pages pass full data arrays to client filter components
- **Detail pages use `generateStaticParams`** — all device/antenna pages are statically generated at build time
- **Devices use `id` field, antennas use `slug` field** as their URL parameter
- **Devices have `supported_firmware`** — multi-select array (e.g., `["Meshtastic", "MeshCore"]`) for firmware compatibility filtering
- **SEO**: every page exports `metadata` with title, description, and `alternates.canonical`
- **Firmware filtering**: the devices page (`DeviceFilters`) reads a `?firmware=Meshtastic` or `?firmware=MeshCore` query param to pre-filter by firmware
- **301 redirects** in `next.config.mjs` preserve old `/meshtastic/` URLs → `/mesh/`, and redirect the former `/mesh/meshtastic` and `/mesh/meshcore` landing pages → `/mesh/devices`
- **Images are unoptimized** (`next.config.mjs` sets `images.unoptimized: true`)
- **Filter state is URL-synced** — both filter components read/write URL search params via `useSearchParams`

## Adding Data

### New Device

Add a JSON file to `data/meshtastic_devices/` with an `id` field matching the URL slug and a `supported_firmware` array (e.g., `["Meshtastic"]` or `["Meshtastic", "MeshCore"]`). Place the product image in `data/meshtastic_devices/images/` as WebP.

The device will automatically appear in listings, detail pages, and the sitemap after the next build.

### New Antenna

Add a JSON file to `data/meshtastic_antennas/` using the `slug` field as the filename. Place the antenna image in `data/meshtastic_antennas/images/` as WebP (bare filename in the `image` field, not a path).

The antenna will automatically appear in listings, detail pages, and the sitemap after the next build.
