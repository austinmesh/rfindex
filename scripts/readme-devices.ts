/**
 * Generates the Meshtastic / MeshCore device table in README.md.
 *
 * The README doubles as a search-engine landing page for the GitHub repo, so
 * the full device catalog is rendered there as a plain Markdown table with
 * every device name linking to its rfindex.com detail page. Only the block
 * between the two marker comments is replaced; the heading and intro copy
 * around it are hand-written and stay untouched.
 *
 * Called from lib/prebuild.ts after the device data is generated, so
 * `pnpm dev` and `pnpm build` keep the table current. CI (validate.yml) runs
 * the prebuild and fails if README.md comes out different from what is
 * committed. Run standalone with: npx tsx lib/prebuild.ts
 */

import fs from "fs"
import path from "path"

import { SITE_URL } from "@/lib/seo"
import type { Device } from "@/lib/types/device"

// GitHub edit link target. The device JSON is the source of truth, so every
// row links straight to the editor for its file.
const REPO_EDIT_URL = "https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices"

export const README_START_MARKER = "<!-- devices-table:start -->"
export const README_END_MARKER = "<!-- devices-table:end -->"

// Markdown table cells cannot contain a literal pipe, and a newline would
// break the row. Nothing in the data has these today, but the table must
// never silently corrupt if a contributor adds one.
function cell(value: string | undefined | null): string {
  if (!value) return ""
  return value.replace(/\|/g, "\\|").replace(/\s+/g, " ").trim()
}

function formatPrice(device: Device): string {
  const format = (value: number | string) => (typeof value === "string" ? value : value.toFixed(2))
  const { min, max, currency } = device.price
  const suffix = currency && currency !== "USD" ? ` ${currency}` : ""
  return (min === max ? `$${format(min)}` : `$${format(min)} - $${format(max)}`) + suffix
}

function formatBattery(device: Device): string {
  const { type, capacity_mAh } = device.specifications.battery
  const capacity =
    capacity_mAh === undefined || capacity_mAh === null || capacity_mAh === ""
      ? ""
      : typeof capacity_mAh === "number"
        ? `${capacity_mAh} mAh`
        : String(capacity_mAh)
  return [type, capacity].filter(Boolean).join(" ")
}

function formatTxPower(device: Device): string {
  const dbm = device.specifications.max_tx_power_dbm
  return dbm === undefined || dbm === null ? "" : `${dbm} dBm`
}

export function deviceUrl(device: Device): string {
  return `${SITE_URL}/mesh/devices/${device.id}`
}

// "Discontinued" plus a link to the successor when one is recorded, on its own
// line under the manufacturer. Discontinued devices already sort last.
function statusLine(device: Device, byId: Map<string, Device>): string {
  if (!device.discontinued) return ""
  const replacement = device.replaced_by ? byId.get(device.replaced_by) : undefined
  const suffix = replacement ? `, replaced by [${cell(replacement.name)}](${deviceUrl(replacement)})` : ""
  return ` <br> *Discontinued${suffix}*`
}

// fileById maps a device id to its JSON filename in data/mesh_devices/ (the
// filename is not part of the generated Device, so the prebuild passes it).
export function renderDeviceTable(devices: Device[], fileById: Map<string, string>): string {
  const byId = new Map(devices.map((device) => [device.id, device]))
  const editLink = (device: Device) => {
    const file = fileById.get(device.id)
    return file ? ` ([edit](${REPO_EDIT_URL}/${encodeURIComponent(file)}))` : ""
  }
  const header = ["Device", "Description", "Category", "MCU", "LoRa radio", "Max TX", "Battery", "Price"]
  const rows = devices.map((device) => [
    // Linked name with the manufacturer on a second line (GitHub renders <br>
    // inside table cells), so the first column reads like the site's cards.
    // The spaces around <br> keep the words apart in renderers that drop it.
    `[${cell(device.name)}](${deviceUrl(device)}) <br> ${cell(device.manufacturer)}${editLink(device)}${statusLine(device, byId)}`,
    cell(device.description),
    cell([...device.category].sort().join(", ")),
    cell(device.specifications.microcontroller),
    cell(device.specifications.lora_radio),
    cell(formatTxPower(device)),
    cell(formatBattery(device)),
    cell(formatPrice(device)),
  ])
  const line = (cells: string[]) => `| ${cells.join(" | ")} |`
  return [line(header), line(header.map(() => "---")), ...rows.map(line)].join("\n")
}

export function renderDeviceSection(devices: Device[], fileById: Map<string, string>): string {
  const listingUrl = `${SITE_URL}/mesh/devices`
  const discontinued = devices.filter((device) => device.discontinued).length
  const count = discontinued
    ? `${devices.length} devices are listed, ${discontinued} of them discontinued (kept for reference, sorted last).`
    : `${devices.length} devices are listed.`
  return [
    README_START_MARKER,
    `${count} Every row links to the device's page on RF Index,`,
    `where you will find the full specifications, purchase links, and side-by-side`,
    `comparison, and to the JSON file behind it so you can fix or extend the data.`,
    `Browse and filter the whole catalog at [${listingUrl.replace(/^https?:\/\//, "")}](${listingUrl}).`,
    "",
    renderDeviceTable(devices, fileById),
    README_END_MARKER,
  ].join("\n")
}

// Rewrites the marked block in README.md. Returns true when the file changed.
export function syncReadmeDevices(
  devices: Device[],
  fileById: Map<string, string>,
  readmePath = path.join(process.cwd(), "README.md"),
): boolean {
  const current = fs.readFileSync(readmePath, "utf-8")
  const start = current.indexOf(README_START_MARKER)
  const end = current.indexOf(README_END_MARKER)
  if (start === -1 || end === -1 || end < start) {
    throw new Error(
      `README.md is missing the ${README_START_MARKER} / ${README_END_MARKER} markers that the device table is written between`,
    )
  }
  const next =
    current.slice(0, start) + renderDeviceSection(devices, fileById) + current.slice(end + README_END_MARKER.length)
  if (next === current) return false
  fs.writeFileSync(readmePath, next)
  return true
}
