---
name: add-rfindex-data
description: Use when adding a new device, antenna, or a manufacturer/supplier it depends on to RF Index. Builds schema-valid JSON in data/ from a product URL. Triggers on "add a device", "add an antenna", "new device/antenna", "import this product", "submit antenna test data / VNA sweep / .s1p".
---

# Add RF Index Data

Author a new `data/` record (a device, an antenna, or a device relation such as
a manufacturer or supplier) that passes `pnpm validate` on the first real try.
You take a product URL and a few answers; this skill turns them into correct
JSON with the right enums, relations, referral links, and image handling.

**Core principle:** the `schemas/<collection>.json` file is the source of
truth for shape and enums, and `pnpm validate` is the gate. Read the schema,
match it exactly, validate, fix, repeat. Never invent fields
(`additionalProperties: false` is set on every collection).

## When to use

- Adding a new device to `data/mesh_devices/`.
- Adding a new antenna to `data/mesh_antennas/` (incl. VNA test data).
- Adding a `mesh_manufacturers` or `suppliers` reference file that a new
  device needs.

Not for: editing existing records (do that by hand), adding a new device
`features` value (that is a reviewed change to the schema enum, see Relations),
or the bands/modulations/radios/antenna_connectors collections.

## Arguments

If a URL (or other details) is passed when the skill is invoked, e.g.
`/add-rfindex-data https://heltec.org/project/...`, treat it as the product
URL and **skip the "what's the URL?" prompt**; go straight to fetching it.
With no argument, ask for the URL.

## Flow

1. **Identify** the target: device, antenna, or reference value. Ask if unclear.
2. **Get the inputs**: the product/purchase URL (from the invocation argument
   if one was given, otherwise ask), plus name + manufacturer.
3. **Auto-draft**: `WebFetch` the URL and extract specs. Ask the user only for
   what the page doesn't give or that's uncertain: price range, category,
   supported firmware, commentary.
4. **Draft JSON** against `schemas/<collection>.json`: every required field,
   exact enum spelling/casing, no extra keys.
5. **Resolve relations** (devices only): see below. Missing value → **warn
   and stop**; offer to add it as an explicit step.
6. **Apply referral links** per `AFFILIATES.md`: see below.
7. **Handle the image**: see below.
8. **Name the file** and set `id`/`slug`: see the per-type reference.
9. **Antenna test data**: **ask the user whether they have a `.s1p` touchstone
   file**; use it if so, else `markers`. See below.
10. **Validate**: `pnpm validate` until clean.
11. **Report** the files written; note the record appears after the next build
    and that referral params were preserved. Don't commit; the user reviews.

## Per-type reference

Read the schema for the full field list; these are the traps.

### Device (`data/mesh_devices/<title-slug>-<manufacturer-slug>.json`)

- **Filename ≠ `id`.** Filename mirrors the CMS slug
  `<title-slug>-<manufacturer-slug>` (e.g. `heltec-lora-32-v3-heltec.json`).
  `id` is a *separate* short URL routing slug (e.g. `heltec-lora-32-v3`),
  unique across devices. Check: `ls data/mesh_devices/ | grep <slug>`.
- Required: `id, title, manufacturer, model, category, purchase_urls, price,
  specifications, supported_firmware`.
- `manufacturer` and each `purchase_urls[].supplier` are **reference slugs**,
  not display titles. See Relations.
- `image` is a **public path**: `/devices/<name>.webp`.
- Enums (full lists in the schema): `supported_firmware`
  ["Meshtastic","MeshCore"]; `category` ["DIY","Complete","Solar","Standalone"];
  `features` is a fixed schema enum (see Relations); `lora_frequencies` use
  spaced form `"915 MHz"` (not `915MHz`); `specifications.max_tx_power_dbm` is
  **dBm not watts** (0.5 W=27, 1 W=30, 2 W=33); `lora_radio` goes in
  `specifications.lora_radio`, **never** in `features`.

### Antenna (`data/mesh_antennas/<slug>.json`)

