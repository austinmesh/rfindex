/**
 * Prebuild script: reads device and antenna JSON files from data/
 * and generates data/devices-generated.ts and data/antennas-generated.ts
 * for the Next.js app to import.
 *
 * Run via: npx tsx lib/prebuild.ts
 */

import fs from "fs"
import path from "path"
import sanitizeHtml from "sanitize-html"

import type { Antenna, AntennaTestResult } from "@/types/antenna"
import type {
  FilterMarker,
  FilterPassband,
  FilterRejectionPoint,
  FilterSweep,
  FilterSweepPoint,
  RfFilter,
} from "@/types/filter"

// Device/antenna `commentary` is authored HTML rendered with
// dangerouslySetInnerHTML on the detail pages. Sanitize it here, at build time,
// against a small allowlist so the runtime stays dependency-free and no
// contributor-authored markup can become a stored-XSS payload. Also forces
// rel="noopener noreferrer" on every link (some authored links set target
// without it). Unknown tags/attributes and javascript: URLs are dropped.
const COMMENTARY_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "a", "b", "i", "em", "strong", "p", "br",
    "ul", "ol", "li", "code", "blockquote", "h3", "h4", "span",
  ],
  allowedAttributes: { a: ["href", "target", "rel"] },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
  },
}

function sanitizeCommentary(html: string): string {
  return sanitizeHtml(html, COMMENTARY_SANITIZE_OPTIONS)
}

type RawDevice = {
  id: string
  title: string
  manufacturer: string
  model: string
  description?: string
  category?: string[]
  image?: string
  purchase_urls?: { supplier: string; url: string }[]
  price: { min: number; max: number; currency: string }
  specifications: {
    lora_frequencies: string[]
    microcontroller: string
    lora_radio?: string
    max_tx_power_dbm?: number
    power_consumption: string
    battery: {
      type: string
      capacity_mAh?: number | string
      estimated_runtime?: string
    }
    antenna: string
    interfaces: string[]
  }
  features?: string[]
  supported_firmware: string[]
  commentary?: string
  sort_order?: number
}

// Device JSON stores manufacturer/supplier as reference-collection slugs (the
// CMS relation valueField), so a brand rename touches one reference file
// instead of every device. Resolve slugs to display titles here so the
// generated Device[] and all app code keep working with display names.
function loadRefTitles(...dirs: string[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const dir of dirs) {
    const abs = path.join(process.cwd(), "data", dir)
    if (!fs.existsSync(abs)) continue
    for (const f of fs.readdirSync(abs).filter((f) => f.endsWith(".json"))) {
      const { slug, title } = JSON.parse(fs.readFileSync(path.join(abs, f), "utf-8"))
      if (slug && title) map.set(slug, title)
    }
  }
  return map
}

const manufacturerTitles = loadRefTitles("mesh_manufacturers", "manufacturers")
const supplierTitles = loadRefTitles("suppliers")

function resolveRefTitle(map: Map<string, string>, slug: string, kind: string, file: string): string {
  const title = map.get(slug)
  if (!title) {
    throw new Error(
      `data/mesh_devices/${file}: ${kind} "${slug}" does not match any reference-collection slug (run \`pnpm validate\` for details)`,
    )
  }
  return title
}

function mapRawDevice(raw: RawDevice, file: string) {
  return {
    id: raw.id,
    name: raw.title,
    manufacturer: resolveRefTitle(manufacturerTitles, raw.manufacturer, "manufacturer", file),
    model: raw.model,
    description: raw.description ?? "",
    category: raw.category ?? [],
    // Accept a bare filename (the convention, same as antennas) or a legacy
    // full /devices/ path; either way the file lives in data/mesh_devices/images/
    // and is served from /devices/ after the copy below.
    image_url: raw.image ? [raw.image.startsWith("/") ? raw.image : `/devices/${raw.image}`] : [],
    purchase_urls: (raw.purchase_urls ?? []).map((p) => ({
      ...p,
      supplier: resolveRefTitle(supplierTitles, p.supplier, "supplier", file),
    })),
    price: raw.price,
    specifications: raw.specifications,
    features: raw.features ?? [],
    supported_firmware: raw.supported_firmware,
    ...(raw.commentary ? { commentary: sanitizeCommentary(raw.commentary) } : {}),
    ...(raw.sort_order != null ? { sort_order: raw.sort_order } : {}),
  }
}

