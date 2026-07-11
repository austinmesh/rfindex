"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts"

import type { FilterSweep, RfFilter } from "@/types/filter"
import { cn } from "@/lib/utils"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

// One color per compared filter (not per unit): the comparison reads by device,
// so every touchstone of the same filter shares its color. Matches the single-
// filter sweep chart palette so colors feel consistent across the site.
const PALETTE = [
  "hsl(221 83% 53%)",
  "hsl(0 72% 51%)",
  "hsl(142 71% 45%)",
  "hsl(35 92% 50%)",
  "hsl(280 65% 60%)",
  "hsl(190 90% 42%)",
]

const GRID_POINTS = 300

// Vertical guides at each firmware's operating frequency. Keep in sync with the
// single-filter sweep chart's FREQ_MARKERS.
const FREQ_MARKERS: { mhz: number; label: string }[] = [
  { mhz: 906.875, label: "Meshtastic" },
  { mhz: 910.525, label: "MeshCore" },
]

function interpS21(points: FilterSweep["points"], targetHz: number): number | null {
  const first = points[0]
  const last = points[points.length - 1]
  if (targetHz < first.frequency_hz || targetHz > last.frequency_hz) return null
  for (let i = 1; i < points.length; i++) {
    if (points[i].frequency_hz >= targetHz) {
      const p0 = points[i - 1]
      const p1 = points[i]
      const span = p1.frequency_hz - p0.frequency_hz || 1
      const t = (targetHz - p0.frequency_hz) / span
      return p0.s21_db + t * (p1.s21_db - p0.s21_db)
    }
  }
  return last.s21_db
}

// A sweep's range identity, e.g. "902-928". Rounded to whole MHz so the same
// instrument preset on different filters lands in the same tab. Matches the
// single-filter chart's rangeKey.
function rangeKey(s: FilterSweep): string {
  return `${Math.round(s.start_hz / 1e6)}-${Math.round(s.stop_hz / 1e6)}`
}

// One drawable curve: a single touchstone sweep belonging to one filter.
type Series = {
  id: string
  filterSlug: string
  label: string
  color: string
  points: FilterSweep["points"]
}

// Flatten each filter to its color and all of its parsed sweeps (across every
// test unit). Colors are assigned by filter position so a filter keeps one color
// no matter how many touchstones it contributes.
function collectFilters(filters: RfFilter[]) {
  return filters.map((f, i) => {
    const sweeps: FilterSweep[] = []
    for (const t of f.test_results) {
      for (const s of t.sweeps ?? []) {
        if (s.points.length >= 2) sweeps.push(s)
      }
    }
    return { slug: f.slug, title: f.title, color: PALETTE[i % PALETTE.length], sweeps }
  })
}

