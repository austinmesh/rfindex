"use client"

import * as React from "react"

import type { FilterSweepPoint } from "@/types/filter"

// One S11 locus to draw: a unit's sweep over the active range.
export type SmithTrace = {
  id: string
  label: string
  color: string
  z0: number
  points: FilterSweepPoint[]
}

// Operating frequencies marked on each trace. Shape (filled vs hollow dot)
// distinguishes the frequency; color stays the unit's trace color.
type SmithMarker = { mhz: number; label: string }

// Classic Smith chart grid values (normalized impedance).
const R_CIRCLES = [0.2, 0.5, 1, 2, 5]
const X_ARCS = [0.2, 0.5, 1, 2, 5]

// Half-width of the square viewBox; > 1 leaves room for the rim labels.
const EXTENT = 1.18

const GRID = "hsl(var(--muted-foreground) / 0.25)"
const GRID_STRONG = "hsl(var(--muted-foreground) / 0.5)"
const LABEL = "hsl(var(--muted-foreground))"

// Where the constant-reactance arc for x meets the unit circle, in Γ coords.
const rimPoint = (x: number) => ({
  re: (x * x - 1) / (x * x + 1),
  im: (2 * x) / (x * x + 1),
})

// Γ at a target frequency, linearly interpolated on the complex value.
function gammaAt(points: FilterSweepPoint[], hz: number): { re: number; im: number } | null {
  if (!points.length || hz < points[0].frequency_hz || hz > points[points.length - 1].frequency_hz) return null
  for (let i = 1; i < points.length; i++) {
    if (points[i].frequency_hz >= hz) {
      const a = points[i - 1]
      const b = points[i]
      const t = (hz - a.frequency_hz) / (b.frequency_hz - a.frequency_hz || 1)
      return { re: a.s11_re + t * (b.s11_re - a.s11_re), im: a.s11_im + t * (b.s11_im - a.s11_im) }
    }
  }
  return null
}

// Z = z0 (1+Γ)/(1−Γ)
function impedanceOf(re: number, im: number, z0: number): { r: number; x: number } {
  const denom = (1 - re) * (1 - re) + im * im || 1e-12
  return {
    r: (z0 * (1 - re * re - im * im)) / denom,
    x: (z0 * 2 * im) / denom,
  }
}

const formatOhms = (z: { r: number; x: number }) =>
  `${z.r.toFixed(1)} ${z.x >= 0 ? "+" : "-"} j${Math.abs(z.x).toFixed(1)} Ω`