const devicesDir = path.join(process.cwd(), "data", "mesh_devices")

if (!fs.existsSync(devicesDir)) {
  console.error("device data not found at", devicesDir)
  process.exit(1)
}

const files = fs.readdirSync(devicesDir).filter((f) => f.endsWith(".json"))
const devices = files.map((file) => {
  let raw: RawDevice
  try {
    raw = JSON.parse(fs.readFileSync(path.join(devicesDir, file), "utf-8"))
  } catch (err) {
    throw new Error(`Failed to parse data/mesh_devices/${file}: ${(err as Error).message}`)
  }
  return mapRawDevice(raw, file)
})

// Default display order: pinned devices first (lowest sort_order wins), then alphabetical
// by name. Devices without sort_order fall back to the alphabetical group.
devices.sort(
  (a, b) =>
    (a.sort_order ?? Number.MAX_SAFE_INTEGER) - (b.sort_order ?? Number.MAX_SAFE_INTEGER) ||
    a.name.localeCompare(b.name),
)

const output = `import type { Device } from "@/types/device"

// Auto-generated from data/. Do not edit manually.
// Regenerate with: npx tsx lib/prebuild.ts

export const devices: Device[] = ${JSON.stringify(devices, null, 2)}
`

const outPath = path.join(process.cwd(), "data", "devices-generated.ts")
fs.writeFileSync(outPath, output)
console.log(`Generated ${outPath} with ${devices.length} devices`)

// Copy device images from submodule to public/devices/
const imagesSource = path.join(devicesDir, "images")
const imagesDest = path.join(process.cwd(), "public", "devices")

if (fs.existsSync(imagesSource)) {
  fs.mkdirSync(imagesDest, { recursive: true })
  const images = fs.readdirSync(imagesSource).filter((f) => f.endsWith(".webp"))
  for (const img of images) {
    fs.copyFileSync(path.join(imagesSource, img), path.join(imagesDest, img))
  }
  console.log(`Copied ${images.length} device images to public/devices/`)
}

// --- Touchstone (.s1p) sweep parsing ---

type SweepPoint = { frequency_hz: number; vswr: number; return_loss_db: number }
type ParsedSweep = { reference_impedance: number; points: SweepPoint[] }
type Marker = { frequency: string; vswr: string }

const FREQ_MULTIPLIER: Record<string, number> = { hz: 1, khz: 1e3, mhz: 1e6, ghz: 1e9 }

// Default frequencies (MHz) markers are derived at when a test does not specify
// its own. Matches the US 915 ISM band edges + center used by existing data.
const DEFAULT_MARKER_FREQS_MHZ = [902, 915, 928]

// Parse a Touchstone 1-port (.s1p) file into VSWR / return-loss points. The `#`
// option line is parsed rather than assumed, since nanoVNA tools vary in
// frequency unit (Hz vs MHz) and data format (RI / MA / DB).
function parseTouchstoneS1P(text: string): ParsedSweep {
  let freqUnit = "mhz" // Touchstone default when the option line is absent
  let format = "ma"
  let reference_impedance = 50
  const points: SweepPoint[] = []

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.split("!")[0].trim() // strip inline comments
    if (!line) continue

    if (line.startsWith("#")) {
      const tokens = line.slice(1).trim().split(/\s+/)
      for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i].toLowerCase()
        if (t in FREQ_MULTIPLIER) freqUnit = t
        else if (t === "ri" || t === "ma" || t === "db") format = t
        else if (t === "r" && tokens[i + 1] !== undefined) {
          const r = parseFloat(tokens[i + 1])
          if (!Number.isNaN(r)) reference_impedance = r
        }
      }
      continue
    }

    const parts = line.split(/\s+/).map(Number)
    if (parts.length < 3 || parts.slice(0, 3).some(Number.isNaN)) continue

    const [freq, a, b] = parts
    const frequency_hz = freq * (FREQ_MULTIPLIER[freqUnit] ?? 1e6)

    // Linear magnitude of S11 from whichever format the file uses.
    let mag: number
    if (format === "ri") mag = Math.hypot(a, b)
    else if (format === "db") mag = Math.pow(10, a / 20)
    else mag = a // ma: already a linear magnitude

    // Clamp just under 1 so a noisy |S11| >= 1 does not blow up VSWR.
    const clamped = Math.min(Math.max(mag, 0), 0.999999)
    const vswr = (1 + clamped) / (1 - clamped)
    const return_loss_db = -20 * Math.log10(Math.max(clamped, 1e-6))

    points.push({
      frequency_hz: Math.round(frequency_hz),
      vswr: Math.round(vswr * 10000) / 10000,
      return_loss_db: Math.round(return_loss_db * 100) / 100,
    })
  }

  return { reference_impedance, points }
}

