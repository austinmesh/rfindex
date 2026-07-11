import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ExternalLinkIcon, ShoppingCart, ThumbsUp, ThumbsDown, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ExternalLink } from "@/components/external-link"

import { filters } from "@/lib/data"
import { Separator } from "@/components/ui/separator"
import { FilterSweepChart, type FilterSweepTest } from "@/components/filter-sweep-chart-lazy"
import type { FilterTestResult, FilterTestSample } from "@/types/filter"
import { JsonLd } from "@/components/json-ld"
import {
  bestFilterMarker,
  brandedFilterTitle,
  filterJsonLd,
  filterMetaDescription,
  filterPassband,
  filterTestingSummary,
} from "@/lib/seo"

// Short label for one test (one physical unit) in chart legends and headings.
function testLabel(t: FilterTestResult, i: number) {
  if (t.chart_label?.trim()) return t.chart_label.trim()
  if (t.metadata.sample?.sample_id) return `S/N ${t.metadata.sample.sample_id}`
  const who = t.metadata.callsign || t.metadata.handle || null
  return who ? `Test ${i + 1} (${who})` : `Test ${i + 1}`
}

// One-line provenance for the physical unit tested, omitting absent fields.
function sampleSummary(s: FilterTestSample) {
  const parts: string[] = []
  if (s.sample_id) parts.push(`Sample ${s.sample_id}`)
  if (s.batch) parts.push(`Batch ${s.batch}`)
  if (s.supplier) parts.push(`from ${s.supplier}`)
  if (s.purchase_date) parts.push(`purchased ${s.purchase_date}`)
  return parts.join(", ")
}

// Attenuation values can come out fractionally negative from through-cal slop
// on a passband point; clamp for display so a low-pass filter reads "0.0 dB"
// rather than a nonsensical negative rejection.
const formatRejection = (db: number) => `${Math.max(0, db).toFixed(1)} dB`

const formatSweepRange = (startHz: number, stopHz: number) =>
  `${Math.round(startHz / 1e6)}-${Math.round(stopHz / 1e6)} MHz`

// Generate static params for all filter slugs
export function generateStaticParams() {
  return filters.map((filter) => ({
    slug: filter.slug,
  }))
}