export function FilterCompareChart({ filters }: { filters: RfFilter[] }) {
  const collected = React.useMemo(() => collectFilters(filters), [filters])

  const withSweeps = React.useMemo(() => collected.filter((c) => c.sweeps.length > 0), [collected])

  // Range tabs, narrowest span first (in-band detail to wideband rejection),
  // unioned across every compared filter.
  const ranges = React.useMemo(() => {
    const seen = new Map<string, number>()
    for (const c of withSweeps) {
      for (const s of c.sweeps) {
        const key = rangeKey(s)
        if (!seen.has(key)) seen.set(key, s.stop_hz - s.start_hz)
      }
    }
    return [...seen.entries()].sort((a, b) => a[1] - b[1]).map(([key]) => key)
  }, [withSweeps])

  const [activeRange, setActiveRange] = React.useState<string | null>(null)
  const [hidden, setHidden] = React.useState<Set<string>>(new Set())

  const range = activeRange && ranges.includes(activeRange) ? activeRange : ranges[0]

  // Series for the active range: every touchstone (across all units) each filter
  // measured over that span. All of one filter's curves share its color.
  const series = React.useMemo<Series[]>(() => {
    const out: Series[] = []
    for (const c of withSweeps) {
      const matching = c.sweeps.filter((s) => rangeKey(s) === range)
      matching.forEach((s, i) => {
        out.push({
          id: `${c.slug}-${i}`,
          filterSlug: c.slug,
          label: c.title,
          color: c.color,
          points: s.points,
        })
      })
    }
    return out
  }, [withSweeps, range])

  const config = React.useMemo<ChartConfig>(() => {
    const c: ChartConfig = {}
    for (const s of series) c[s.id] = { label: s.label, color: s.color }
    return c
  }, [series])

  const visible = React.useMemo(
    () => series.filter((s) => !hidden.has(s.filterSlug)),
    [series, hidden],
  )

  const { rows, domainX, domainY } = React.useMemo(() => {
    if (!series.length) {
      return {
        rows: [] as Record<string, number | null>[],
        domainX: [0, 1] as [number, number],
        domainY: [0, 1] as [number, number],
      }
    }
    let minHz = Infinity
    let maxHz = -Infinity
    for (const s of series) {
      minHz = Math.min(minHz, s.points[0].frequency_hz)
      maxHz = Math.max(maxHz, s.points[s.points.length - 1].frequency_hz)
    }
    const out: Record<string, number | null>[] = []
    let minVal = Infinity
    let maxVal = -Infinity
    for (let i = 0; i < GRID_POINTS; i++) {
      const hz = minHz + ((maxHz - minHz) * i) / (GRID_POINTS - 1)
      const row: Record<string, number | null> = { freq: Math.round((hz / 1e6) * 100) / 100 }
      for (const s of visible) {
        const v = interpS21(s.points, hz)
        row[s.id] = v == null ? null : Math.round(v * 1000) / 1000
        if (v != null) {
          minVal = Math.min(minVal, v)
          maxVal = Math.max(maxVal, v)
        }
      }
      out.push(row)
    }
    const dx: [number, number] = [Math.floor(minHz / 1e6), Math.ceil(maxHz / 1e6)]
    const dy: [number, number] = [Math.floor(Math.min(minVal, -1)) - 1, Math.ceil(Math.max(maxVal, 0))]
    return { rows: out, domainX: dx, domainY: dy }
  }, [series, visible])

  if (!withSweeps.length) {
    return (
      <p className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
        None of the selected filters have measured sweeps to chart.
      </p>
    )
  }

  // Toggle a whole filter (all of its touchstones) on/off, never allowing every
  // filter to be hidden at once.
  function toggle(slug: string) {
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      if (next.size >= withSweeps.length) return prev
      return next
    })
  }

  const mutedStroke = "hsl(var(--muted-foreground))"

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-muted-foreground">Insertion loss (S21)</h3>
        {ranges.length > 1 && (
          <div className="flex gap-1 rounded-md border p-0.5">
            {ranges.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setActiveRange(r)}
                className={cn(
                  "rounded px-2 py-1 text-xs font-medium transition-colors",
                  range === r
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r} MHz
              </button>
            ))}
          </div>
        )}
      </div>

      <ChartContainer config={config} className="aspect-auto h-[360px] w-full">
        <LineChart data={rows} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="freq"
            type="number"
            domain={domainX}
            tickCount={7}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(v) => `${Math.round(v)}`}
          />
          <YAxis
            domain={domainY}
            allowDataOverflow
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            width={42}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_value, payload) => {
                  const freq = payload?.[0]?.payload?.freq
                  return freq == null ? "" : `${freq} MHz`
                }}
              />
            }
          />
          <ReferenceLine
            y={0}
            stroke={mutedStroke}
            strokeDasharray="4 4"
            strokeOpacity={0.6}
            label={{ value: "0 dB", position: "insideTopRight", fill: mutedStroke, fontSize: 10 }}
          />
          {FREQ_MARKERS.map((m, i) => (
            <ReferenceLine
              key={m.label}
              x={m.mhz}
              stroke={mutedStroke}
              strokeDasharray="2 2"
              strokeOpacity={0.7}
              ifOverflow="hidden"
              label={{
                value: m.label,
                position: "insideTopLeft",
                fill: mutedStroke,
                fontSize: 10,
                dy: i * 12,
              }}
            />
          ))}
          {visible.map((s) => (
            <Line
              key={s.id}
              dataKey={s.id}
              type="monotone"
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ChartContainer>
      <p className="mt-1 text-center text-xs text-muted-foreground">Frequency (MHz), loss in dB</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {withSweeps.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => toggle(c.slug)}
            aria-pressed={!hidden.has(c.slug)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
              hidden.has(c.slug) ? "opacity-40" : "hover:bg-muted",
            )}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
            {c.title}
          </button>
        ))}
      </div>
    </div>
  )
}
