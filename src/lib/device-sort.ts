import type { Device } from "@/lib/types/device"

// Column-style sorting shared by the device card grid (sidebar "Sort By"
// select) and the device table (clickable column headers). One `sort` URL
// param covers both views, so switching views keeps the order.

export const SORT_KEYS = ["name", "manufacturer", "price", "tx", "battery"] as const
export type SortKey = (typeof SORT_KEYS)[number]
export type SortDirection = "asc" | "desc"
export type SortOption = "default" | `${SortKey}-${SortDirection}`

// Numeric battery capacity, or undefined when missing/unparseable. The field
// is typed number | string because some data files spell it as a string.
export function parseBatteryCapacity(device: Device): number | undefined {
  const raw = device.specifications.battery.capacity_mAh
  if (raw === undefined || raw === null || raw === "") return undefined
  const parsed = typeof raw === "number" ? raw : Number.parseFloat(String(raw).replace(/[^0-9.]/g, ""))
  return Number.isNaN(parsed) || parsed <= 0 ? undefined : parsed
}

export function parsePrice(value: number | string): number {
  const parsed = typeof value === "number" ? value : Number.parseFloat(String(value).replace(/[^0-9.]/g, ""))
  return Number.isNaN(parsed) ? 0 : parsed
}

const sortValue: Record<SortKey, (device: Device) => string | number | undefined> = {
  name: (device) => device.name,
  manufacturer: (device) => device.manufacturer,
  price: (device) => parsePrice(device.price.min),
  tx: (device) => device.specifications.max_tx_power_dbm,
  battery: (device) => parseBatteryCapacity(device),
}

// Sort values arrive as plain strings (URL params, Select onValueChange);
// anything unrecognized falls back to the default order.
export function parseSortOption(value: string | null): SortOption {
  if (!value || value === "default") return "default"
  const [key, direction] = value.split("-")
  if ((SORT_KEYS as readonly string[]).includes(key) && (direction === "asc" || direction === "desc")) {
    return `${key as SortKey}-${direction}`
  }
  return "default"
}

export function splitSortOption(option: SortOption): { key: SortKey; direction: SortDirection } | null {
  if (option === "default") return null
  const [key, direction] = option.split("-") as [SortKey, SortDirection]
  return { key, direction }
}

// Comparator for Array.prototype.sort. Devices missing the sorted value
// (no listed TX power, no battery capacity) always sort last, in either
// direction, so the meaningful rows stay at the top.
export function compareDevices(a: Device, b: Device, option: SortOption): number {
  const sort = splitSortOption(option)
  if (!sort) return 0
  const va = sortValue[sort.key](a)
  const vb = sortValue[sort.key](b)
  if (va === undefined && vb === undefined) return 0
  if (va === undefined) return 1
  if (vb === undefined) return -1
  const result = typeof va === "string" && typeof vb === "string" ? va.localeCompare(vb) : Number(va) - Number(vb)
  return sort.direction === "asc" ? result : -result
}
