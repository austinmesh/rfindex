"use client"
import type { ReactNode } from "react"
import type { Device } from "@/lib/types/device"

import Image from "next/image"
import Link from "next/link"
import { ArrowDown, ArrowUp, ArrowUpDown, Check, LayoutGrid, Minus, Table as TableIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ExternalLink } from "@/components/external-link"
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { parseBatteryCapacity, splitSortOption, type SortKey, type SortOption } from "@/lib/device-sort"
import { cn } from "@/lib/utils"

export type DeviceViewMode = "cards" | "table"

export function parseViewMode(value: string | null): DeviceViewMode {
  return value === "table" ? "table" : "cards"
}

// Segmented Cards / Table switch shown above the device listing.
export function DeviceViewToggle({
  view,
  onChange,
  className,
}: {
  view: DeviceViewMode
  onChange: (view: DeviceViewMode) => void
  className?: string
}) {
  const options: { value: DeviceViewMode; label: string; icon: typeof LayoutGrid }[] = [
    { value: "cards", label: "Cards", icon: LayoutGrid },
    { value: "table", label: "Table", icon: TableIcon },
  ]
  return (
    <div role="group" aria-label="View" className={cn("inline-flex rounded-lg border bg-background p-1 shadow-sm", className)}>
      {options.map(({ value, label, icon: Icon }) => (
        <Button
          key={value}
          type="button"
          size="sm"
          variant={view === value ? "secondary" : "ghost"}
          aria-pressed={view === value}
          onClick={() => onChange(value)}
          className="h-8 px-3"
        >
          <Icon className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">{label}</span>
        </Button>
      ))}
    </div>
  )
}

// Shared "no longer sold" label for the card grid, the table, and the detail
// page. Discontinued devices stay listed because their specs and pages are
// still useful, so the label is what tells a buyer to look at the successor.
export function DiscontinuedBadge({ className }: { className?: string }) {
  return (
    <Badge variant="outline" className={cn("border-destructive/50 text-destructive", className)}>
      Discontinued
    </Badge>
  )
}

export function formatDevicePrice(device: Device): string {
  const format = (value: number | string) => (typeof value === "string" ? value : value.toFixed(2))
  return device.price.min === device.price.max
    ? `$${format(device.price.min)}`
    : `$${format(device.price.min)} - $${format(device.price.max)}`
}

// Tabular yes/no cell. Icons keep the columns scannable like a spreadsheet;
// the sr-only text keeps them readable to screen readers. The wrapper is
// `relative` because sr-only is position:absolute: without a positioned
// ancestor inside the scroll container, cells scrolled off to the right would
// leak their static positions into the document width and make the whole
// page scroll sideways.
function YesNo({ value }: { value: boolean }) {
  return (
    <span className="relative flex justify-center">
      {value ? (
        <Check className="h-4 w-4 text-primary" aria-hidden="true" />
      ) : (
        <Minus className="h-3 w-3 text-muted-foreground/50" aria-hidden="true" />
      )}
      <span className="sr-only">{value ? "Yes" : "No"}</span>
    </span>
  )
}

function Missing() {
  return <span className="text-muted-foreground/60">n/a</span>
}

const DISPLAY_FEATURES = ["E-Ink Display", "Color Display", "OLED Display"]

type Column = {
  key: string
  label: string
  sortKey?: SortKey
  /** Direction used on the first click of this header. */
  firstDirection?: "asc" | "desc"
  center?: boolean
  className?: string
  render: (device: Device) => ReactNode
}

type ColumnGroup = { label: string; columns: Column[] }

const hasFeature = (device: Device, feature: string) => device.features.includes(feature)