- Filename **is** `<slug>.json`; `slug` is the routing param.
- Antennas are self-contained: `manufacturer` and `suppliers` are embedded
  objects (no relation lookups); `connector_type` and `category` are fixed
  schema enums.
- **One record per brand/distributor, not per physical design.** A different
  brand or store selling what looks like the *same* OEM whip is a **new
  antenna** (its own `<brand>-<slug>.json`), even when it's visibly identical to
  one already listed. `suppliers[]` is only for the **same branded listing**
  resold through multiple stores (e.g. the same Tenmory whip on Amazon *and*
  AliExpress); it is **never** a place to graft a different brand's sample onto
  an existing lookalike. Same-looking OEM whips vary batch-to-batch and
  vendor-to-vendor, so each brand needs its own sweeps, gain, and price to stay
  comparable. A sweep of "the same antenna, just from a different seller" → a
  **new record with a new slug**, not a second `test_results[]`/`suppliers[]`
  entry on the existing one.
- `image` is a **bare filename**: `<name>.webp` (not a path).
- `manufacturer.datasheet` is a real datasheet URL. If none exists, use the
  string `"Unavailable"`; do **not** point it at the storefront/buy page.
- Keep `description` and `commentary` about the antenna itself. Don't quote
  efficiency, competitor comparisons, or vendor marketing numbers; let the
  measured sweep speak for performance.
- Required: `slug, title, manufacturer, suppliers, test_results,
  connector_type`. Each `test_results[]` needs `notes` + `metadata` and
  **either** `markers` **or** `touchstone`.

### Reference value (device relations)

`mesh_manufacturers` and `suppliers` files are `{"title": "...", "slug": "..."}`
(both required; `slug` is lowercase and hyphenated). The filename is
`<slug>.json`. A device references the **slug**, not the title.

`mesh_features` is CMS-only reference data (`{"title", "description"}`) and is
**not** what a device's `features` values validate against. Device `features`
validate against the `enum` in `schemas/mesh_devices.json`. Create reference
files only as an explicit step (see Relations).

## Relations (devices only)

A device's `manufacturer`, `purchase_urls[].supplier`, and `features` values are
all constrained, and `pnpm validate` **enforces them**:

- `manufacturer` and `supplier` are **reference slugs**. `scripts/validate.js`
  runs a referential-integrity check: each value must match a `slug` in
  `data/mesh_manufacturers/` (or `data/manufacturers/`) for manufacturer, or
  `data/suppliers/` for supplier. Writing the display title instead of the slug
  fails validation with a `UNKNOWN MANUFACTURER/SUPPLIER` error.