// Sample VSWR at target frequencies within the sweep. Output matches the
// hand-authored marker format exactly: frequency "915MHz", vswr "1.178:1".
function deriveMarkers(points: SweepPoint[], freqStrings?: string[]): Marker[] {
  if (!points.length) return []
  const min = points[0].frequency_hz
  const max = points[points.length - 1].frequency_hz

  const targets = (
    freqStrings && freqStrings.length
      ? freqStrings.map((s) => parseFloat(s)).filter((n) => !Number.isNaN(n))
      : DEFAULT_MARKER_FREQS_MHZ
  ).filter((mhz) => mhz * 1e6 >= min && mhz * 1e6 <= max)

  return targets.map((mhz) => {
    const targetHz = mhz * 1e6
    let nearest = points[0]
    for (const p of points) {
      if (Math.abs(p.frequency_hz - targetHz) < Math.abs(nearest.frequency_hz - targetHz)) nearest = p
    }
    return { frequency: `${mhz}MHz`, vswr: `${nearest.vswr.toFixed(3)}:1` }
  })
}

// Resonant point: lowest VSWR across the full-resolution sweep.
function minVswrPoint(points: SweepPoint[]): { frequency_hz: number; vswr: number } {
  let best = points[0]
  for (const p of points) if (p.vswr < best.vswr) best = p
  return { frequency_hz: best.frequency_hz, vswr: best.vswr }
}

// Evenly resample down to `cap` points (keeping first and last) so a very dense
// sweep does not bloat the generated file. The raw file stays fully downloadable.
function downsamplePoints(points: SweepPoint[], cap: number): SweepPoint[] {
  if (points.length <= cap) return points
  const step = (points.length - 1) / (cap - 1)
  const out: SweepPoint[] = []
  for (let i = 0; i < cap; i++) out.push(points[Math.round(i * step)])
  return out
}

// --- Antenna loading ---

// Authored antenna JSON as it sits in data/mesh_antennas/. Same shape as the
// Antenna type except for what this script computes: `markers` may be absent on
// touchstone-only tests (derived or defaulted below, required on the output
// type) and `sweep` is never authored.
type RawAntennaTestResult = Omit<AntennaTestResult, "markers"> & {
  markers?: AntennaTestResult["markers"]
}

type RawAntenna = Omit<Antenna, "test_results"> & {
  test_results: RawAntennaTestResult[]
}

const antennasDir = path.join(process.cwd(), "data", "mesh_antennas")
const touchstoneSource = path.join(antennasDir, "touchstone")

if (!fs.existsSync(antennasDir)) {
  console.error("antenna data not found at", antennasDir)
  process.exit(1)
}

