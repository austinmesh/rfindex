import { devices } from "@/data/devices-generated"
import { antennas } from "@/data/antennas-generated"
import type { AntennaSitemapItem } from "@/types/antenna"
import type { DeviceSitemapItem } from "@/types/device"

// Re-export devices (generated from data/ at prebuild)
export { devices } from "@/data/devices-generated"

// Re-export antenna data (generated from data/ at prebuild)
export { antennas } from "@/data/antennas-generated"

// Feature descriptions (UI copy, stays in this repo)
export { featureDescriptions } from "@/data/devices"

// --- Device derived constants ---

export const deviceSitemapData: DeviceSitemapItem[] = devices.map((device) => ({
  id: device.id,
  name: device.name,
  lastModified: new Date(),
}))

export const allDeviceCategories = Array.from(new Set(devices.flatMap((device) => device.category))).sort()

export const allFeatures = Array.from(new Set(devices.flatMap((device) => device.features))).sort()

export const allLoraFrequencies = Array.from(
  new Set(devices.flatMap((device) => device.specifications.lora_frequencies)),
).sort()

export const allMicrocontrollers = Array.from(
  new Set(devices.map((device) => device.specifications.microcontroller)),
).sort()

export const allFirmwares = Array.from(
  new Set(devices.flatMap((device) => device.supported_firmware)),
).sort()

// --- Antenna derived constants ---

export const antennaSitemapData: AntennaSitemapItem[] = antennas.map((antenna) => ({
  id: antenna.slug,
  name: antenna.manufacturer.description,
  lastModified: new Date(),
}))

export const allAntennaCategories = Array.from(new Set(antennas.filter((a) => a.category).map((a) => a.category!))).sort()

// UI constants
export const statusOptions = [
  { value: "true", label: "Suggested" },
  { value: "false", label: "Not Suggested" },
] as const