- `features` is a fixed `enum` in `schemas/mesh_devices.json` ("the single
  source of truth"). An off-list value fails validation.

Use the helper to see the existing slugs and to check one value:

```bash
# list every manufacturer/supplier slug and every device feature enum value
node .claude/skills/add-rfindex-data/list-relations.mjs

# check one value: reports the slug to reuse, a near match, or "new"
node .claude/skills/add-rfindex-data/list-relations.mjs "Heltec"
```

- Match exists → put the reported **slug** in the device field (not the title).
- Manufacturer/supplier missing → **warn and stop**. Offer to create the
  reference JSON (`data/mesh_manufacturers/<slug>.json` etc. with `title` +
  `slug`), then use that slug.
- Feature not in the enum → **stop and confirm explicitly.** `features` is a
  deliberately short curated list; adding a value is a reviewed change to the
  enum in `schemas/mesh_devices.json` (and the matching CMS `options` in
  `public/admin/config.yml`), because every value becomes a site-wide filter
  facet. Reuse the closest existing value or omit it unless the user confirms a
  genuinely new, buyer-facing distinction. (`Solar` = built-in panel;
  `Solar Input` = accepts one; don't merge.)

## Referral links

Purchase URLs carry affiliate params that fund the site: **never strip
them.** Apply the format from `AFFILIATES.md` for the supplier (e.g. AtlaVox
`?bg_ref=…`, LilyGo `?bg_ref=…`, Rokland/Elecrow `?ref=rfindex`, Seeed
`?sensecap_affiliate=…`; Amazon/AliExpress/RAKwireless use shortlinks
generated in their dashboards). Suppliers with no program (Heltec, muzi,
SpecFive, Mouser, Digikey, …) get plain links.

## Image

Download the source image, then convert it with the helper script (WebP,
≤ ~200 KB, into `data/<collection>/images/<name>.webp`):

```bash
# device image:
.claude/skills/add-rfindex-data/to-webp.sh /path/to/source.jpg data/mesh_devices/images/<name>.webp
# antenna image:
.claude/skills/add-rfindex-data/to-webp.sh /path/to/source.jpg data/mesh_antennas/images/<name>.webp
```

Then set the field: device → `"image": "/devices/<name>.webp"`;
antenna → `"image": "<name>.webp"`. If no direct image URL is found, ask the
user for a local file. If none, leave `image` off (listing shows a placeholder).

## Antenna test data (always ask)

Every antenna needs at least one `test_results[]` entry, so **ask the user up
front: "Do you have a touchstone (`.s1p`) VNA sweep for this antenna?"**

First settle *which* record the sweep belongs to. A sample from a different
brand/seller than an existing lookalike is a **new record** (see the Antenna
reference above), so its `.s1p` goes under the **new** slug's
`touchstone/<slug>/` folder, not the lookalike's. A muzi sweep filed under
`touchstone/tenmory-…/` is the tell that a merge slipped through.

- **Yes (preferred)** → ask for the file path, the test config (`straight`,
  `90deg`, `gp-none`, `gp-roof`, …), and their callsign/handle. Copy the file
  to `data/mesh_antennas/touchstone/<slug>/<config>_<callsign>.s1p` and
  reference it by **bare filename** in `test_results[].touchstone` (schema
  requires it end in `.s1p`, no path). The full VSWR curve is plotted and
  markers are derived automatically.
- **No** → ask for a `markers` array of `{frequency, vswr}` (typically at
  902 / 915 / 928 MHz) from the datasheet or their notes.

Either way `metadata` requires `tester` + `date`. See
`data/mesh_antennas/touchstone/README.md` for capture guidance.

## Validate (the gate)

```bash
pnpm validate   # AJV-checks every data file against its schema
```

Fix every `FAIL:` (schema), `INVALID JSON:` (syntax, usually a trailing
comma), `DUPLICATE`, `MISSING IMAGE`, and `UNKNOWN MANUFACTURER/SUPPLIER`
(a title written where a slug belongs) until it prints "All files passed."
Then re-confirm the referral params by eye before finishing.

## Gotchas

| Trap | Do this |
|---|---|
| Device filename vs `id` | filename = `<title>-<manufacturer>` slug; `id` = short unique routing slug |
| Image field format | device = `/devices/x.webp` (path); antenna = `x.webp` (bare) |
| Manufacturer/supplier as title | store the reference **slug**, not the display title; validate fails on an unknown slug |
| New `features` value | it's a schema enum; adding one is a reviewed edit to `schemas/mesh_devices.json` + `config.yml`, not just a new string |
| Power as watts | use `max_tx_power_dbm` (0.5W=27, 1W=30, 2W=33) |
| LoRa radio in `features` | it belongs in `specifications.lora_radio` |
| Datasheet = storefront | use a real datasheet URL or `"Unavailable"`, never the buy page |
| Marketing in antenna copy | describe the antenna; let the measured sweep speak for performance |
| Stripped referral param | never remove it; use the `AFFILIATES.md` format |
| Touchstone path in field | bare `*.s1p` filename only; the file lives under `touchstone/<slug>/` |
| Same OEM whip, different brand/seller | new antenna record (`<brand>-<slug>`), not another supplier/test on the lookalike; `suppliers[]` = same listing at multiple stores |
| Extra JSON key | `additionalProperties:false` everywhere; remove it |