const columnGroups: ColumnGroup[] = [
  {
    label: "Device",
    columns: [
      { key: "manufacturer", label: "Brand", sortKey: "manufacturer", render: (d) => d.manufacturer },
      { key: "category", label: "Category", render: (d) => d.category.join(", ") },
    ],
  },
  {
    label: "Connectivity",
    columns: [
      { key: "bluetooth", label: "Bluetooth", center: true, render: (d) => <YesNo value={hasFeature(d, "Bluetooth")} /> },
      { key: "wifi", label: "Wi-Fi", center: true, render: (d) => <YesNo value={hasFeature(d, "WiFi")} /> },
      { key: "gps", label: "GPS", center: true, render: (d) => <YesNo value={hasFeature(d, "GPS")} /> },
    ],
  },
  {
    label: "Display",
    columns: [
      {
        key: "display",
        label: "Type",
        render: (d) => {
          const displays = d.features.filter((f) => DISPLAY_FEATURES.includes(f)).map((f) => f.replace(" Display", ""))
          return displays.length > 0 ? displays.join(", ") : <Missing />
        },
      },
      { key: "touch", label: "Touch", center: true, render: (d) => <YesNo value={hasFeature(d, "Touchscreen")} /> },
      { key: "keyboard", label: "Keyboard", center: true, render: (d) => <YesNo value={hasFeature(d, "Keyboard")} /> },
    ],
  },
  {
    label: "Build",
    columns: [
      { key: "weatherproof", label: "Weatherproof", center: true, render: (d) => <YesNo value={hasFeature(d, "Weatherproof")} /> },
      { key: "antenna", label: "Antenna", className: "min-w-[12rem]", render: (d) => d.specifications.antenna || <Missing /> },
    ],
  },
  {
    label: "Power",
    columns: [
      { key: "battery-type", label: "Battery", render: (d) => d.specifications.battery.type || <Missing /> },
      {
        key: "battery-capacity",
        label: "Capacity",
        sortKey: "battery",
        firstDirection: "desc",
        className: "text-right tabular-nums",
        render: (d) => {
          const capacity = parseBatteryCapacity(d)
          return capacity !== undefined ? `${capacity.toLocaleString()} mAh` : <Missing />
        },
      },
      {
        key: "runtime",
        label: "Runtime",
        className: "min-w-[10rem]",
        render: (d) => d.specifications.battery.estimated_runtime || <Missing />,
      },
      { key: "consumption", label: "Consumption", render: (d) => d.specifications.power_consumption || <Missing /> },
      { key: "solar", label: "Solar", center: true, render: (d) => <YesNo value={hasFeature(d, "Solar")} /> },
      { key: "solar-input", label: "Solar In", center: true, render: (d) => <YesNo value={hasFeature(d, "Solar Input")} /> },
    ],
  },
  {
    label: "Radio",
    columns: [
      { key: "frequencies", label: "Frequencies", render: (d) => d.specifications.lora_frequencies.join(", ") },
      { key: "radio", label: "Chip", render: (d) => d.specifications.lora_radio || <Missing /> },
      {
        key: "tx",
        label: "TX Power",
        sortKey: "tx",
        firstDirection: "desc",
        className: "text-right tabular-nums",
        render: (d) =>
          d.specifications.max_tx_power_dbm !== undefined ? `${d.specifications.max_tx_power_dbm} dBm` : <Missing />,
      },
    ],
  },
  {
    label: "System",
    columns: [
      { key: "mcu", label: "MCU", render: (d) => d.specifications.microcontroller || <Missing /> },
      { key: "interfaces", label: "Interfaces", className: "min-w-[12rem]", render: (d) => d.specifications.interfaces.join(", ") },
    ],
  },
  {
    label: "Price",
    columns: [
      {
        key: "price",
        label: "USD",
        sortKey: "price",
        className: "text-right tabular-nums whitespace-nowrap font-medium",
        render: (d) => formatDevicePrice(d),
      },
    ],
  },
]

// The leading Device column is rendered separately: it is sticky on the left
// so the name stays visible while the wide table scrolls horizontally.
// The table is a raw <table> rather than the shadcn <Table>, whose wrapper adds
// a second overflow-auto div; sticky headers need a single scroll container.
const nameColumn: Column = { key: "name", label: "Device", sortKey: "name", render: (d) => d.name }

function SortIndicator({ column, sortOption }: { column: Column; sortOption: SortOption }) {
  const active = splitSortOption(sortOption)
  if (!column.sortKey) return null
  if (active?.key !== column.sortKey) {
    return <ArrowUpDown className="ml-1 inline h-3 w-3 opacity-40" aria-hidden="true" />
  }
  return active.direction === "asc" ? (
    <ArrowUp className="ml-1 inline h-3 w-3" aria-hidden="true" />
  ) : (
    <ArrowDown className="ml-1 inline h-3 w-3" aria-hidden="true" />
  )
}

// Group header row height; the column header row sits below it, so both
// can stay sticky while the body scrolls.
const GROUP_ROW = "h-8 top-0"
const COLUMN_ROW = "h-10 top-8"