// Unknown slugs return a real HTTP 404 instead of a 200 soft-404. This relies
// on the static-assets incremental cache in open-next.config.ts: fallback:false
// forbids on-demand rendering, so without that cache the Worker would 404
// every detail page.
export const dynamicParams = false

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const filter = filters.find((f) => f.slug === slug)

  if (!filter) notFound()

  const url = `https://www.rfindex.com/mesh/filters/${slug}`
  const description = filter.description || filterMetaDescription(filter)
  const ogTitle = filter.test_results.length
    ? `${filter.title} VNA Test Results`
    : `${filter.title} | Mesh RF Filter`
  const images = filter.image ? [{ url: filter.image, alt: brandedFilterTitle(filter) }] : undefined

  return {
    title: `${filter.title} | Mesh RF Filters | RF Index`,
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

export default async function FilterDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const filter = filters.find((f) => f.slug === slug)

  if (!filter) notFound()

  const testingSummary = filterTestingSummary(filter)
  const suppliers = filter.suppliers ?? []
  const meshtastic = bestFilterMarker(filter, "Meshtastic")
  const meshcore = bestFilterMarker(filter, "MeshCore")
  const passband = filterPassband(filter)

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
      <JsonLd data={filterJsonLd(filter)} />
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Back button */}
          <Button variant="ghost" className="mb-6" asChild>
            <Link href="/mesh/filters">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Filters
            </Link>
          </Button>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Filter Image */}
            <div className="bg-white rounded-lg overflow-hidden border">
              <div className="relative aspect-square">
                <Image
                  src={filter.image || `/placeholder.svg?height=400&width=400&text=${filter.manufacturer.part_number}`}
                  alt={filter.title}
                  fill
                  className="object-contain p-4"
                />
                <div className="absolute top-2 right-2">{renderStatusBadge(filter.suggested)}</div>
              </div>
            </div>

            {/* Filter Info */}
            <div className="flex flex-col">
              <div>
                <h1 className="text-3xl font-bold">{filter.title}</h1>
                <p className="text-lg text-muted-foreground mb-4">
                  {filter.manufacturer.brand_name} | Part: {filter.manufacturer.part_number}
                </p>
                {filter.description && <p className="mb-4">{filter.description}</p>}
              </div>

              {/* Austin Mesh community commentary */}
              {filter.commentary && (
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
                    dangerouslySetInnerHTML={{ __html: filter.commentary }}
                  />
                </div>
              )}

              {/* Purchase CTAs, only once suppliers exist */}
              {(suppliers.length > 0 || filter.manufacturer.datasheet) && (
                <Card className="p-6 mb-6 bg-muted/30">
                  <h2 className="text-xl font-semibold mb-4">Links & Resources</h2>
                  <div className="space-y-3">
                    {suppliers.map((supplier, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full justify-between border-primary h-auto min-h-11 py-2 whitespace-normal text-left"
                        size="lg"
                        asChild
                      >
                        <ExternalLink href={supplier.url}>
                          <div className="flex items-center">
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            Buy from {supplier.name} ({supplier.purchase_cost})
                          </div>
                          <ExternalLinkIcon className="h-4 w-4" />
                        </ExternalLink>
                      </Button>
                    ))}
                    {filter.manufacturer.datasheet && (
                      <Button variant="outline" className="w-full" asChild>
                        <ExternalLink href={filter.manufacturer.datasheet}>
                          View Datasheet <ExternalLinkIcon className="ml-2 h-4 w-4" />
                        </ExternalLink>
                      </Button>
                    )}
                  </div>
                  {suppliers.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-4">
                      Some links may be affiliate links. Any commissions support Austin Mesh at no extra cost to you.
                    </p>
                  )}
                </Card>
              )}

              {/* Specs */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Specs</h2>
                <Card className="p-6">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <h3 className="font-medium text-muted-foreground">Brand</h3>
                      <p>{filter.manufacturer.brand_name}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-muted-foreground">Part Number</h3>
                      <p>{filter.manufacturer.part_number}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-muted-foreground">Filter Type</h3>
                      <p>{filter.filter_type}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-muted-foreground">Connectors</h3>
                      <p>{filter.connectors}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-muted-foreground">Loss at Meshtastic (906.875 MHz)</h3>
                      <p>{meshtastic ? `${meshtastic.insertion_loss_db.toFixed(2)} dB` : "N/A"}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-muted-foreground">Loss at MeshCore (910.525 MHz)</h3>
                      <p>{meshcore ? `${meshcore.insertion_loss_db.toFixed(2)} dB` : "N/A"}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-muted-foreground">Return Loss at Meshtastic</h3>
                      <p>{meshtastic ? `${meshtastic.return_loss_db.toFixed(1)} dB` : "N/A"}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-muted-foreground">Return Loss at MeshCore</h3>
                      <p>{meshcore ? `${meshcore.return_loss_db.toFixed(1)} dB` : "N/A"}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-muted-foreground">3 dB Passband</h3>
                      <p>
                        {passband
                          ? `${passband.low_3db_mhz}-${passband.high_3db_mhz} MHz (${passband.bandwidth_3db_mhz} MHz)`
                          : "N/A"}
                      </p>
                    </div>
                    {filter.power_handling && (
                      <div>
                        <h3 className="font-medium text-muted-foreground">Power Handling</h3>
                        <p>{filter.power_handling}</p>
                      </div>
                    )}
                    {filter.dimensions && (
                      <div>
                        <h3 className="font-medium text-muted-foreground">Dimensions</h3>
                        <p>
                          {filter.dimensions.height} x {filter.dimensions.width} x {filter.dimensions.depth} mm
                        </p>
                      </div>
                    )}
                    {filter.manufacturer.url && (
                      <div className="col-span-2 lg:col-span-3">
                        <h3 className="font-medium text-muted-foreground">Manufacturer Website</h3>
                        <p>
                          <ExternalLink
                            href={filter.manufacturer.url}
                            className="text-primary hover:underline flex items-center"
                          >
                            Visit manufacturer website <ExternalLinkIcon className="ml-1 h-3 w-3" />
                          </ExternalLink>
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

            {/* Overlaid S21 / S11 curves plus Smith chart from the attached .s2p sweeps (full width) */}
            {(() => {
              const sweepTests = filter.test_results
                .map((t, i) => (t.sweeps?.length ? { id: `test-${i}`, label: testLabel(t, i), sweeps: t.sweeps } : null))
                .filter((t): t is FilterSweepTest => t !== null)
              return sweepTests.length ? (
                <div className="mb-6">
                  <FilterSweepChart tests={sweepTests} defaultRange={filter.default_range} />
                </div>
              ) : null
            })()}

            {/* Individual tests: two columns on desktop, one on mobile */}
            <div className="grid md:grid-cols-2 gap-4">
              {filter.test_results.map((testResult, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">{testLabel(testResult, index)}</h3>
                  <div className="grid gap-4">
                    {testResult.summary && testResult.summary.markers.length > 0 && (
                      <div>
                        <h4 className="font-medium text-muted-foreground mb-2">At Mesh Operating Frequencies</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {testResult.summary.markers.map((marker, markerIndex) => (
                            <div key={markerIndex} className="border rounded p-2">
                              <p className="font-medium">
                                {marker.label} ({marker.frequency_mhz} MHz)
                              </p>
                              <p>Loss: {marker.insertion_loss_db.toFixed(2)} dB</p>
                              <p>Return loss: {marker.return_loss_db.toFixed(1)} dB</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {testResult.summary?.passband && (
                      <p className="text-sm text-muted-foreground">
                        3 dB passband: {testResult.summary.passband.low_3db_mhz}-
                        {testResult.summary.passband.high_3db_mhz} MHz (
                        {testResult.summary.passband.bandwidth_3db_mhz} MHz wide), minimum loss{" "}
                        {(-testResult.summary.passband.peak_s21_db).toFixed(2)} dB at{" "}
                        {testResult.summary.passband.peak_mhz} MHz.
                      </p>
                    )}

                    {testResult.summary && testResult.summary.rejection.length > 0 && (
                      <div>
                        <h4 className="font-medium text-muted-foreground mb-2">Out-of-Band Rejection</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                          {testResult.summary.rejection.map((r) => (
                            <div key={r.frequency_mhz} className="flex justify-between gap-2 border-b border-dashed py-0.5">
                              <span className="text-muted-foreground">
                                {r.frequency_mhz} MHz ({r.label})
                              </span>
                              <span className="font-medium">{formatRejection(r.rejection_db)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
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

                    {testResult.sweeps && testResult.sweeps.length > 0 && (
                      <div className="flex flex-col gap-1">
                        {testResult.sweeps.map((sweep) => (
                          <a
                            key={sweep.file_name}
                            href={sweep.source_file}
                            download
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-2"
                          >
                            <Download className="h-4 w-4" />
                            Download .s2p ({formatSweepRange(sweep.start_hz, sweep.stop_hz)},{" "}
                            {sweep.point_count} points)
                          </a>
                        ))}
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
