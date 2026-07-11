"use client"

import dynamic from "next/dynamic"

// Recharts is heavy and effectively client-only, so load the comparison chart on
// demand with ssr:false, matching the single-filter sweep chart.
export const FilterCompareChart = dynamic(
  () => import("./filter-compare-chart").then((m) => m.FilterCompareChart),
  {
    ssr: false,
    loading: () => <div className="h-[440px] w-full animate-pulse rounded-lg border bg-muted/30" />,
  },
)
