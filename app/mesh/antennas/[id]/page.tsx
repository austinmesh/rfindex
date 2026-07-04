import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ExternalLink, ShoppingCart, ThumbsUp, ThumbsDown, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

import { antennas } from "@/lib/data"
import { Separator } from "@/components/ui/separator"
import { AntennaSweepChart, type AntennaSweepSeries } from "@/components/antenna-sweep-chart-lazy"
import type { AntennaTestResult, AntennaTestSample } from "@/types/antenna"
import { JsonLd } from "@/components/json-ld"
import { antennaJsonLd, antennaMetaDescription, antennaTestingSummary, bestVswrAt915, brandedTitle } from "@/lib/seo"

// Add this helper function near the top of the file, before the component
function displayFrequency(freqSpec: string | string[]) {
  if (Array.isArray(freqSpec)) {
    return freqSpec.join(", ")
  }
  return freqSpec
}

// Values of `ground_plane` that mean "no ground plane was used"; anything else
// (e.g. "present", or a size like "100mm") is treated as a ground plane.
const NO_GROUND_PLANE = new Set(["", "none", "no", "false", "absent"])

// Short label for a sweep series in the comparison chart: the position/config
// distinguishes configurations, the callsign/handle distinguishes testers. Two
// tests can share a position but differ by ground plane (e.g. straight with and
// without one), so fold a ground-plane note into the label to keep them apart.
function sweepSeriesLabel(t: AntennaTestResult, i: number) {
  // An explicit chart_label always wins, for cases the derived label can't tell apart.
  if (t.chart_label?.trim()) return t.chart_label.trim()
  const cfg = t.configuration
  const gp = cfg?.ground_plane?.trim().toLowerCase()
  const hasGroundPlane = gp != null && !NO_GROUND_PLANE.has(gp)
  const base = cfg?.position || cfg?.ground_plane || `Test ${i + 1}`
  const withConfig = hasGroundPlane ? `${base} + ground plane` : base
  const who = t.metadata.callsign || t.metadata.handle || null
  return who ? `${withConfig} (${who})` : withConfig
}

// One-line provenance for the physical unit tested, omitting absent fields.
function sampleSummary(s: AntennaTestSample) {
  const parts: string[] = []
  if (s.sample_id) parts.push(`Sample ${s.sample_id}`)
  if (s.batch) parts.push(`Batch ${s.batch}`)
  if (s.supplier) parts.push(`from ${s.supplier}`)
  if (s.purchase_date) parts.push(`purchased ${s.purchase_date}`)
  return parts.join(", ")
}

// Generate static params for all antenna IDs
export function generateStaticParams() {
  return antennas.map((antenna, index) => ({
    id: antenna.slug,
  }))
}

// Unknown slugs return a real HTTP 404 instead of a 200 soft-404. This relies
// on the static-assets incremental cache in open-next.config.ts: fallback:false
// forbids on-demand rendering, so without that cache the Worker would 404
// every detail page.
export const dynamicParams = false

// Generate metadata for each antenna page
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const antenna = antennas.find((a) => a.slug === id)

  if (!antenna) notFound()

  const url = `https://www.rfindex.com/mesh/antennas/${id}`
  const description = antenna.description || antennaMetaDescription(antenna)
  const ogTitle = antenna.test_results.length
    ? `${antenna.title} VSWR Test Results`
    : `${antenna.title} | Mesh Antenna`
  const images = antenna.image
    ? [{ url: antenna.image, alt: brandedTitle(antenna) }]
    : undefined

  return {
    title: `${antenna.title} | Mesh Antennas | RF Index`,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      url,
      title: ogTitle,
      description,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      ...(images ? { images: images.map((i) => i.url) } : {}),
    },
  }
}