export function SmithChart({ traces, markers }: { traces: SmithTrace[]; markers: SmithMarker[] }) {
  const clipId = React.useId()
  const svgRef = React.useRef<SVGSVGElement>(null)
  const [hover, setHover] = React.useState<{ t: number; i: number } | null>(null)

  // A range-tab switch swaps the traces; a latched point index would then
  // reference the wrong sweep.
  React.useEffect(() => setHover(null), [traces])

  // Cal slop can push stopband |S11| a hair past 1; everything measured is
  // clipped to the unit disc so traces never spill into the label rim.
  const clip = `url(#${clipId})`

  function handlePointer(e: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    const gx = ((e.clientX - rect.left) / rect.width) * 2 * EXTENT - EXTENT
    const gy = ((e.clientY - rect.top) / rect.height) * 2 * EXTENT - EXTENT
    let best: { t: number; i: number; d: number } | null = null
    for (let t = 0; t < traces.length; t++) {
      const points = traces[t].points
      for (let i = 0; i < points.length; i++) {
        const dx = points[i].s11_re - gx
        const dy = -points[i].s11_im - gy
        const d = dx * dx + dy * dy
        if (!best || d < best.d) best = { t, i, d }
      }
    }
    // Only latch onto a point when the pointer is actually near the locus.
    if (best && best.d <= 0.12 * 0.12) setHover({ t: best.t, i: best.i })
    else setHover(null)
  }

  const hovered = hover ? { trace: traces[hover.t], point: traces[hover.t]?.points[hover.i] } : null
  const z0 = traces[0]?.z0 ?? 50

  return (
    <div>
      <svg
        ref={svgRef}
        viewBox={`${-EXTENT} ${-EXTENT} ${2 * EXTENT} ${2 * EXTENT}`}
        className="mx-auto block aspect-square h-[300px] max-w-full sm:h-[340px]"
        role="img"
        aria-label="Smith chart of measured S11"
        onPointerMove={handlePointer}
        onPointerDown={handlePointer}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <clipPath id={clipId}>
            <circle cx={0} cy={0} r={1} />
          </clipPath>
        </defs>

        {/* Grid: unit circle, real axis, constant-R circles, constant-X arcs */}
        <circle cx={0} cy={0} r={1} fill="none" stroke={GRID_STRONG} strokeWidth={1} vectorEffect="non-scaling-stroke" />
        <line x1={-1} y1={0} x2={1} y2={0} stroke={GRID} strokeWidth={1} vectorEffect="non-scaling-stroke" />
        {R_CIRCLES.map((r) => (
          <circle
            key={`r-${r}`}
            cx={r / (r + 1)}
            cy={0}
            r={1 / (r + 1)}
            fill="none"
            stroke={GRID}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <g clipPath={clip}>
          {X_ARCS.flatMap((x) => [x, -x]).map((x) => (
            <circle
              key={`x-${x}`}
              cx={1}
              cy={-1 / x}
              r={1 / Math.abs(x)}
              fill="none"
              stroke={GRID}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>

        {/* Normalized resistance labels along the real axis, 0 and ∞ at the rim */}
        {R_CIRCLES.map((r) => (
          <text
            key={`rl-${r}`}
            x={(r - 1) / (r + 1)}
            y={0.085}
            fontSize={0.07}
            fill={LABEL}
            textAnchor="middle"
          >
            {r}
          </text>
        ))}
        <text x={-1.08} y={0.025} fontSize={0.07} fill={LABEL} textAnchor="middle">
          0
        </text>
        <text x={1.09} y={0.025} fontSize={0.08} fill={LABEL} textAnchor="middle">
          ∞
        </text>
        {/* Normalized reactance labels just outside the rim */}
        {X_ARCS.flatMap((x) => [x, -x]).map((x) => {
          const p = rimPoint(x)
          return (
            <text
              key={`xl-${x}`}
              x={p.re * 1.1}
              y={-p.im * 1.1 + 0.025}
              fontSize={0.07}
              fill={LABEL}
              textAnchor="middle"
            >
              {x > 0 ? `j${x}` : `-j${Math.abs(x)}`}
            </text>
          )
        })}

        {/* S11 loci, one per unit */}
        <g clipPath={clip}>
          {traces.map((trace) => (
            <path
              key={trace.id}
              d={trace.points
                .map((p, i) => `${i === 0 ? "M" : "L"}${p.s11_re.toFixed(4)} ${(-p.s11_im).toFixed(4)}`)
                .join("")}
              fill="none"
              stroke={trace.color}
              strokeWidth={1.75}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* Operating-frequency dots: filled = first marker, hollow = second */}
          {traces.flatMap((trace) =>
            markers.map((m, mi) => {
              const g = gammaAt(trace.points, m.mhz * 1e6)
              if (!g) return null
              return (
                <circle
                  key={`${trace.id}-${m.label}`}
                  cx={g.re}
                  cy={-g.im}
                  r={0.028}
                  fill={mi === 0 ? trace.color : "hsl(var(--background))"}
                  stroke={mi === 0 ? "hsl(var(--background))" : trace.color}
                  strokeWidth={1.25}
                  vectorEffect="non-scaling-stroke"
                >
                  <title>{`${trace.label}: ${m.label} ${m.mhz} MHz`}</title>
                </circle>
              )
            }),
          )}

          {hovered?.point && (
            <circle
              cx={hovered.point.s11_re}
              cy={-hovered.point.s11_im}
              r={0.045}
              fill="none"
              stroke={hovered.trace.color}
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
            />
          )}
        </g>
      </svg>

      {/* Fixed-height readout so hovering never shifts the layout */}
      <p className="mt-1 min-h-5 text-center text-xs text-muted-foreground">
        {hovered?.point ? (
          <>
            <span className="font-medium text-foreground">{hovered.trace.label}</span>
            {" · "}
            {(hovered.point.frequency_hz / 1e6).toFixed(1)} MHz
            {" · "}
            {formatOhms(impedanceOf(hovered.point.s11_re, hovered.point.s11_im, hovered.trace.z0))}
            {" · "}
            RL {hovered.point.return_loss_db.toFixed(1)} dB
          </>
        ) : (
          "Hover or tap a trace to read impedance"
        )}
      </p>
      <p className="mt-0.5 text-center text-xs text-muted-foreground">
        {markers.map((m, mi) => (
          <span key={m.label}>
            {mi > 0 && " · "}
            <span aria-hidden="true">{mi === 0 ? "●" : "○"}</span> {m.label} {m.mhz} MHz
          </span>
        ))}
        {` · normalized to ${z0} Ω`}
      </p>
    </div>
  )
}
