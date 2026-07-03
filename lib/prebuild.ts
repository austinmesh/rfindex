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
    image_url: raw.image ? [raw.image] : [],
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

const antennasDir = path.join(process.cwd(), "data", "mesh_antennas")
const touchstoneSource = path.join(antennasDir, "touchstone")

if (!fs.existsSync(antennasDir)) {
  console.error("antenna data not found at", antennasDir)
  process.exit(1)
}

const antennaFiles = fs.readdirSync(antennasDir).filter((f) => f.endsWith(".json"))
const antennaData = antennaFiles.map((file) => {
  let raw
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

  return raw
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