const antennaFiles = fs.readdirSync(antennasDir).filter((f) => f.endsWith(".json"))
const antennaData = antennaFiles.map((file): Antenna => {
  let raw: RawAntenna
  try {
    raw = JSON.parse(fs.readFileSync(path.join(antennasDir, file), "utf-8"))
  } catch (err) {
    throw new Error(`Failed to parse data/mesh_antennas/${file}: ${(err as Error).message}`)
  }
  // Map bare image filename to full path
  if (raw.image && !raw.image.startsWith("/")) {
    raw.image = `/mesh/antennas/${raw.image}`
  }

  // Sanitize authored commentary HTML (see COMMENTARY_SANITIZE_OPTIONS above).
  if (raw.commentary) {
    raw.commentary = sanitizeCommentary(raw.commentary)
  }

  // Parse any attached Touchstone (.s1p) files into full sweeps. Each file lives
  // in the antenna's own directory (touchstone/<slug>/), so the `touchstone`
  // field is just a bare filename. A missing file warns but does not fail the
  // build. When a test has no hand-authored markers, derive them here.
  if (Array.isArray(raw.test_results)) {
    for (const test of raw.test_results) {
      if (!test.touchstone) continue
      if (test.touchstone.includes("/") || test.touchstone.includes("\\")) {
        console.warn(`  ! touchstone must be a bare filename for ${raw.slug}: ${test.touchstone} (skipping sweep)`)
        continue
      }
      const relPath = `${raw.slug}/${test.touchstone}`
      const s1pPath = path.join(touchstoneSource, raw.slug, test.touchstone)
      if (!fs.existsSync(s1pPath)) {
        console.warn(`  ! touchstone not found for ${raw.slug}: touchstone/${relPath} (skipping sweep)`)
        continue
      }
      const parsed = parseTouchstoneS1P(fs.readFileSync(s1pPath, "utf-8"))
      if (!parsed.points.length) {
        console.warn(`  ! touchstone had no data points for ${raw.slug}: touchstone/${relPath}`)
        continue
      }
      const min_vswr = minVswrPoint(parsed.points)
      test.sweep = {
        source_file: `/mesh/antennas/touchstone/${relPath}`,
        reference_impedance: parsed.reference_impedance,
        point_count: parsed.points.length,
        min_vswr,
        points: downsamplePoints(parsed.points, 500),
      }
      if (!test.markers || !test.markers.length) {
        let markers = deriveMarkers(parsed.points, test.marker_frequencies)
        // Fall back to the resonant point if no target frequency lands in range.
        if (!markers.length) {
          markers = [{ frequency: `${Math.round(min_vswr.frequency_hz / 1e6)}MHz`, vswr: `${min_vswr.vswr.toFixed(3)}:1` }]
        }
        test.markers = markers
      }
    }

    // Guarantee every test result carries a markers array. Touchstone-only tests
    // normally get markers derived above, but if the .s1p is missing or empty that
    // derivation is skipped (warn-not-fail), leaving markers undefined. The Antenna
    // type declares markers as required, so default to [] here and let consumers
    // (bestVswrAt915, bestMeasuredVswr) iterate unconditionally.
    for (const test of raw.test_results) {
      if (!Array.isArray(test.markers)) test.markers = []
    }
  }

  // The defaulting loop above upgraded every optional `markers` to the required
  // array the Antenna type declares.
  return raw as Antenna
})

// Default display order: pinned antennas first (lowest sort_order wins), then alphabetical by title.
antennaData.sort(
  (a, b) =>
    (a.sort_order ?? Number.MAX_SAFE_INTEGER) - (b.sort_order ?? Number.MAX_SAFE_INTEGER) ||
    (a.title ?? "").localeCompare(b.title ?? ""),
)

const antennaOutput = `import type { Antenna } from "@/types/antenna"

// Auto-generated from data/. Do not edit manually.
// Regenerate with: npx tsx lib/prebuild.ts

export const antennas: Antenna[] = ${JSON.stringify(antennaData, null, 2)}
`

const antennaOutPath = path.join(process.cwd(), "data", "antennas-generated.ts")
fs.writeFileSync(antennaOutPath, antennaOutput)
console.log(`Generated ${antennaOutPath} with ${antennaData.length} antennas`)

// Copy antenna images from submodule to public/mesh/antennas/
const antennaImagesSource = path.join(antennasDir, "images")
const antennaImagesDest = path.join(process.cwd(), "public", "mesh", "antennas")

if (fs.existsSync(antennaImagesSource)) {
  fs.mkdirSync(antennaImagesDest, { recursive: true })
  const antennaImages = fs.readdirSync(antennaImagesSource).filter((f) => f.endsWith(".webp"))
  for (const img of antennaImages) {
    fs.copyFileSync(path.join(antennaImagesSource, img), path.join(antennaImagesDest, img))
  }
  console.log(`Copied ${antennaImages.length} antenna images to public/mesh/antennas/`)
}

// Copy raw Touchstone (.s1p) files to public/ so they are downloadable, keeping
// the per-antenna subdirectory layout. Matches both .s1p and .S1P (nanoVNA often
// exports uppercase).
const touchstoneDest = path.join(process.cwd(), "public", "mesh", "antennas", "touchstone")

