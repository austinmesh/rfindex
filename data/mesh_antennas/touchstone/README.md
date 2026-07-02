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

Reference the **bare filename** (no path) from a test result's `touchstone` field in the antenna JSON:

    "touchstone": "straight_k1pdx.s1p"

## Capturing a sweep

An `.s1p` is a one-port (S11) measurement, so any VNA that can save Touchstone works.

**1. Set the span.** Cover the band under test with margin so the curve shows
the full match, not just the center. Suggested spans:

- 900 MHz band (US 902-928): sweep `890-950 MHz`

**2. Calibrate across that span.** Run a full SOL calibration (short, open, load) at the reference plane where the antenna will attach, that is, at the end of whatever adapter or pigtail you test through.

**3. Export the `.s1p`** using either method below.

### Method A: save to the microSD card

On a NanoVNA with an SD slot (for example the H4):

1. Insert a FAT32-formatted microSD card.
2. Open the menu, tap `SD CARD`, then `SAVE S1P`.
3. The file lands on the card as something like `nvna_001.s1p`.

### Method B: export from NanoVNASaver

[NanoVNASaver](https://github.com/NanoVNA-Saver/nanovna-saver) allows export via USB

1. Connect the NanoVNA by USB, click `Connect to device`.
2. Click `Files...`
3. Click `Save 1-Port File (S1P)`

## Filename convention

Underscore `_` separates fields; hyphens `-` live inside a field:

- `config` — the test setup: `straight`, `90deg`, `gp-none`, `gp-roof`, `gp-30cm`
- `tester` — callsign, lowercased (e.g. `k1pdx`), or handle if none
- `qualifier` (optional) — only to break a tie between a same-config/same-tester retest: a batch/sample id (`unit-b`) or a date (`2026-07`)
