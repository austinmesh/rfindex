import Link from "next/link"

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
              <Link href="/meshtastic" className="text-muted-foreground hover:text-foreground transition-colors">
                Meshtastic
              </Link>
              <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
            </nav>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contribute</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="https://github.com/austinmesh/rfindex/issues/new?template=add-device.yml" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors">
                Add a device
              </Link>
              <Link href="https://github.com/austinmesh/rfindex/issues/new?template=remove-device.yml" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors">
                Remove a device
              </Link>
              <Link href="https://github.com/austinmesh/rfindex/issues/new?template=report-issue.yml" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors">
                Report an issue
              </Link>
              <Link href="https://github.com/austinmesh/rfindex/issues/new?template=request-update.yml" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors">
                Request an update
              </Link>
            </nav>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} RF Index. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
