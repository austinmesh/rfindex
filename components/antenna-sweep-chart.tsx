"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, ReferenceArea, ReferenceLine, XAxis, YAxis } from "recharts"

import type { AntennaSweepPoint } from "@/types/antenna"
import { cn } from "@/lib/utils"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export type AntennaSweepSeries = {
  id: string
  label: string
  points: AntennaSweepPoint[]
}

type Metric = "vswr" | "return_loss_db"

// Explicit palette (no theme-var dependency) that reads on light and dark.
const PALETTE = [
  "hsl(221 83% 53%)",
  "hsl(0 72% 51%)",
  "hsl(142 71% 45%)",
  "hsl(35 92% 50%)",
  "hsl(280 65% 60%)",
  "hsl(190 90% 42%)",
]

// Sweeps may have different frequency grids, so resample every series onto one
// shared grid and let each Line render its own values (null outside its range).
const GRID_POINTS = 300

// Default operating frequencies (MHz) marked as vertical guides on every sweep,
// so a curve can be read against where each firmware actually transmits.
const FREQ_MARKERS: { mhz: number; label: string }[] = [
  { mhz: 906.875, label: "Meshtastic US Default" },
  { mhz: 910.525, label: "MeshCore US Default" },
]

// VSWR quality bands: green (great) -> red (poor). Rendered as translucent
// background areas so the sweep lines still read clearly on top.
const VSWR_BANDS: { from: number; to: number; color: string }[] = [
  { from: 1, to: 1.5, color: "hsl(142 71% 45%)" }, // green
  { from: 1.5, to: 2, color: "hsl(48 96% 53%)" }, // yellow
  { from: 2, to: 2.5, color: "hsl(28 92% 52%)" }, // orange
  { from: 2.5, to: Infinity, color: "hsl(0 72% 51%)" }, // red
]

function interpAt(points: AntennaSweepPoint[], targetHz: number, key: Metric): number | null {
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

export function AntennaSweepChart({ series }: { series: AntennaSweepSeries[] }) {
  const [hidden, setHidden] = React.useState<Set<string>>(new Set())
  const [metric, setMetric] = React.useState<Metric>("vswr")

  const resolved = React.useMemo(
    () =>
      series
        .filter((s) => s.points && s.points.length >= 2)
        .map((s, i) => ({ ...s, color: PALETTE[i % PALETTE.length] })),
    [series],
  )

  const config = React.useMemo<ChartConfig>(() => {
    const c: ChartConfig = {}
    for (const s of resolved) c[s.id] = { label: s.label, color: s.color }
    return c
  }, [resolved])

  const visible = React.useMemo(
    () => resolved.filter((s) => !hidden.has(s.id)),
    [resolved, hidden],
  )

  const { rows, domainX, domainY } = React.useMemo(() => {
    if (!resolved.length) {
      return { rows: [] as Record<string, number | null>[], domainX: [0, 1] as [number, number], domainY: [0, 1] as [number, number] }
    }
    // X domain spans all series so the axis stays stable as tests are toggled.
    let minHz = Infinity
    let maxHz = -Infinity
    for (const s of resolved) {
      minHz = Math.min(minHz, s.points[0].frequency_hz)
      maxHz = Math.max(maxHz, s.points[s.points.length - 1].frequency_hz)
    }
    const out: Record<string, number | null>[] = []
    let maxVal = 0
    for (let i = 0; i < GRID_POINTS; i++) {
      const hz = minHz + ((maxHz - minHz) * i) / (GRID_POINTS - 1)
      const row: Record<string, number | null> = { freq: Math.round((hz / 1e6) * 100) / 100 }
      for (const s of visible) {
        const v = interpAt(s.points, hz, metric)
        row[s.id] = v == null ? null : Math.round(v * 1000) / 1000
        if (v != null) maxVal = Math.max(maxVal, v)
      }
      out.push(row)
    }
    const dx: [number, number] = [Math.floor(minHz / 1e6), Math.ceil(maxHz / 1e6)]
    const dy: [number, number] =
      metric === "vswr"
        ? [1, Math.min(6, Math.max(2, Math.ceil(maxVal)))]
        : [0, Math.max(5, Math.ceil(maxVal))]
    return { rows: out, domainX: dx, domainY: dy }
  }, [resolved, visible, metric])

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
        <h3 className="text-sm font-medium text-muted-foreground">
          {metric === "vswr" ? "VSWR" : "Return loss"} vs frequency
        </h3>
        <div className="flex gap-1 rounded-md border p-0.5">
          {(["vswr", "return_loss_db"] as Metric[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMetric(m)}
              className={cn(
                "rounded px-2 py-1 text-xs font-medium transition-colors",
                metric === m
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m === "vswr" ? "VSWR" : "Return loss"}
            </button>
          ))}
        </div>
      </div>

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
            width={38}
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
          {metric === "vswr" &&
            VSWR_BANDS.map((b) => (
              <ReferenceArea
                key={b.from}
                y1={Math.max(b.from, domainY[0])}
                y2={Math.min(b.to, domainY[1])}
                fill={b.color}
                fillOpacity={0.14}
                ifOverflow="hidden"
                stroke="none"
              />
            ))}
          {metric === "vswr" && (
            <ReferenceLine
              y={2}
              stroke={mutedStroke}
              strokeDasharray="4 4"
              strokeOpacity={0.7}
              label={{ value: "2:1", position: "insideTopRight", fill: mutedStroke, fontSize: 10 }}
            />
          )}
          {metric === "return_loss_db" && (
            <ReferenceLine
              y={10}
              stroke={mutedStroke}
              strokeDasharray="4 4"
              strokeOpacity={0.6}
              label={{ value: "10 dB", position: "insideTopRight", fill: mutedStroke, fontSize: 10 }}
            />
          )}
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

      <p className="mt-1 text-center text-xs text-muted-foreground">Frequency (MHz)</p>

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
