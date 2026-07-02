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

## Capturing a sweep

An `.s1p` is a one-port (S11) measurement, so any VNA that can save Touchstone
works. These steps use a NanoVNA, the most common tool in the mesh community,
but the workflow is the same on any analyzer.

Not set up to open a pull request? You can attach a sweep to the
[Submit antenna test data](https://github.com/austinmesh/rfindex/issues/new?template=submit-antenna-test.yml)
issue form instead.

**1. Set the span.** Cover the band under test with margin so the curve shows
the full match, not just the center. Suggested spans:

- 900 MHz band (US 902-928, EU 863-870): sweep `800-1000 MHz`
- 433 MHz band: sweep `400-470 MHz`

Use at least 101 points on the device; more is better for a smooth curve.

**2. Calibrate on CH0 across that exact span.** Run a full SOL calibration
(short, open, load) at the reference plane where the antenna will attach, that
is, at the end of whatever adapter or pigtail you test through. A stale
calibration or the wrong reference plane is the most common source of a bad
sweep. Recalibrate whenever you change the span or the adapter.

**3. Connect the antenna to CH0 (port 0)** and let the trace settle. CH1 is
unused for a one-port measurement.

**4. Export the `.s1p`** using either method below.

### Method A: save to the microSD card

On a NanoVNA with an SD slot (for example the H4):

1. Insert a FAT32-formatted microSD card.
2. Open the menu, then `SAVE` (or `CONFIG` then `SD CARD`, depending on
   firmware) and choose `SAVE S1P`.
3. The file lands on the card as something like `nvna_001.s1p`. Copy it off and
   rename it to the convention below.

This needs no computer and captures exactly the points shown on the device, so
it is the quickest path in the field.

### Method B: export from NanoVNASaver

[NanoVNASaver](https://github.com/NanoVNA-Saver/nanovna-saver) drives the VNA
over USB and gives you finer resolution than the device screen:

1. Connect the NanoVNA by USB, pick its serial port, and click `Connect to
   device`.
2. Set the sweep start and stop to your span. Raise the segment count to sweep
   more points than the device's native 101 for a smoother curve.
3. Click `Sweep` and wait for it to finish.
4. Use `Files` then `Save 1-Port file (s1p)` and save it. Do not save a 2-port
   `.s2p`; only S11 is used here.

Calibrate in NanoVNASaver itself (its `Calibration` window) rather than relying
on the device calibration when sweeping through it.

After exporting by either method, rename the file to match the naming below and
drop it in the antenna's subdirectory.

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
