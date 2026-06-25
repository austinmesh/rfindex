import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Only the canonical production domain should be indexable. Every other host
// the Worker answers on (its *.workers.dev URL, and the per-branch preview URLs
// Cloudflare Workers Builds generates) gets X-Robots-Tag: noindex so search
// engines drop it. We allow crawling but mark noindex, which is the reliable
// way to keep previews out of the index: a robots.txt Disallow would stop the
// crawl but not prevent indexing from external links.
const PRODUCTION_HOSTS = new Set(["rfindex.com", "www.rfindex.com"])

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0].toLowerCase()
  const response = NextResponse.next()

  if (!host || !PRODUCTION_HOSTS.has(host)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow")
  }

  return response
}

export const config = {
  // Run on every route except Next internals and static files. Pages, the
  // sitemap, and robots.txt all flow through so the header reaches anything a
  // crawler might fetch.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
