import { devices } from "@/data/devices-generated"
import { antennas } from "@/data/antennas-generated"
import { filters } from "@/data/filters-generated"
import type { AntennaSitemapItem } from "@/types/antenna"
import type { DeviceSitemapItem } from "@/types/device"
import type { FilterSitemapItem } from "@/types/filter"

// Re-export devices (generated from data/ at prebuild)
export { devices } from "@/data/devices-generated"

// Re-export antenna data (generated from data/ at prebuild)
export { antennas } from "@/data/antennas-generated"

// Re-export filter data (generated from data/ at prebuild)
export { filters } from "@/data/filters-generated"

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

export const allLoraRadios = Array.from(
  new Set(devices.flatMap((device) => (device.specifications.lora_radio ? [device.specifications.lora_radio] : []))),
).sort()

// Ceiling for the "min TX power" filter slider. Floored at 33 dBm (2W) so the
// slider has a stable range even before the field is widely populated, and it
// grows automatically if a device ever reports higher.
export const maxTxPowerDbm = Math.max(
  33,
  ...devices.map((device) => device.specifications.max_tx_power_dbm ?? 0),
)

// Format a max TX power in dBm for display, e.g. 30 -> "30 dBm (1 W)",
// 22 -> "22 dBm (~160 mW)". Returns "N/A" when the value is missing.
export function formatTxPower(dbm?: number): string {
  if (dbm === undefined || dbm === null || Number.isNaN(dbm)) return "N/A"
  const mw = Math.pow(10, dbm / 10)
  let magnitude: string
  if (mw >= 1000) {
    const watts = mw / 1000
    const rounded = Math.round(watts * 10) / 10
    const approx = Math.abs(watts - rounded) / watts > 0.005 ? "~" : ""
    magnitude = `${approx}${rounded} W`
  } else {
    let rounded: number
    if (mw >= 100) rounded = Math.round(mw / 10) * 10
    else if (mw >= 10) rounded = Math.round(mw)
    else rounded = Math.round(mw * 10) / 10
    const approx = Math.abs(mw - rounded) / mw > 0.005 ? "~" : ""
    magnitude = `${approx}${rounded} mW`
  }
  return `${dbm} dBm (${magnitude})`
}

export const allFirmwares = Array.from(
  new Set(devices.flatMap((device) => device.supported_firmware)),
).sort()

// --- Antenna derived constants ---

export const antennaSitemapData: AntennaSitemapItem[] = antennas.map((antenna) => ({
  id: antenna.slug,
  name: antenna.title,
  lastModified: new Date(),
}))

export const allAntennaCategories = Array.from(new Set(antennas.filter((a) => a.category).map((a) => a.category!))).sort()

// --- Filter derived constants ---

export const filterSitemapData: FilterSitemapItem[] = filters.map((filter) => ({
  id: filter.slug,
  name: filter.title,
  lastModified: new Date(),
}))

export const allFilterTypes = Array.from(new Set(filters.map((f) => f.filter_type))).sort()

export const allFilterConnectors = Array.from(new Set(filters.map((f) => f.connectors))).sort()

// UI constants
export const statusOptions = [
  { value: "true", label: "Suggested" },
  { value: "false", label: "Not Suggested" },
] as const