if (fs.existsSync(touchstoneSource)) {
  let touchstoneCopied = 0
  const slugDirs = fs.readdirSync(touchstoneSource, { withFileTypes: true }).filter((d) => d.isDirectory())
  for (const dir of slugDirs) {
    const srcDir = path.join(touchstoneSource, dir.name)
    const s1pFiles = fs.readdirSync(srcDir).filter((f) => /\.s1p$/i.test(f))
    if (!s1pFiles.length) continue
    const destDir = path.join(touchstoneDest, dir.name)
    fs.mkdirSync(destDir, { recursive: true })
    for (const f of s1pFiles) {
      fs.copyFileSync(path.join(srcDir, f), path.join(destDir, f))
      touchstoneCopied++
    }
  }
  console.log(`Copied ${touchstoneCopied} touchstone files to public/mesh/antennas/touchstone/`)
}

// --- Filters: Touchstone (.s2p) parsing ---

// One raw data row of a 2-port sweep: complex S11 (input match, needed for
// the Smith chart) plus linear magnitudes of S11 and S21. Kept linear until
// output so interpolation and threshold searches happen on the measured
// quantity, not on dB.
type S2PRow = { hz: number; s11_re: number; s11_im: number; s11: number; s21: number }
type ParsedS2P = { reference_impedance: number; rows: S2PRow[] }

// Parse a Touchstone 2-port (.s2p) file. Same option-line handling as the
// .s1p parser above (unit, RI/MA/DB format, reference impedance), but each
// data row carries four S-parameters; only S11 and S21 are used. NanoVNA
// exports pad S12/S22 with zeros, so those columns are ignored.
function parseTouchstoneS2P(text: string): ParsedS2P {
  let freqUnit = "mhz"
  let format = "ma"
  let reference_impedance = 50
  const rows: S2PRow[] = []

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.split("!")[0].trim()
    if (!line) continue

    if (line.startsWith("#")) {
      const tokens = line.slice(1).trim().split(/\s+/)
      for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i].toLowerCase()
        if (t in FREQ_MULTIPLIER) freqUnit = t
        else if (t === "ri" || t === "ma" || t === "db") format = t
        else if (t === "r" && tokens[i + 1] !== undefined) {
          const r = parseFloat(tokens[i + 1])
          if (!Number.isNaN(r)) reference_impedance = r
        }
      }
      continue
    }

    const parts = line.split(/\s+/).map(Number)
    if (parts.length < 5 || parts.slice(0, 5).some(Number.isNaN)) continue

    const complex = (a: number, b: number): { re: number; im: number } => {
      if (format === "ri") return { re: a, im: b }
      const mag = format === "db" ? Math.pow(10, a / 20) : a
      const rad = (b * Math.PI) / 180
      return { re: mag * Math.cos(rad), im: mag * Math.sin(rad) }
    }

    const s11 = complex(parts[1], parts[2])
    const s21 = complex(parts[3], parts[4])
    rows.push({
      hz: Math.round(parts[0] * (FREQ_MULTIPLIER[freqUnit] ?? 1e6)),
      s11_re: s11.re,
      s11_im: s11.im,
      s11: Math.hypot(s11.re, s11.im),
      s21: Math.hypot(s21.re, s21.im),
    })
  }

  return { reference_impedance, rows }
}

const s21Db = (mag: number) => 20 * Math.log10(Math.max(mag, 1e-5)) // floor -100 dB
const returnLossDb = (mag: number) => -20 * Math.log10(Math.min(Math.max(mag, 1e-6), 1))

const round = (n: number, places: number) => {
  const f = Math.pow(10, places)
  return Math.round(n * f) / f
}

// Linear interpolation of a row quantity at a target frequency; null outside
// the sweep's range.
function interpRow(rows: S2PRow[], targetHz: number, key: "s11" | "s21"): number | null {
  if (!rows.length || targetHz < rows[0].hz || targetHz > rows[rows.length - 1].hz) return null
  for (let i = 1; i < rows.length; i++) {
    if (rows[i].hz >= targetHz) {
      const a = rows[i - 1]
      const b = rows[i]
      const t = (targetHz - a.hz) / (b.hz - a.hz || 1)
      return a[key] + t * (b[key] - a[key])
    }
  }
  return rows[rows.length - 1][key]
}

