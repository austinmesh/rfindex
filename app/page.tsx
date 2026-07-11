import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Compare Mesh Networking and Radio Hardware - RF Index",
  description:
    "Compare Meshtastic and MeshCore hardware side by side, with firsthand VSWR test results, SWR sweep charts, specs, pricing, and buy links for devices and antennas.",
  path: "/",
})

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-muted/50 to-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">RF Index</h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Independent, side by side comparisons of mesh networking hardware. We publish firsthand VSWR test
                results and SWR sweep charts for antennas, VNA-measured insertion loss and rejection for RF filters,
                plus specs, pricing, and buy links for Meshtastic and MeshCore devices.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <Button asChild size="lg">
                  <Link href="/mesh/devices">Compare Mesh Devices</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/mesh/antennas">Browse Tested Antennas</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Explore Technologies</h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl">
                  Browse our curated collections of devices, antennas, and resources for various RF technologies.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2 mt-12">
              {/* Mesh Card */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Mesh Networking</CardTitle>
                  <CardDescription>Off-grid LoRa messaging with Meshtastic and MeshCore</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="aspect-square relative mb-4 rounded-lg">
                    {/* A tracked copy, not a generated /devices/ asset: those are
                        rebuilt from data/ and vanish if the device is removed. */}
                    <Image
                      src="/home/mesh-hero.webp"
                      alt="Mesh networking devices"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Compare devices that run Meshtastic or MeshCore firmware, from ad-hoc off-grid messaging to
                    repeater-based regional networks, alongside antennas and RF filters we test firsthand with a VNA
                    and publish as downloadable Touchstone sweeps.
                  </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Button asChild className="w-full">
                    <Link href="/mesh/devices">
                      Explore Mesh Devices
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/mesh/antennas">
                      Compare Tested Antennas
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/mesh/filters">
                      Compare Tested Filters
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Placeholder for future technologies */}
              <Card className="flex flex-col border-dashed opacity-70">
                <CardHeader>
                  <CardTitle>Coming Soon</CardTitle>
                  <CardDescription>More RF technologies on the way</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="aspect-square relative mb-4 rounded-lg bg-muted">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-muted-foreground">Future Technology</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    We're working on adding more radio frequency technologies and resources to our collection.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button disabled className="w-full">
                    Coming Soon
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

