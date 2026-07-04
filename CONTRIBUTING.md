# Contributing to RF Index

Thanks for helping make RF Index better. Contributions of all kinds are welcome:
new device or antenna data, corrections, antenna test sweeps, and website fixes.

The full step-by-step guide, including a complete example device JSON, lives in
the [Contributing section of the README](README.md#contributing). This file is
the short version plus the rules that matter most.

## Ways to contribute

1. **Open an issue (no code needed).** Use the
   [issue templates](https://github.com/austinmesh/rfindex/issues/new/choose)
   to suggest new hardware, flag incorrect data, request updates, or submit
   antenna test data.
2. **Edit data through the local CMS.** Run `pnpm dev` and `pnpm cms`, then
   open `http://localhost:3000/admin/index.html`. Edits write straight to the
   `data/` JSON in your working tree; commit and open a PR as normal.
3. **Open a pull request by hand.** Copy an existing JSON file in
   `data/mesh_devices/` or `data/mesh_antennas/` as your starting point. Every
   field is defined by the JSON Schemas in [`schemas/`](schemas/).

## Before you open a PR

- Run `pnpm validate` for data changes. It checks every JSON file against its
  schema and names the exact bad field, and it enforces cross-file rules
  (unique ids and slugs, images exist, manufacturer and supplier slugs resolve).
- Run `pnpm build` for any change. There is no separate test suite; the
  production build is the test, and CI runs the same checks on your PR.
- Use pnpm, not npm (`pnpm install`).

## House rules

- **Never remove or modify referral parameters in purchase URLs.** Referral
  links fund the site. When adding purchase URLs, use the formats documented in
  [`AFFILIATES.md`](AFFILIATES.md).
- **The device `features` list is a short, curated vocabulary.** Reuse existing
  values exactly; the schema enum rejects anything else. Proposing a new value
  is a deliberate, reviewed change, so make the case in your PR description.
- **Manufacturer and supplier fields hold reference slugs, not display names**
  (`"manufacturer": "lilygo"`, not `"LilyGo"`). For a new brand, add the
  reference file in `data/mesh_manufacturers/` or `data/suppliers/` in the
  same PR.
- **Images are WebP**, placed in the collection's `images/` folder and
  referenced by bare filename.

## Licensing of contributions

By contributing you agree that your contribution is licensed under the same
terms as the project (inbound = outbound): code under the PolyForm
Noncommercial License 1.0.0 ([`LICENSE`](LICENSE)) and data under
CC BY-NC-SA 4.0 ([`data/LICENSE.md`](data/LICENSE.md)).

## Questions

Not sure where something fits? Open an issue and ask. A short issue beats a
long PR going in the wrong direction.
