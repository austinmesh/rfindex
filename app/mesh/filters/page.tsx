import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

import { filters } from "@/lib/data"
import { FilterBrowser } from "@/components/filter-browser"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Compare Mesh RF Filters | RF Index",
  description:
    "Browse and compare bandpass and low-pass RF filters for mesh networking radios, with firsthand VNA insertion loss, match, and rejection measurements.",
  path: "/mesh/filters",
})

export default function FilterListingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Page title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Mesh RF Filters</h1>
            <p className="text-muted-foreground">
              Browse and compare RF filters for mesh networking radios. Filters knock down out-of-band noise from
              cellular, pagers, and other nearby transmitters before it reaches your receiver, which matters most on
              high-performance nodes and radios with amplifiers.
              <br />
              <small>
                Every filter here was measured firsthand with a 2-port VNA by the Austin Mesh community: insertion
                loss at the Meshtastic and MeshCore US frequencies, impedance match, bandwidth, and rejection, with
                downloadable Touchstone sweeps.{" "}
                <a href="https://github.com/austinmesh/rfindex/issues/new/choose">Suggest a filter here.</a>
              </small>
            </p>
          </div>

          {/* The card grid must stay in the static prerender (crawlable links),
              so this tree is deliberately NOT wrapped in <Suspense>. FilterBrowser
              syncs with the URL through a Suspense-isolated listener inside
              useUrlFilterSync; scripts/check-prerendered-links.ts backstops this
              after every build. */}
          <FilterBrowser filters={filters} />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