// US operating frequencies the site cares about; keep in sync with the chart
// components' FREQ_MARKERS (Meshtastic US LongFast, MeshCore US).
const FILTER_MARKER_FREQS: { mhz: number; label: string }[] = [
  { mhz: 906.875, label: "Meshtastic" },
  { mhz: 910.525, label: "MeshCore" },
]

// Common interferers near the US 915 ISM band, reported as attenuation. These
// are what a receive filter exists to knock down, so they are first-class
// computed specs rather than something read off the wideband chart.
const FILTER_REJECTION_FREQS: { mhz: number; label: string }[] = [
  { mhz: 433, label: "70cm ham / ISM" },
  { mhz: 700, label: "LTE 700" },
  { mhz: 824, label: "Cellular uplink" },
  { mhz: 894, label: "Cellular downlink" },
  { mhz: 930, label: "Pagers" },
  { mhz: 960, label: "Fixed links" },
  { mhz: 1090, label: "ADS-B" },
]

type NamedSweep = { fileName: string; rows: S2PRow[]; stepHz: number }

const sweepStep = (rows: S2PRow[]) =>
  rows.length > 1 ? (rows[rows.length - 1].hz - rows[0].hz) / (rows.length - 1) : Infinity

// Finest-resolution sweep covering a frequency. Wide 430-1500 MHz sweeps step
// ~10.7 MHz, far too coarse on steep filter skirts, so every spot value must
// come from the narrowest sweep that contains it.
function finestCovering(sweeps: NamedSweep[], hz: number): NamedSweep | null {
  let best: NamedSweep | null = null
  for (const s of sweeps) {
    if (!s.rows.length || hz < s.rows[0].hz || hz > s.rows[s.rows.length - 1].hz) continue
    if (!best || s.stepHz < best.stepHz) best = s
  }
  return best
}

function deriveFilterMarkers(sweeps: NamedSweep[]): FilterMarker[] {
  const markers: FilterMarker[] = []
  for (const { mhz, label } of FILTER_MARKER_FREQS) {
    const sweep = finestCovering(sweeps, mhz * 1e6)
    if (!sweep) continue
    const s21 = interpRow(sweep.rows, mhz * 1e6, "s21")
    const s11 = interpRow(sweep.rows, mhz * 1e6, "s11")
    if (s21 == null || s11 == null) continue
    markers.push({
      label,
      frequency_mhz: mhz,
      insertion_loss_db: round(-s21Db(s21), 2),
      return_loss_db: round(returnLossDb(s11), 1),
    })
  }
  return markers
}

// 3 dB passband from the finest sweep that brackets BOTH band edges. A sweep
// whose response is still above the -3 dB threshold at either end (e.g. the
// 902-928 detail sweep of a wide SAW filter, or a low-pass filter's wide
// sweep) cannot bound the passband and is skipped.
function derivePassband(sweeps: NamedSweep[]): FilterPassband | undefined {
  let best: { sweep: NamedSweep; pb: FilterPassband } | null = null
  for (const sweep of sweeps) {
    const rows = sweep.rows
    if (rows.length < 3) continue
    let peak = rows[0]
    let peakIdx = 0
    for (let i = 1; i < rows.length; i++) {
      if (rows[i].s21 > peak.s21) {
        peak = rows[i]
        peakIdx = i
      }
    }
    const threshold = peak.s21 * Math.pow(10, -3 / 20)
    let low: number | null = null
    let high: number | null = null
    for (let i = peakIdx; i >= 1; i--) {
      if (rows[i - 1].s21 < threshold && rows[i].s21 >= threshold) {
        const t = (threshold - rows[i - 1].s21) / (rows[i].s21 - rows[i - 1].s21)
        low = rows[i - 1].hz + t * (rows[i].hz - rows[i - 1].hz)
        break
      }
    }
    for (let i = peakIdx; i < rows.length - 1; i++) {
      if (rows[i].s21 >= threshold && rows[i + 1].s21 < threshold) {
        const t = (rows[i].s21 - threshold) / (rows[i].s21 - rows[i + 1].s21)
        high = rows[i].hz + t * (rows[i + 1].hz - rows[i].hz)
        break
      }
    }
    if (low == null || high == null) continue
    const pb: FilterPassband = {
      peak_s21_db: round(s21Db(peak.s21), 2),
      peak_mhz: round(peak.hz / 1e6, 2),
      low_3db_mhz: round(low / 1e6, 1),
      high_3db_mhz: round(high / 1e6, 1),
      bandwidth_3db_mhz: round((high - low) / 1e6, 1),
    }
    if (!best || sweep.stepHz < best.sweep.stepHz) best = { sweep, pb }
  }
  return best?.pb
}

