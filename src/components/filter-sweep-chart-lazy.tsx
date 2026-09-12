"use client"

import dynamic from "next/dynamic"

export type { FilterSweepTest } from "./filter-sweep-chart"

// Recharts is heavy and effectively client-only (its ResponsiveContainer sizes
// itself from the DOM), so load the chart on demand with ssr:false, matching
// the antenna sweep chart.
export const FilterSweepChart = dynamic(
  () => import("./filter-sweep-chart").then((m) => m.FilterSweepChart),
  {
    ssr: false,
    loading: () => (
      // Approximates the loaded layout: charts stacked on mobile, 50/50 on desktop.
      <div className="h-[780px] w-full animate-pulse rounded-lg border bg-muted/30 lg:h-[440px]" />
    ),
  },
)
