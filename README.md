# RF Index

[RF Index](https://rfindex.com) is a web app for comparing mesh networking and
radio hardware (devices and antennas) with specs, pricing, test results, and
purchase links. It is built and maintained by the [Austin Mesh](https://www.austinmesh.org)
community.

## Tech stack

- **Framework:** Next.js 15 (App Router) with React 19 and TypeScript
- **Styling:** Tailwind CSS with shadcn/ui (Radix primitives)
- **Charts:** Recharts
- **Deployment:** Cloudflare Workers via the OpenNext adapter
- **Package manager:** pnpm

The site runs entirely within the Cloudflare free tier. Please do not introduce
features or dependencies that require paid services.

## Local development

```bash
pnpm install
pnpm dev      # generate device + antenna data, then start the dev server
```

Other useful commands:

```bash
pnpm build    # production build via OpenNext (also the main verification step)
pnpm preview  # build and run the Worker locally (closest to production)
pnpm lint     # run ESLint
```

There is no unit test suite. A clean `pnpm build` is the verification step: it
regenerates data, statically renders every device and antenna page, and
type-checks the full render tree.

## How the data works

All content lives in the `data/` directory as JSON, plus images:

- `data/meshtastic_devices/` - device JSON files and images
- `data/meshtastic_antennas/` - antenna JSON files and images

At build time, `lib/prebuild.ts` reads this JSON, generates the typed arrays the
app imports, and copies images into `public/`. The generated files are not
committed; they are rebuilt from `data/` on every build.

## Contributing

There are two ways to contribute.

### 1. Open an issue (no code required)

The easiest way to suggest a change is to
[open an issue](https://github.com/austinmesh/rfindex/issues/new/choose) using
one of the templates:

- **Add a device or antenna** - suggest new hardware to list
- **Remove a device or antenna** - flag something that should come off
- **Report an issue** - incorrect data, a broken link, or a website bug
- **Request an update** - pricing, specs, or links that need refreshing

### 2. Open a pull request

To add or edit data directly:

**Add a device**

1. Add a JSON file to `data/meshtastic_devices/` with an `id` field that matches
   the URL slug and a `supported_firmware` array, for example
   `["Meshtastic"]` or `["Meshtastic", "MeshCore"]`.
2. Add the product image to `data/meshtastic_devices/images/` as WebP.

**Add an antenna**

1. Add a JSON file to `data/meshtastic_antennas/` named after its `slug` field.
2. Add the antenna image to `data/meshtastic_antennas/images/` as WebP, and
   reference it by bare filename in the `image` field.

**Before you open the PR**

- Run `pnpm build` locally and confirm it completes without errors.
- Leave any existing purchase or affiliate URL parameters intact. These fund the
  site's hosting; do not strip or alter them.
- Do not commit secrets, tokens, or `.env` files.

New devices and antennas appear automatically in listings, detail pages, and the
sitemap after the next build.

## License

RF Index is dual licensed because the code and the data have different terms.
Both are noncommercial: you may not sell, or charge for the use of, the code or
the data.

- **Code** is licensed under the
  [PolyForm Noncommercial License 1.0.0](LICENSE). You may use, modify, and
  share the source for any noncommercial purpose.
- **Data** (everything under `data/`, including specs, pricing, test results, and
  images) is licensed under
  [Creative Commons Attribution-NonCommercial-ShareAlike 4.0](LICENSE-DATA.md).

For commercial licensing, contact the maintainers.
