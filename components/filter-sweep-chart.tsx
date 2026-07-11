"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts"

import type { FilterSweep } from "@/types/filter"
import { cn } from "@/lib/utils"
import { SmithChart } from "@/components/smith-chart"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

// One test result (one physical unit) with its parsed sweeps.
export type FilterSweepTest = {
  id: string
  label: string
  sweeps: FilterSweep[]
}

// Explicit palette (no theme-var dependency) that reads on light and dark.
// Matches the antenna sweep chart.
const PALETTE = [
  "hsl(221 83% 53%)",
  "hsl(0 72% 51%)",
  "hsl(142 71% 45%)",
  "hsl(35 92% 50%)",
  "hsl(280 65% 60%)",
  "hsl(190 90% 42%)",
]

// Series within one range tab share a frequency grid, but resample anyway so
// two units measured with slightly different spans still overlay cleanly.
const GRID_POINTS = 300

// Default operating frequencies (MHz) marked as vertical guides, so a curve
// can be read against where each firmware actually transmits. Keep in sync
// with the antenna chart and the prebuild's FILTER_MARKER_FREQS.
const FREQ_MARKERS: { mhz: number; label: string }[] = [
  { mhz: 906.875, label: "Meshtastic" },
  { mhz: 910.525, label: "MeshCore" },
]

type DbKey = "s21_db" | "return_loss_db"

function interpAt(points: FilterSweep["points"], targetHz: number, key: DbKey): number | null {
  const first = points[0]
  const last = points[points.length - 1]
  if (targetHz < first.frequency_hz || targetHz > last.frequency_hz) return null
  for (let i = 1; i < points.length; i++) {
    if (points[i].frequency_hz >= targetHz) {
      const p0 = points[i - 1]
      const p1 = points[i]
      const span = p1.frequency_hz - p0.frequency_hz || 1
      const t = (targetHz - p0.frequency_hz) / span
      return p0[key] + t * (p1[key] - p0[key])
    }
  }
  return last[key]
}

// A sweep's range identity, e.g. "902-928". Rounded to whole MHz so the same
// instrument preset measured on two units always lands in the same tab. Must
// match the prebuild's sweepRangeKey, which computes each filter's
// default_range in the same format.
function rangeKey(s: FilterSweep): string {
  return `${Math.round(s.start_hz / 1e6)}-${Math.round(s.stop_hz / 1e6)}`
}