export function DeviceTable({
  devices,
  sortOption,
  onSortChange,
  selectedForComparison,
  onToggleComparison,
}: {
  devices: Device[]
  sortOption: SortOption
  onSortChange: (option: SortOption) => void
  selectedForComparison: string[]
  onToggleComparison: (deviceId: string) => void
}) {
  const active = splitSortOption(sortOption)

  // Click cycles a sortable header: first direction -> other direction -> default.
  const handleSort = (column: Column) => {
    if (!column.sortKey) return
    const first = column.firstDirection ?? "asc"
    const second = first === "asc" ? "desc" : "asc"
    if (active?.key !== column.sortKey) onSortChange(`${column.sortKey}-${first}`)
    else if (active.direction === first) onSortChange(`${column.sortKey}-${second}`)
    else onSortChange("default")
  }

  const ariaSort = (column: Column): "ascending" | "descending" | "none" | undefined => {
    if (!column.sortKey) return undefined
    if (active?.key !== column.sortKey) return "none"
    return active.direction === "asc" ? "ascending" : "descending"
  }

  const headerButton = (column: Column) =>
    column.sortKey ? (
      <button
        type="button"
        onClick={() => handleSort(column)}
        className={cn("inline-flex items-center whitespace-nowrap hover:text-foreground", column.center && "justify-center")}
      >
        {column.label}
        <SortIndicator column={column} sortOption={sortOption} />
      </button>
    ) : (
      <span className="whitespace-nowrap">{column.label}</span>
    )

  return (
    <div className="rounded-lg border">
      <div className="max-h-[80vh] overflow-auto">
        <table className="w-full caption-bottom text-xs md:text-sm [&_td]:px-3 [&_td]:py-2 [&_th]:px-3">
          <TableHeader className="[&_tr]:border-b-0">
            <TableRow className="hover:bg-transparent">
              <TableHead
                rowSpan={2}
                scope="col"
                aria-sort={ariaSort(nameColumn)}
                className={cn("sticky left-0 z-30 border-b border-r bg-background", GROUP_ROW, "align-bottom pb-2")}
              >
                {headerButton(nameColumn)}
              </TableHead>
              {columnGroups.map((group) => (
                <TableHead
                  key={group.label}
                  colSpan={group.columns.length}
                  scope="colgroup"
                  className={cn(
                    "sticky z-20 border-b border-r bg-muted/60 text-center text-xs font-semibold uppercase tracking-wide",
                    GROUP_ROW,
                  )}
                >
                  {group.label}
                </TableHead>
              ))}
            </TableRow>
            <TableRow className="hover:bg-transparent">
              {columnGroups.flatMap((group) =>
                group.columns.map((column, index) => (
                  <TableHead
                    key={column.key}
                    scope="col"
                    aria-sort={ariaSort(column)}
                    className={cn(
                      "sticky z-20 border-b bg-background",
                      COLUMN_ROW,
                      column.center && "text-center",
                      column.className?.includes("text-right") && "text-right",
                      index === group.columns.length - 1 && "border-r",
                    )}
                  >
                    {headerButton(column)}
                  </TableHead>
                )),
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {devices.map((device) => (
              <TableRow key={device.id} className="group">
                <TableCell className="sticky left-0 z-10 max-w-[13rem] border-r bg-background group-hover:bg-muted/50 sm:max-w-none">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`table-compare-${device.id}`}
                      aria-label={`Compare ${device.name}`}
                      checked={selectedForComparison.includes(device.id)}
                      onCheckedChange={() => onToggleComparison(device.id)}
                    />
                    <Link href={`/mesh/devices/${device.id}`} className="flex items-center gap-2 hover:underline">
                      <span className="relative hidden h-8 w-8 shrink-0 overflow-hidden rounded sm:block">
                        <Image
                          src={device.image_url[0] || "/placeholder.svg"}
                          alt=""
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      </span>
                      <span className="font-medium sm:whitespace-nowrap">{device.name}</span>
                    </Link>
                    {device.discontinued && <DiscontinuedBadge className="shrink-0" />}
                  </div>
                </TableCell>
                {columnGroups.flatMap((group) =>
                  group.columns.map((column, index) => (
                    <TableCell
                      key={column.key}
                      className={cn(
                        column.center && "text-center",
                        column.className,
                        index === group.columns.length - 1 && "border-r",
                      )}
                    >
                      {column.render(device)}
                    </TableCell>
                  )),
                )}
              </TableRow>
            ))}
          </TableBody>
        </table>
      </div>
      <p className="border-t px-3 py-2 text-xs text-muted-foreground">
        {devices.length} {devices.length === 1 ? "device" : "devices"}. Check the boxes to compare. Missing a device?{" "}
        <ExternalLink
          href="https://github.com/austinmesh/rfindex/issues/new?template=add-device.yml"
          className="underline hover:text-foreground"
        >
          Suggest it
        </ExternalLink>
        .
      </p>
    </div>
  )
}