export default async function AntennaDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const antenna = antennas.find((a) => a.slug === id)

  if (!antenna) notFound()

  const testingSummary = antennaTestingSummary(antenna)

  // Helper function to get the price range for an antenna
  const getAntennaPrice = () => {
    const prices = antenna.suppliers
      .map((supplier) => Number.parseFloat(supplier.purchase_cost.replace(/[^0-9.]/g, "")))
      .filter((price) => !isNaN(price))

    if (prices.length === 0) return { min: 0, max: 0 }

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    }
  }

  // Helper function to format price display
  const formatPriceDisplay = () => {
    const { min, max } = getAntennaPrice()

    if (min === max) {
      return `$${min.toFixed(2)}`
    }

    return `$${min.toFixed(2)} - $${max.toFixed(2)}`
  }

  // Helper function to render status badge
  const renderStatusBadge = (suggested?: boolean) => {
    if (suggested === undefined) return null

    return suggested ? (
      <Badge>
        <ThumbsUp className="h-3 w-3 mr-1" /> Suggested
      </Badge>
    ) : (
      <Badge variant="destructive">
        <ThumbsDown className="h-3 w-3 mr-1" /> Not Suggested
      </Badge>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <JsonLd data={antennaJsonLd(antenna)} />
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Back button */}
          <Button variant="ghost" className="mb-6" asChild>
            <Link href="/mesh/antennas">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Antennas
            </Link>
          </Button>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Antenna Image */}
            <div className="bg-white rounded-lg overflow-hidden border">
              <div className="relative aspect-square">
                <Image
                  src={
                    antenna.image || `/placeholder.svg?height=400&width=400&text=${antenna.manufacturer.part_number}`
                  }
                  alt={antenna.title}
                  fill
                  className="object-contain p-4"
                />
                <div className="absolute top-2 right-2">{renderStatusBadge(antenna.suggested)}</div>
              </div>
            </div>

            {/* Antenna Info and Purchase CTAs */}
            <div className="flex flex-col">
              <div>
                <h1 className="text-3xl font-bold">{antenna.title}</h1>
                <p className="text-lg text-muted-foreground mb-2">
                  {antenna.manufacturer.brand_name} | Part: {antenna.manufacturer.part_number}
                </p>
                <div className="flex items-center mb-4">
                  <span className="text-2xl font-bold">{formatPriceDisplay()}</span>
                  <span className="ml-2 text-muted-foreground">USD</span>
                </div>
                <p className="mb-4">{antenna.description || "No description available"}</p>
              </div>

              {/* Austin Mesh community commentary */}
              {antenna.commentary && (
                <div className="mb-6 rounded-lg border bg-muted/30 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Image
                      src="/Austin-Mesh-Logo-Lockup.svg"
                      alt="Austin Mesh"
                      width={313}
                      height={295}
                      className="h-8 w-auto"
                    />
                    <h2 className="text-lg font-semibold">Comments from the Austin Mesh Community</h2>
                  </div>
                  <div
                    className="text-muted-foreground [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold [&_strong]:text-foreground"
                    dangerouslySetInnerHTML={{ __html: antenna.commentary }}
                  />
                </div>
              )}

              {/* Purchase CTAs - Primary focus */}
              <Card className="p-6 mb-6 bg-muted/30">
                <h2 className="text-xl font-semibold mb-4">Links & Resources</h2>
                <div className="space-y-3">
                  {antenna.suppliers.map((supplier, index) => (
                    <Button key={index} variant="outline" className="w-full justify-between border-primary" size="lg" asChild>
                      <a href={supplier.url} target="_blank" rel="noopener">
                        <div className="flex items-center">
                          <ShoppingCart className="mr-2 h-5 w-5" />
                          Buy from {supplier.name} ({supplier.purchase_cost})
                        </div>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  ))}
                </div>
                <div className="mt-4">
                  <Button variant="outline" className="w-full" asChild>
                    <a href={antenna.manufacturer.datasheet} target="_blank" rel="noopener">
                      View Datasheet <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Some links may be affiliate links. Any commissions support Austin Mesh at no extra cost to you.
                </p>
              </Card>

              {/* Specs */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Specs</h2>
                <Card className="p-6">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <h3 className="font-medium text-muted-foreground">Brand</h3>
                      <p>{antenna.manufacturer.brand_name}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-muted-foreground">Part Number</h3>
                      <p>{antenna.manufacturer.part_number}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-muted-foreground">Frequency</h3>
                      <p>{displayFrequency(antenna.manufacturer.freq_spec)}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-muted-foreground">Connector Type</h3>
                      <p>{antenna.connector_type}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-muted-foreground">VSWR (915MHz)</h3>
                      <p>{bestVswrAt915(antenna) || "N/A"}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-muted-foreground">Category</h3>
                      <p>{antenna.category || "N/A"}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-muted-foreground">Gain</h3>
                      <p>{antenna.gain || "N/A"}</p>
                    </div>
                    {antenna.dimensions && (
                      <>
                        <div>
                          <h3 className="font-medium text-muted-foreground">Length</h3>
                          <p>{antenna.dimensions.length} mm</p>
                        </div>
                        {antenna.dimensions.width && (
                          <div>
                            <h3 className="font-medium text-muted-foreground">Width</h3>
                            <p>{antenna.dimensions.width} mm</p>
                          </div>
                        )}
                      </>
                    )}
                    {antenna.manufacturer.url && (
                      <div className="col-span-2 lg:col-span-3">
                        <h3 className="font-medium text-muted-foreground">Manufacturer Website</h3>
                        <p>
                          <a
                            href={antenna.manufacturer.url}
                            target="_blank"
                            rel="noopener"
                            className="text-primary hover:underline flex items-center"
                          >
                            Visit manufacturer website <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Test Results */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>

            {testingSummary && <p className="mb-4 max-w-3xl text-muted-foreground">{testingSummary}</p>}

            {/* Overlaid VSWR / return-loss curves from any attached .s1p sweeps (full width) */}
            {(() => {
              const sweepSeries = antenna.test_results
                .map((t, i) =>
                  t.sweep ? { id: `test-${i}`, label: sweepSeriesLabel(t, i), points: t.sweep.points } : null,
                )
                .filter((s): s is AntennaSweepSeries => s !== null)
              return sweepSeries.length ? (
                <div className="mb-6">
                  <AntennaSweepChart series={sweepSeries} />
                </div>
              ) : null
            })()}

            {/* Individual tests: two columns on desktop, one on mobile */}
            <div className="grid md:grid-cols-2 gap-4">
              {antenna.test_results.map((testResult, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">Test #{index + 1}</h3>
                  <div className="grid gap-4">
                    {testResult.configuration && (
                      <div>
                        <h4 className="font-medium text-muted-foreground mb-1">Configuration</h4>
                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                          {testResult.configuration.ground_plane && (
                            <span>
                              <span className="text-muted-foreground">Ground plane:</span>{" "}
                              {testResult.configuration.ground_plane}
                            </span>
                          )}
                          {testResult.configuration.position && (
                            <span>
                              <span className="text-muted-foreground">Position:</span>{" "}
                              {testResult.configuration.position}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {testResult.markers.length > 0 && (
                      <div>
                        <h4 className="font-medium text-muted-foreground mb-2">VSWR Measurements</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {testResult.markers.map((marker, markerIndex) => (
                            <div key={markerIndex} className="border rounded p-2">
                              <p className="font-medium">{marker.frequency}</p>
                              <p>VSWR: {marker.vswr}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {testResult.sweep && (
                      <p className="text-sm text-muted-foreground">
                        Resonant point: VSWR {testResult.sweep.min_vswr.vswr.toFixed(3)}:1 at{" "}
                        {Math.round(testResult.sweep.min_vswr.frequency_hz / 1e6)} MHz (
                        {testResult.sweep.point_count} points measured).
                      </p>
                    )}

                    <Separator className="my-2" />

                    <div>
                      <h4 className="font-medium text-muted-foreground">Notes from test</h4>
                      <p>{testResult.notes || "No notes available"}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-muted-foreground">Tested By</h4>
                      <p>
                        {testResult.metadata.tester}
                        {testResult.metadata.callsign ? `, ${testResult.metadata.callsign}` : ""}
                        {testResult.metadata.handle ? ` (${testResult.metadata.handle})` : ""} on{" "}
                        {testResult.metadata.date}
                      </p>
                      {testResult.metadata.sample && sampleSummary(testResult.metadata.sample) && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {sampleSummary(testResult.metadata.sample)}
                        </p>
                      )}
                    </div>

                    {testResult.sweep && (
                      <div>
                        <a
                          href={testResult.sweep.source_file}
                          download
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-2"
                        >
                          <Download className="h-4 w-4" />
                          Download .s1p (Touchstone)
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