export function FilterSweepChart({
  tests,
  defaultRange,
}: {
  tests: FilterSweepTest[]
  defaultRange?: string
}) {
  const withSweeps = React.useMemo(
    () => tests.filter((t) => t.sweeps.some((s) => s.points.length >= 2)),
    [tests],
  )

  // Range tabs, narrowest span first: the tabs read left-to-right as zooming
  // out, from in-band detail to the wideband rejection story.
  const ranges = React.useMemo(() => {
    const seen = new Map<string, number>()
    for (const t of withSweeps) {
      for (const s of t.sweeps) {
        if (s.points.length < 2) continue
        const key = rangeKey(s)
        const span = s.stop_hz - s.start_hz
        if (!seen.has(key)) seen.set(key, span)
      }
    }
    return [...seen.entries()].sort((a, b) => a[1] - b[1]).map(([key]) => key)
  }, [withSweeps])

  const [activeRange, setActiveRange] = React.useState<string | null>(null)
  const [hidden, setHidden] = React.useState<Set<string>>(new Set())

  // Until the user picks a tab, open on the filter's own default range (the
  // custom mid sweep chosen around its passband, computed by the prebuild).
  const range =
    activeRange && ranges.includes(activeRange)
      ? activeRange
      : defaultRange && ranges.includes(defaultRange)
        ? defaultRange
        : ranges[0]

  // Series for the active range: one unit per test that measured it.
  const resolved = React.useMemo(
    () =>
      withSweeps
        .map((t, i) => {
          const sweep = t.sweeps.find((s) => s.points.length >= 2 && rangeKey(s) === range)
          return sweep
            ? {
                id: t.id,
                label: t.label,
                points: sweep.points,
                z0: sweep.reference_impedance,
                color: PALETTE[i % PALETTE.length],
              }
            : null
        })
        .filter((s): s is NonNullable<typeof s> => s !== null),
    [withSweeps, range],
  )

  // Two lines per unit (S21 through, S11 match), same color, solid vs dashed.
  const config = React.useMemo<ChartConfig>(() => {
    const c: ChartConfig = {}
    for (const s of resolved) {
      c[`${s.id}_s21`] = { label: `${s.label} S21`, color: s.color }
      c[`${s.id}_s11`] = { label: `${s.label} S11`, color: s.color }
    }
    return c
  }, [resolved])

  const visible = React.useMemo(
    () => resolved.filter((s) => !hidden.has(s.id)),
    [resolved, hidden],
  )

  const { rows, domainX, domainY } = React.useMemo(() => {
    if (!resolved.length) {
      return {
        rows: [] as Record<string, number | null>[],
        domainX: [0, 1] as [number, number],
        domainY: [0, 1] as [number, number],
      }
    }
    let minHz = Infinity
    let maxHz = -Infinity
    for (const s of resolved) {
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
        const s21 = interpAt(s.points, hz, "s21_db")
        // Return loss is stored positive; plot as raw S11 dB so both curves
        // share one axis and read like a VNA screen (0 dB at the top).
        const rl = interpAt(s.points, hz, "return_loss_db")
        const s11 = rl == null ? null : -rl
        row[`${s.id}_s21`] = s21 == null ? null : Math.round(s21 * 1000) / 1000
        row[`${s.id}_s11`] = s11 == null ? null : Math.round(s11 * 1000) / 1000
        for (const v of [s21, s11]) {
          if (v == null) continue
          minVal = Math.min(minVal, v)
          maxVal = Math.max(maxVal, v)
        }
      }
      out.push(row)
    }
    const dx: [number, number] = [Math.floor(minHz / 1e6), Math.ceil(maxHz / 1e6)]
    // 0 dB at the top unless calibration slop pushes S21 slightly positive.
    const dy: [number, number] = [Math.floor(Math.min(minVal, -1)) - 1, Math.ceil(Math.max(maxVal, 0))]
    return { rows: out, domainX: dx, domainY: dy }
  }, [resolved, visible])

  if (!resolved.length) return null

  function toggle(id: string) {
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      // Never allow hiding every series.
      if (next.size >= resolved.length) return prev
      return next
    })
  }

  const mutedStroke = "hsl(var(--muted-foreground))"

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-muted-foreground">Measured response</h3>
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

      {/* Loss curves and Smith chart side by side on desktop, stacked on mobile */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h4 className="mb-2 text-center text-xs font-medium text-muted-foreground">
            Insertion loss (S21, solid) and return loss (S11, dashed)
          </h4>
          <ChartContainer config={config} className="aspect-auto h-[340px] w-full">
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
                  key={`${s.id}_s21`}
                  dataKey={`${s.id}_s21`}
                  type="monotone"
                  stroke={s.color}
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              ))}
              {visible.map((s) => (
                <Line
                  key={`${s.id}_s11`}
                  dataKey={`${s.id}_s11`}
                  type="monotone"
                  stroke={s.color}
                  strokeWidth={1.5}
                  strokeDasharray="5 3"
                  strokeOpacity={0.75}
                  dot={false}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ChartContainer>
          <p className="mt-1 text-center text-xs text-muted-foreground">Frequency (MHz), dB</p>
        </div>

        <div>
          <h4 className="mb-2 text-center text-xs font-medium text-muted-foreground">
            Impedance match (S11 Smith chart)
          </h4>
          <SmithChart
            traces={visible.map((s) => ({
              id: s.id,
              label: s.label,
              color: s.color,
              z0: s.z0,
              points: s.points,
            }))}
            markers={FREQ_MARKERS}
          />
        </div>
      </div>

      {resolved.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {resolved.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => toggle(s.id)}
              aria-pressed={!hidden.has(s.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                hidden.has(s.id) ? "opacity-40" : "hover:bg-muted",
              )}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
