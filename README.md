# RF Index

RF Index ([rfindex.com](https://rfindex.com)) is a reference guide for comparing mesh networking and radio hardware: devices and antennas, with specs, pricing, test results, and purchase links. It is maintained by [Austin Mesh](https://www.austinmesh.org), a community building a solar-powered text messaging network in Austin, Texas.

This repository contains both the website (a Next.js app) and the open dataset that powers it.

## Repository layout

- Website (repo root): a Next.js 15 App Router app written in TypeScript, styled with Tailwind CSS and shadcn/ui.
- `rfindex-data/`: the open dataset (device and antenna JSON, product images, JSON schemas, and a Decap CMS for editing). This is the source of truth for everything shown on the site.

At build time, `lib/prebuild.ts` reads the JSON in `rfindex-data/`, generates `data/devices-generated.ts` and `data/antennas-generated.ts`, and copies images into `public/`. The generated files are gitignored and rebuilt on every install and build.

## Getting started

Requires Node.js 18.18+ and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev
```

This generates the data from `rfindex-data/` and starts the dev server at http://localhost:3000.

Other commands:

- `pnpm build`: generate data and produce a production build. This is the primary verification step; there is no separate unit test suite, so a clean build (which statically generates every device and antenna page) is how changes are validated.
- `pnpm dev:clean`: clear the `.next` cache and start dev (use if the dev server shows stale errors).
- `pnpm lint`: run ESLint.

## Contributing data

Most contributions are data: adding a device or antenna, fixing specs, or updating a price. The data lives in `rfindex-data/`. See [`rfindex-data/README.md`](rfindex-data/README.md) and [`rfindex-data/CONTRIBUTING.md`](rfindex-data/CONTRIBUTING.md) for the schema and the editing options (edit the JSON directly, or use the bundled Decap CMS).

You can also propose a device or a correction without touching code, through the contribution form linked in the site footer.

## Affiliate links

Some purchase URLs in the dataset contain affiliate or referral parameters. Revenue from these links supports Austin Mesh. See [`AFFILIATES.md`](AFFILIATES.md) for the programs and link formats. Referral parameters on existing URLs should be left in place.

## License

This project uses two licenses:

- Code (everything outside `rfindex-data/`): [MIT](LICENSE).
- Data (`rfindex-data/`): [Creative Commons Attribution-NonCommercial 4.0 International](rfindex-data/LICENSE) (CC BY-NC 4.0). You may share and adapt the data for non-commercial purposes with attribution.

Device and antenna specifications are compiled from manufacturer datasheets and public product pages. Product images are the property of their respective manufacturers.

Copyright (c) 2024-2026 Tommy Ekstrand and Austin Mesh.
