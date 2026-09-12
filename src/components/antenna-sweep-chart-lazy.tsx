"use client"

import dynamic from "next/dynamic"

export type { AntennaSweepSeries } from "./antenna-sweep-chart"

// Recharts is heavy and effectively client-only (its ResponsiveContainer sizes
// itself from the DOM), so load the chart on demand with ssr:false. Antenna
// pages without an attached .s1p never render this, so they never fetch it.
export const AntennaSweepChart = dynamic(
  () => import("./antenna-sweep-chart").then((m) => m.AntennaSweepChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[340px] w-full animate-pulse rounded-lg border bg-muted/30" />
    ),
  },
)