function deriveRejection(sweeps: NamedSweep[]): FilterRejectionPoint[] {
  const out: FilterRejectionPoint[] = []
  for (const { mhz, label } of FILTER_REJECTION_FREQS) {
    const sweep = finestCovering(sweeps, mhz * 1e6)
    if (!sweep) continue
    const s21 = interpRow(sweep.rows, mhz * 1e6, "s21")
    if (s21 == null) continue
    out.push({ frequency_mhz: mhz, label, rejection_db: round(-s21Db(s21), 1) })
  }
  return out
}

function toSweepPoints(rows: S2PRow[]): FilterSweepPoint[] {
  return rows.map((r) => ({
    frequency_hz: r.hz,
    s21_db: round(s21Db(r.s21), 2),
    return_loss_db: round(returnLossDb(r.s11), 2),
    s11_re: round(r.s11_re, 4),
    s11_im: round(r.s11_im, 4),
  }))
}

// A sweep's range identity as displayed in the chart's range tabs, e.g.
// "902-928". Must match the chart component's rangeKey exactly.
const sweepRangeKey = (rows: S2PRow[]) =>
  `${Math.round(rows[0].hz / 1e6)}-${Math.round(rows[rows.length - 1].hz / 1e6)}`

// The range tab a filter's chart should open on: the custom mid sweep chosen
// around that filter's passband. The meetup convention sweeps three ranges
// (902-928 detail, a per-filter mid, 430-1500 wide); dropping the widest and
// taking the widest remaining picks the mid, and degrades to the 902-928
// detail sweep for filters measured without one.
function deriveDefaultRange(ranges: Map<string, number>): string | undefined {
  const entries = [...ranges.entries()].sort((a, b) => b[1] - a[1])
  if (!entries.length) return undefined
  return (entries.length > 1 ? entries[1] : entries[0])[0]
}

// --- Filter loading ---

const filtersDir = path.join(process.cwd(), "data", "mesh_filters")
const filterTouchstoneSource = path.join(filtersDir, "touchstone")

if (!fs.existsSync(filtersDir)) {
  console.error("filter data not found at", filtersDir)
  process.exit(1)
}

const filterFiles = fs.readdirSync(filtersDir).filter((f) => f.endsWith(".json"))
const filterData = filterFiles.map((file): RfFilter => {
  let raw: RfFilter
  try {
    raw = JSON.parse(fs.readFileSync(path.join(filtersDir, file), "utf-8"))
  } catch (err) {
    throw new Error(`Failed to parse data/mesh_filters/${file}: ${(err as Error).message}`)
  }
  // Map bare image filename to full path
  if (raw.image && !raw.image.startsWith("/")) {
    raw.image = `/mesh/filters/${raw.image}`
  }

  // Sanitize authored commentary HTML (see COMMENTARY_SANITIZE_OPTIONS above).
  if (raw.commentary) {
    raw.commentary = sanitizeCommentary(raw.commentary)
  }

  // Parse each test's .s2p files into sweeps, then derive the computed summary
  // (markers, passband, rejection). A missing file warns but does not fail the
  // build, matching antennas; `pnpm validate` is the hard gate for that.
  const measuredRanges = new Map<string, number>() // range key -> span (Hz), across all tests
  for (const test of raw.test_results ?? []) {
    const named: NamedSweep[] = []
    const sweeps: FilterSweep[] = []
    for (const ts of test.touchstones ?? []) {
      if (ts.includes("/") || ts.includes("\\")) {
        console.warn(`  ! touchstone must be a bare filename for ${raw.slug}: ${ts} (skipping sweep)`)
        continue
      }
      const s2pPath = path.join(filterTouchstoneSource, raw.slug, ts)
      if (!fs.existsSync(s2pPath)) {
        console.warn(`  ! touchstone not found for ${raw.slug}: touchstone/${raw.slug}/${ts} (skipping sweep)`)
        continue
      }
      const parsed = parseTouchstoneS2P(fs.readFileSync(s2pPath, "utf-8"))
      if (!parsed.rows.length) {
        console.warn(`  ! touchstone had no data points for ${raw.slug}: touchstone/${raw.slug}/${ts}`)
        continue
      }
      named.push({ fileName: ts, rows: parsed.rows, stepHz: sweepStep(parsed.rows) })
      measuredRanges.set(sweepRangeKey(parsed.rows), parsed.rows[parsed.rows.length - 1].hz - parsed.rows[0].hz)
      sweeps.push({
        source_file: `/mesh/filters/touchstone/${raw.slug}/${ts}`,
        file_name: ts,
        reference_impedance: parsed.reference_impedance,
        point_count: parsed.rows.length,
        start_hz: parsed.rows[0].hz,
        stop_hz: parsed.rows[parsed.rows.length - 1].hz,
        points: toSweepPoints(parsed.rows).slice(0, 500),
      })
    }
    if (!sweeps.length) continue
    const passband = derivePassband(named)
    test.sweeps = sweeps
    test.summary = {
      markers: deriveFilterMarkers(named),
      ...(passband ? { passband } : {}),
      rejection: deriveRejection(named),
    }
  }

  // Authored default_range wins when it names a measured range; otherwise the
  // mid-sweep heuristic fills it in.
  if (raw.default_range && !measuredRanges.has(raw.default_range)) {
    console.warn(
      `  ! default_range "${raw.default_range}" for ${raw.slug} matches no measured sweep ` +
        `(have: ${[...measuredRanges.keys()].join(", ") || "none"}); using the computed default`,
    )
    raw.default_range = undefined
  }
  raw.default_range = raw.default_range ?? deriveDefaultRange(measuredRanges)

  return raw
})

