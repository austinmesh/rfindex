import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

import { antennas } from "@/lib/data"
import { AntennaFilters } from "@/components/antenna-filters"
import Link from "next/link"

export const metadata = {
  title: "Compare Mesh Antennas | RF Index",
  description:
    "Browse and compare antennas for mesh networking devices based on lab tests and real world use from the broader Mesh community.",
  alternates: {
    canonical: "https://www.rfindex.com/mesh/antennas",
  },
}

export default function AntennaListingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Page title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Mesh Antennas</h1>
            <p className="text-muted-foreground">Browse and compare antennas for mesh networking devices.<br /><small>Some of the test results on this page were sourced from <Link href="https://github.com/meshtastic/antenna-reports/tree/main" target="_blank">RicInNewMexico's testing</Link> and the broader Meshtastic community.</small></p>
          </div>

          {/* The card grid must stay in the static prerender (crawlable links),
              so this tree is deliberately NOT wrapped in <Suspense>. AntennaFilters
              syncs with the URL through a Suspense-isolated listener inside
              useUrlFilterSync; if a bare useSearchParams() is ever reintroduced
              in this tree, the missing-suspense build error fires loudly instead
              of the grid silently vanishing from the HTML.
              scripts/check-prerendered-links.ts backstops this after every build. */}
          <AntennaFilters antennas={antennas} />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
