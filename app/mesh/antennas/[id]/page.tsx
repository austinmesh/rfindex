import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ExternalLink, ShoppingCart, ThumbsUp, ThumbsDown, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

import { antennas } from "@/lib/data"
import { Separator } from "@/components/ui/separator"

// Add this helper function near the top of the file, before the component
function displayFrequency(freqSpec: string | string[]) {
  if (Array.isArray(freqSpec)) {
    return freqSpec.join(", ")
  }
  return freqSpec
}

// Generate static params for all antenna IDs
export function generateStaticParams() {
  return antennas.map((antenna, index) => ({
    id: antenna.slug,
  }))
}

// Generate metadata for each antenna page
export async function generateMetadata({ params }: { params: { id: string } }) {
  const { id } = await params;
  const antenna = antennas.find((a) => a.slug === id)

  if (!antenna) {
    return {
      title: "Antenna Not Found | RF Index",
      description: "The requested mesh antenna could not be found.",
      alternates: {
        canonical: "https://www.rfindex.com/mesh/antennas",
      },
    }
  }

  return {
    title: `${antenna.title} | Mesh Antennas | RF Index`,
    description:
      antenna.description ||
      `${antenna.manufacturer.description} for mesh networking devices.`,
    alternates: {
      canonical: `https://www.rfindex.com/mesh/antennas/${id}`,
    },
  }
}

export default async function AntennaDetailsPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const antenna = antennas.find((a) => a.slug === id)

  // If antenna not found, show error
  if (!antenna) {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Antenna Not Found</h1>
            <p className="mb-6">The antenna you are looking for does not exist.</p>
            <Button asChild>
              <Link href="/mesh/antennas">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Antennas
              </Link>
            </Button>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

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
      <Badge className="bg-green-500 hover:bg-green-600">
        <ThumbsUp className="h-3 w-3 mr-1" /> Suggested
      </Badge>
    ) : (
      <Badge variant="destructive">
        <ThumbsDown className="h-3 w-3 mr-1" /> Not Suggested
      </Badge>
    )
  }

  // Helper function to render status alert
  const renderStatusAlert = (suggested?: boolean, notes?: string) => {
    if (suggested === undefined) return null

    return suggested ? (
      <Alert className="bg-green-50 border-green-200">
        <ThumbsUp className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Suggested Antenna</AlertTitle>
        <AlertDescription className="text-green-700">
          {notes || "This antenna was tested by the community and is recommended for use with mesh networking devices."}
        </AlertDescription>
      </Alert>
    ) : (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Not Suggested</AlertTitle>
        <AlertDescription>
          {notes || "This antenna was tested by the community and is not recommended for use with mesh networking devices."}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
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
                  alt={antenna.manufacturer.description}
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
                <p className="mb-4">{antenna.description || antenna.manufacturer.description || "No description available"}</p>

                {/* Status Alert */}
                <div className="mb-6">{renderStatusAlert(antenna.suggested)}</div>
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
                <h2 className="text-xl font-semibold mb-4">Purchase Options</h2>
                <div className="space-y-3">
                  {antenna.suppliers.map((supplier, index) => (
                    <Button key={index} className="w-full justify-between" size="lg" asChild>
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
                  Some of these links are affiliate links. Any commission we earn helps support RF Index at no extra cost to you.
                </p>
              </Card>

              {/* Key Specifications */}
              <div>
                <h2 className="text-lg font-semibold mb-2">Key Specifications</h2>
                <ul className="grid grid-cols-2 gap-2">
                  <li className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Frequency</span>
                    <span>{displayFrequency(antenna.manufacturer.freq_spec)}</span>
                  </li>
                  <li className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Connector Type</span>
                    <span>{antenna.connector_type}</span>
                  </li>
                  <li className="flex flex-col">
                    <span className="text-sm text-muted-foreground">VSWR (915MHz)</span>
                    <span>
                      {antenna.test_results[0]?.markers.find((m) => m.frequency.includes("915"))?.vswr || "N/A"}
                    </span>
                  </li>
                  <li className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Category</span>
                    <span>{antenna.category || "N/A"}</span>
                  </li>
                  <li className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Gain</span>
                    <span>{antenna.gain || "N/A"}</span>
                  </li>
                  {antenna.dimensions && (
                    <>
                      <li className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Length</span>
                        <span>{antenna.dimensions.length} mm</span>
                      </li>
                      {antenna.dimensions.width && (
                        <li className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Width</span>
                          <span>{antenna.dimensions.width} mm</span>
                        </li>
                      )}
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              {/* Test Results */}
              <h2 className="text-xl font-semibold mb-4">Test Results</h2>
              <div>
                {antenna.test_results.map((testResult, index) => (
                  <div key={index} className="border rounded-lg p-4 mb-2">
                    <h3 className="text-lg font-semibold mb-2">Test #{index + 1}</h3>
                    <div className="grid gap-4">
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

                      <Separator className="my-2" />

                      <div>
                        <h4 className="font-medium text-muted-foreground">Notes from test</h4>
                        <p>{testResult.notes || "No notes available"}</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-muted-foreground">Tested By</h4>
                        <p>
                          {testResult.metadata.tester} on {testResult.metadata.date}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Manufacturer Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Manufacturer Information</h2>
              <Card className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-muted-foreground">Brand</h3>
                    <p>{antenna.manufacturer.brand_name}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-muted-foreground">Part Number</h3>
                    <p>{antenna.manufacturer.part_number}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-muted-foreground">Frequency Specification</h3>
                    <p>{displayFrequency(antenna.manufacturer.freq_spec)}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-muted-foreground">Connector Type</h3>
                    <p>{antenna.connector_type}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-muted-foreground">Description</h3>
                    <p>{antenna.manufacturer.description}</p>
                  </div>
                  {antenna.manufacturer.url && (
                    <div className="md:col-span-2">
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
      </main>
      <SiteFooter />
    </div>
  )
}