// Default display order: pinned filters first (lowest sort_order wins), then alphabetical by title.
filterData.sort(
  (a, b) =>
    (a.sort_order ?? Number.MAX_SAFE_INTEGER) - (b.sort_order ?? Number.MAX_SAFE_INTEGER) ||
    (a.title ?? "").localeCompare(b.title ?? ""),
)

const filterOutput = `import type { RfFilter } from "@/types/filter"

// Auto-generated from data/. Do not edit manually.
// Regenerate with: npx tsx lib/prebuild.ts

export const filters: RfFilter[] = ${JSON.stringify(filterData, null, 2)}
`

const filterOutPath = path.join(process.cwd(), "data", "filters-generated.ts")
fs.writeFileSync(filterOutPath, filterOutput)
console.log(`Generated ${filterOutPath} with ${filterData.length} filters`)

// Copy filter images to public/mesh/filters/
const filterImagesSource = path.join(filtersDir, "images")
const filterImagesDest = path.join(process.cwd(), "public", "mesh", "filters")

if (fs.existsSync(filterImagesSource)) {
  fs.mkdirSync(filterImagesDest, { recursive: true })
  const filterImages = fs.readdirSync(filterImagesSource).filter((f) => f.endsWith(".webp"))
  for (const img of filterImages) {
    fs.copyFileSync(path.join(filterImagesSource, img), path.join(filterImagesDest, img))
  }
  console.log(`Copied ${filterImages.length} filter images to public/mesh/filters/`)
}

// Copy raw Touchstone (.s2p) files to public/ so they are downloadable, keeping
// the per-filter subdirectory layout.
const filterTouchstoneDest = path.join(process.cwd(), "public", "mesh", "filters", "touchstone")

if (fs.existsSync(filterTouchstoneSource)) {
  let filterTouchstoneCopied = 0
  const slugDirs = fs.readdirSync(filterTouchstoneSource, { withFileTypes: true }).filter((d) => d.isDirectory())
  for (const dir of slugDirs) {
    const srcDir = path.join(filterTouchstoneSource, dir.name)
    const s2pFiles = fs.readdirSync(srcDir).filter((f) => /\.s2p$/i.test(f))
    if (!s2pFiles.length) continue
    const destDir = path.join(filterTouchstoneDest, dir.name)
    fs.mkdirSync(destDir, { recursive: true })
    for (const f of s2pFiles) {
      fs.copyFileSync(path.join(srcDir, f), path.join(destDir, f))
      filterTouchstoneCopied++
    }
  }
  console.log(`Copied ${filterTouchstoneCopied} touchstone files to public/mesh/filters/touchstone/`)
}
