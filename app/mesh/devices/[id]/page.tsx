import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ExternalLinkIcon, ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ExternalLink } from "@/components/external-link"

import { devices, featureDescriptions, formatTxPower } from "@/lib/data"
import { JsonLd } from "@/components/json-ld"
import { deviceJsonLd } from "@/lib/seo"

// Generate static params for all device IDs
export function generateStaticParams() {
  return devices.map((device) => ({
    id: device.id,
  }))
}

// Unknown IDs return a real HTTP 404 instead of a 200 soft-404. This relies on
// the static-assets incremental cache in open-next.config.ts: fallback:false
// forbids on-demand rendering, so without that cache the Worker would 404
// every detail page.
export const dynamicParams = false

// Generate metadata for each device page
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const device = devices.find((d) => d.id === id)

  if (!device) notFound()

  const url = `https://www.rfindex.com/mesh/devices/${id}`
  const title = `${device.name} by ${device.manufacturer} | Mesh Devices | RF Index`
  const images = device.image_url?.[0]
    ? [{ url: device.image_url[0], alt: device.name }]
    : undefined

  return {
    title,
    description: device.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      url,
      title: `${device.name} by ${device.manufacturer}`,
      description: device.description,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${device.name} by ${device.manufacturer}`,
      description: device.description,
      ...(images ? { images: images.map((i) => i.url) } : {}),
    },
  }
}

export default async function DeviceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const device = devices.find((d) => d.id === id)

  if (!device) notFound()

  return (
    <div className="flex flex-col min-h-screen">
      <JsonLd data={deviceJsonLd(device)} />
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Back button */}
          <Button variant="ghost" className="mb-6" asChild>
            <Link href="/mesh/devices">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Devices
            </Link>
          </Button>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Device Image */}
            <div className="bg-white rounded-lg overflow-hidden border">
              <div className="relative aspect-square">
                <Image
                  src={device.image_url[0] || "/placeholder.svg"}
                  alt={device.name}
                  fill
                  className="object-contain p-4"
                />
              </div>
            </div>

            {/* Device Info and Purchase CTAs */}
            <div className="flex flex-col">
              <div>
                <h1 className="text-3xl font-bold">{device.name}</h1>
                <p className="text-lg text-muted-foreground mb-2">
                  {device.manufacturer} {device.model}
                </p>
                <div className="flex items-center mb-4">
                  <span className="text-2xl font-bold">
                    ${typeof device.price.min === "string" ? device.price.min : device.price.min.toFixed(2)}
                    {device.price.min !== device.price.max &&
                      ` - $${typeof device.price.max === "string" ? device.price.max : device.price.max.toFixed(2)}`}
                  </span>
                  <span className="ml-2 text-muted-foreground">{device.price.currency}</span>
                </div>
                <p className="mb-6">{device.description}</p>
              </div>

              {/* Austin Mesh community commentary */}
              {device.commentary && (
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
                    dangerouslySetInnerHTML={{ __html: device.commentary }}
                  />
                </div>
              )}

              {/* Purchase CTAs - Primary focus */}
              <Card className="p-6 mb-6 bg-muted/30">
                <h2 className="text-xl font-semibold mb-4">Purchase Options</h2>
                <div className="space-y-3">
                  {device.purchase_urls.map((purchase, index) => (
                    <Button key={index} variant="outline" className="w-full justify-between border-primary h-auto min-h-11 py-2 whitespace-normal text-left" size="lg" asChild>
                      <ExternalLink href={purchase.url}>
                        <div className="flex items-center">
                          <ShoppingCart className="mr-2 h-5 w-5" />
                          Buy on {purchase.supplier}
                        </div>
                        <ExternalLinkIcon className="h-4 w-4" />
                      </ExternalLink>
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Prices may vary by supplier. Click to check current pricing.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Some links may be affiliate links. Any commissions support Austin Mesh at no extra cost to you.
                </p>
              </Card>

              {/* Key Specifications */}
              <div>
                <h2 className="text-lg font-semibold mb-2">Key Specifications</h2>
                <ul className="grid grid-cols-2 gap-2">
                  <li className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Microcontroller</span>
                    <span>{device.specifications.microcontroller}</span>
                  </li>
                  <li className="flex flex-col">
                    <span className="text-sm text-muted-foreground">LoRa Radio</span>
                    <span>{device.specifications.lora_radio ?? "N/A"}</span>
                  </li>
                  <li className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Max TX Power</span>
                    <span>{formatTxPower(device.specifications.max_tx_power_dbm)}</span>
                  </li>
                  <li className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Estimated Runtime</span>
                    <span>{device.specifications.battery.estimated_runtime}</span>
                  </li>
                  <li className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Power Consumption</span>
                    <span>{device.specifications.power_consumption}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="grid gap-6">
              <h2 className="text-lg font-semibold mb-2">Technical Specifications</h2>
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-muted-foreground">LoRa Radio</h4>
                      <p>{device.specifications.lora_radio ?? "N/A"}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-muted-foreground">Max TX Power</h4>
                      <p>{formatTxPower(device.specifications.max_tx_power_dbm)}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-muted-foreground">Microcontroller</h4>
                      <p>{device.specifications.microcontroller}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-muted-foreground">Power Consumption</h4>
                      <p>{device.specifications.power_consumption}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-muted-foreground">Antenna</h4>
                      <p>{device.specifications.antenna}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-muted-foreground">Battery Type</h4>
                      <p>{device.specifications.battery.type}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-muted-foreground">Battery Capacity</h4>
                      <p>
                        {(typeof device.specifications.battery.capacity_mAh === "string" &&
                          device.specifications.battery.capacity_mAh.length > 0) ||
                        (typeof device.specifications.battery.capacity_mAh === "number" &&
                          device.specifications.battery.capacity_mAh > 0)
                          ? `${device.specifications.battery.capacity_mAh} mAh`
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-muted-foreground">Estimated Runtime</h4>
                      <p>{device.specifications.battery.estimated_runtime}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-muted-foreground">Interfaces</h4>
                      <p>{device.specifications.interfaces.join(", ")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Features</h2>
              <div className="grid gap-4 md:grid-cols-3 mb-4">
                {device.features.map((feature, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h4 className="font-medium">{feature}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {featureDescriptions[feature] ||
                        "Advanced feature enhancing device capabilities and performance."}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
