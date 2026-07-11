import Link from "next/link"

import { ExternalLink } from "@/components/external-link"

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">RF Index</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/mesh/devices" className="text-muted-foreground hover:text-foreground transition-colors">
                Meshtastic
              </Link>
              <Link href="/mesh/antennas" className="text-muted-foreground hover:text-foreground transition-colors">
                Antennas
              </Link>
              <Link href="/mesh/filters" className="text-muted-foreground hover:text-foreground transition-colors">
                Filters
              </Link>
              <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
            </nav>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contribute</h3>
            <nav className="flex flex-col space-y-2">
              <ExternalLink href="https://github.com/austinmesh/rfindex/issues/new?template=add-device.yml" className="text-muted-foreground hover:text-foreground transition-colors">
                Add a device
              </ExternalLink>
              <ExternalLink href="https://github.com/austinmesh/rfindex/issues/new?template=remove-device.yml" className="text-muted-foreground hover:text-foreground transition-colors">
                Remove a device
              </ExternalLink>
              <ExternalLink href="https://github.com/austinmesh/rfindex/issues/new?template=report-issue.yml" className="text-muted-foreground hover:text-foreground transition-colors">
                Report an issue
              </ExternalLink>
              <ExternalLink href="https://github.com/austinmesh/rfindex/issues/new?template=request-update.yml" className="text-muted-foreground hover:text-foreground transition-colors">
                Request an update
              </ExternalLink>
              <ExternalLink href="https://github.com/austinmesh/rfindex/issues/new?template=submit-antenna-test.yml" className="text-muted-foreground hover:text-foreground transition-colors">
                Submit antenna test data
              </ExternalLink>
            </nav>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} RF Index. Code:{" "}
            <ExternalLink
              href="https://github.com/austinmesh/rfindex/blob/main/LICENSE"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              PolyForm Noncommercial 1.0.0
            </ExternalLink>{" "}
            &middot; Data:{" "}
            <ExternalLink
              href="https://github.com/austinmesh/rfindex/blob/main/data/LICENSE.md"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              CC BY-NC-SA 4.0
            </ExternalLink>
          </p>
        </div>
      </div>
    </footer>
  )
}
