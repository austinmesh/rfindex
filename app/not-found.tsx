import type { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = {
  title: "Page Not Found | RF Index",
  description: "The page you are looking for does not exist.",
}

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
          <p className="mb-6 text-muted-foreground">
            The page you are looking for does not exist or may have moved.
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild>
              <Link href="/mesh/devices">Browse Devices</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/mesh/antennas">Browse Antennas</Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
