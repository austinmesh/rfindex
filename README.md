# RF Index

[RF Index](https://rfindex.com) is a web app for comparing mesh networking and
radio hardware (devices and antennas) with specs, pricing, test results, and
purchase links. It is built and maintained by the [Austin Mesh](https://www.austinmesh.org)
community.

## Tech stack

- **Framework:** Next.js 15 (App Router) with React 19 and TypeScript
- **Styling:** Tailwind CSS with shadcn/ui (Radix primitives)
- **Charts:** Recharts
- **Content:** Decap CMS (Git-based, local) for editing `data/`, validated against JSON Schema with AJV
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
pnpm build     # production build via OpenNext (also the main verification step)
pnpm preview   # build and run the Worker locally (closest to production)
pnpm lint      # run ESLint
pnpm validate  # check every data JSON file against its schema
pnpm cms       # start the Decap CMS local backend (run alongside pnpm dev)
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

Each collection has a JSON Schema in `schemas/`. Run `pnpm validate` to check
every file against its schema; a GitHub Action runs the same check on every PR.

For why the data is compiled to TypeScript at build time rather than read from
`data/` directly, see [Design notes and tradeoffs](#design-notes-and-tradeoffs).

## Contributing

There are three ways to contribute:

### 1. Open an issue (no code)

The easiest way to suggest a change is to
[open an issue](https://github.com/austinmesh/rfindex/issues/new/choose) using
one of the templates:

- **Add a device or antenna** - suggest new hardware to list
- **Remove a device or antenna** - flag something that should come off
- **Report an issue** - incorrect data, a broken link, or a website bug
- **Request an update** - pricing, specs, or links that need refreshing
- **Submit antenna test data** - share a VNA sweep (VSWR / return loss) for a
  listed antenna

### 2. Edit data through the CMS

The repo includes a local [Decap CMS](https://decapcms.org) for editing `data/`
through a web UI instead of hand-editing JSON.

```bash
pnpm dev
pnpm cms
```

Then open `http://localhost:3000/admin/index.html`. Changes are written straight
to the `data/` JSON and images in your working tree, so you commit and open a PR
the same as any other change. The CMS is local-only today: the live `/admin` URL
exists but cannot authenticate yet.

### 3. Open a pull request by hand

To add or edit data directly in JSON:

**Add a device**

1. Add a JSON file to `data/meshtastic_devices/` with an `id` field that matches
   the URL slug and a `supported_firmware` array, for example
   `["Meshtastic"]` or `["Meshtastic", "MeshCore"]`.
2. Add the product image to `data/meshtastic_devices/images/` as WebP.

When filling in the `features` array, reuse the values existing devices
already use (match spelling and casing exactly). The feature list is kept
deliberately short: it powers the filter checkboxes on the devices page, so
every new value lengthens and fragments that list. Only introduce a new
feature when it is genuinely needed, applies to more than one device, and does
not duplicate an existing value. Adding one should be a careful, reviewed
decision, not a quick addition. Put the LoRa radio in
`specifications.lora_radio`, not in `features`, and note that `Solar` (a
built-in panel) and `Solar Input` (you can connect one) are different.

**Add an antenna**

1. Add a JSON file to `data/meshtastic_antennas/` named after its `slug` field.
2. Add the antenna image to `data/meshtastic_antennas/images/` as WebP, and
   reference it by bare filename in the `image` field.
3. To include VSWR / return-loss test data, capture a Touchstone `.s1p` sweep
   with a VNA and add it under `data/meshtastic_antennas/touchstone/`. See
   [`data/meshtastic_antennas/touchstone/README.md`](data/meshtastic_antennas/touchstone/README.md)
   for how to capture a sweep (microSD or NanoVNASaver) and name the file.

**Before you open the PR**

- For data changes, run `pnpm validate` to check your JSON against the schemas.
- Run `pnpm build` locally and confirm it completes without errors.
- Leave any existing purchase or affiliate URL parameters intact. These fund the
  site's hosting; do not strip or alter them.
- Do not commit secrets, tokens, or `.env` files.

However you contribute, new devices and antennas appear automatically in
listings, detail pages, and the sitemap after the next build.

## Design notes and tradeoffs

A few architectural choices are deliberate. They are recorded here so they are
not "simplified" away without weighing the cost.

### Why data is compiled to TypeScript at build time

`lib/prebuild.ts` does two jobs on every build: it transforms the per-file JSON
in `data/` into generated TypeScript arrays (`data/devices-generated.ts`,
`data/antennas-generated.ts`), and it copies images from `data/.../images/` into
`public/`.

The generated arrays are not just a convenience. The client filter components
(`device-filters.tsx`, `antenna-filters.tsx`) import derived constants
(`allFeatures`, `allLoraFrequencies`, and so on) from `lib/data.ts`, which means
`lib/data.ts` is bundled for the browser. A generated array is a pure data
literal, so `lib/data.ts` can compute those constants without importing `fs` or
`path`. If `lib/data.ts` read the JSON directly with `fs`, the client build would
fail with `Can't resolve 'fs'`. The codegen is what keeps the data importable
from both server and client.

Images are copied into `public/` because `data/` is not a served directory on
Cloudflare Workers (static assets are served from `public/`). Keeping the source
images under `data/.../images/`, next to their JSON, keeps the licensed data (see
[data/LICENSE.md](data/LICENSE.md)) as one self-contained unit and matches where
the CMS writes uploads.

**Accepted tradeoff:** the cost is a prebuild step, two gitignored generated
files, and a `tsx lib/prebuild.ts &&` prefix on `pnpm dev`. In exchange we get a
clean client/server data boundary and data plus images colocated under `data/`.

**Possible future simplification:** the prebuild could be removed entirely by
(1) pointing the CMS `media_folder` at `public/`, (2) making `lib/data.ts`
server-only and reading the JSON directly, and (3) passing the derived constants
into the filter components as props instead of importing them. This is a real
refactor, not a deletion: it moves images out of `data/` (which fragments the
colocated, separately licensed data and means hand-PR contributors touch two
trees) and reworks the client boundary. The half-measure, dropping the codegen
but keeping images in `data/`, is the worst of both: it still needs the script
for image staging and still requires the client refactor. If this is ever done,
do it all at once, not halfway.

### Validation runs in CI, not as a pre-commit hook

`pnpm validate` checks every data file against its JSON Schema. It runs in GitHub
Actions on every PR that touches `data/`, `schemas/`, or the validator. There is
intentionally no pre-commit hook. CI is the authoritative gate because it covers
every contribution path, including edits made through the GitHub web UI, runs
server-side, and cannot be skipped or forgotten. A pre-commit hook would only
help contributors editing locally with the hook installed, and is bypassable with
`--no-verify`, so it would add a dependency without being a real guarantee.

## License

RF Index is dual licensed because the code and the data have different terms.
Both are noncommercial: you may not sell, or charge for the use of, the code or
the data.

- **Code** is licensed under the
  [PolyForm Noncommercial License 1.0.0](LICENSE). You may use, modify, and
  share the source for any noncommercial purpose.
- **Data** (everything under `data/`, including specs, pricing, test results, and
  images) is licensed under
  [Creative Commons Attribution-NonCommercial-ShareAlike 4.0](data/LICENSE.md).

For commercial licensing, contact the maintainers.
