/**
 * Prebuild script: reads device and antenna JSON files from data/
 * and generates data/devices-generated.ts and data/antennas-generated.ts
 * for the Next.js app to import.
 *
 * Run via: npx tsx lib/prebuild.ts
 */

import fs from "fs"
import path from "path"

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

function mapRawDevice(raw: RawDevice) {
  return {
    id: raw.id,
    name: raw.title,
    manufacturer: raw.manufacturer,
    model: raw.model,
    description: raw.description ?? "",
    category: raw.category ?? [],
    image_url: raw.image ? [raw.image] : [],
    purchase_urls: raw.purchase_urls ?? [],
    price: raw.price,
    specifications: raw.specifications,
    features: raw.features ?? [],
    supported_firmware: raw.supported_firmware,
    ...(raw.commentary ? { commentary: raw.commentary } : {}),
    ...(raw.sort_order != null ? { sort_order: raw.sort_order } : {}),
  }
}

const devicesDir = path.join(process.cwd(), "data", "meshtastic_devices")

if (!fs.existsSync(devicesDir)) {
  console.error("device data not found at", devicesDir)
  process.exit(1)
}

const files = fs.readdirSync(devicesDir).filter((f) => f.endsWith(".json"))
const devices = files.map((file) => {
  const raw: RawDevice = JSON.parse(fs.readFileSync(path.join(devicesDir, file), "utf-8"))
  return mapRawDevice(raw)
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

// --- Antenna loading ---

const antennasDir = path.join(process.cwd(), "data", "meshtastic_antennas")

if (!fs.existsSync(antennasDir)) {
  console.error("antenna data not found at", antennasDir)
  process.exit(1)
}

const antennaFiles = fs.readdirSync(antennasDir).filter((f) => f.endsWith(".json"))
const antennaData = antennaFiles.map((file) => {
  const raw = JSON.parse(fs.readFileSync(path.join(antennasDir, file), "utf-8"))
  // Map bare image filename to full path
  if (raw.image && !raw.image.startsWith("/")) {
    raw.image = `/mesh/antennas/${raw.image}`
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
