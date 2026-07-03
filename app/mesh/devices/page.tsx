import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

import { devices } from "@/lib/data"
import { DeviceFilters } from "@/components/device-filters"

export const metadata = {
  title: "Meshtastic & MeshCore Devices - Hardware Comparison | RF Index",
  description:
    "Compare Meshtastic and MeshCore devices side by side. Specs, features, pricing, and purchase links to help you choose the right LoRa mesh hardware.",
  alternates: {
    canonical: "https://www.rfindex.com/mesh/devices",
  }
}

export default function DeviceListingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 mt-8 md:mt-0">
          {/* Page title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Compare Devices for Meshtastic and MeshCore</h1>
            <p className="text-muted-foreground">Browse and compare devices for use on popular LoRa mesh networking technologies. Data set includes microcontroller, frequency support, power consumption estimates, interfaces, and other data as applicable(like battery chemistry).</p>
          </div>

          {/* The card grid must stay in the static prerender (crawlable links),
              so this tree is deliberately NOT wrapped in <Suspense>. DeviceFilters
              syncs with the URL through a Suspense-isolated listener inside
              useUrlFilterSync; if a bare useSearchParams() is ever reintroduced
              in this tree, the missing-suspense build error fires loudly instead
              of the grid silently vanishing from the HTML.
              scripts/check-prerendered-links.ts backstops this after every build. */}
          <DeviceFilters devices={devices} />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
