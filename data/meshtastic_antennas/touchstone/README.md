# Antenna Touchstone (.s1p) sweeps

Sweeps live in a per-antenna subdirectory named for the antenna slug:

    touchstone/<antenna-slug>/<config>_<tester>[_<qualifier>].s1p

Example:

    touchstone/
      tenmory-5dbi-omni-tb-csa21/
        straight_k1pdx.s1p
        90deg_k1pdx.s1p
      rak-3dbi-fiberglass/
        gp-none_k1pdx.s1p
        gp-none_w5xyz_unit-b.s1p

Reference the **bare filename** (no path) from a test result's `touchstone`
field in the antenna JSON:

    "touchstone": "straight_k1pdx.s1p"

The build resolves it under the antenna's own directory, so a sweep can only
belong to its owning antenna. At build time `lib/prebuild.ts` parses the file
into a full VSWR / return-loss curve, derives the VSWR markers when a test has
none of its own, and copies the raw file to
`public/mesh/antennas/touchstone/<antenna-slug>/` for download.

## Filename convention

Underscore `_` separates fields; hyphens `-` live inside a field:

- `config` — the test setup: `straight`, `90deg`, `gp-none`, `gp-roof`, `gp-30cm`
- `tester` — callsign, lowercased (e.g. `k1pdx`), or handle if none
- `qualifier` (optional) — only to break a tie between a same-config/same-tester
  retest: a batch/sample id (`unit-b`) or a date (`2026-07`)

Keep the `config` vocabulary short and reused, and prefer lowercase `.s1p`. Both
`.s1p` and `.S1P` are accepted, but the download URL preserves the file's case,
so lowercase keeps URLs predictable.

Only the Touchstone option line (e.g. `# Hz S RI R 50`) and the S11 data rows
are used; `!` comment lines are ignored. An `.s1p` describes the antenna's port
match (VSWR / return loss) only, not gain or radiation pattern.
