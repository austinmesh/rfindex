/**
 * Post-build guard for the listing-page SEO fix (P1 item 9 / PR-B).
 *
 * The /mesh/devices and /mesh/antennas listing pages must ship their card grids
 * as real, crawlable <a href> links in the *statically prerendered* HTML. If a
 * client hook (e.g. useSearchParams) ever deopts the route back into client-side
 * rendering, those links vanish from the HTML and the pages silently lose their
 * internal linking / SEO value.
 *
 * This script runs after `next build` and asserts each listing page's prerendered
 * HTML contains a detail link for every JSON file in the matching data collection
 * (one card per data file), so a partially emptied grid fails too, not just a
 * fully missing one. A missing HTML file is likewise a failure, because it means
 * the route stopped being statically prerendered.
 *
 * Wired into the build via open-next.config.ts `buildCommand`, so it also gates
 * `deploy` / `preview` / `upload` and CI. Run manually with:
 *   npx tsx scripts/check-prerendered-links.ts
 */
import { existsSync, readdirSync, readFileSync } from "node:fs"
import path from "node:path"

const ROOT = path.resolve(__dirname, "..")
const APP_DIR = path.join(ROOT, ".next", "server", "app")

type Target = {
  /** Route path under .next/server/app (no extension) and the site URL prefix for detail links. */
  route: string
  /** Human label for messages. */
  label: string
  /** Folder under data/ whose JSON files correspond 1:1 with detail pages. */
  dataDir: string
}

const targets: Target[] = [
  { route: "mesh/devices", label: "device", dataDir: "mesh_devices" },
  { route: "mesh/antennas", label: "antenna", dataDir: "mesh_antennas" },
]

let failed = false

for (const target of targets) {
  const htmlPath = path.join(APP_DIR, `${target.route}.html`)

  // One detail page per JSON data file (generateStaticParams generates from the
  // same files), so the prerendered grid must link to at least this many pages.
  const expected = readdirSync(path.join(ROOT, "data", target.dataDir)).filter((file) =>
    file.endsWith(".json"),
  ).length

  if (expected === 0) {
    console.error(
      `✗ ${target.label} listing: found no JSON files in data/${target.dataDir}; cannot derive an expected link count.`,
    )
    failed = true
    continue
  }

  if (!existsSync(htmlPath)) {
    console.error(
      `✗ ${target.label} listing: expected prerendered HTML at ${path.relative(ROOT, htmlPath)} but it does not exist.\n` +
        `  The /${target.route} route is no longer statically prerendered. A client hook ` +
        `(e.g. useSearchParams) has likely deopted it into client-side rendering, removing all crawlable links.`,
    )
    failed = true
    continue
  }

  const html = readFileSync(htmlPath, "utf8")
  // Matches a link to a detail page (a route segment beyond the listing path).
  // Deduplicated so repeated links to the same page cannot mask missing cards.
  const linkPattern = new RegExp(`href="/${target.route}/[^"]+"`, "g")
  const links = new Set(html.match(linkPattern) ?? [])

  if (links.size < expected) {
    console.error(
      `✗ ${target.label} listing: ${path.relative(ROOT, htmlPath)} contains ${links.size} unique ` +
        `/${target.route}/… detail links; expected at least ${expected} (one per data/${target.dataDir} JSON file).\n` +
        `  The card grid is not fully server-rendered; detail links are missing from the crawlable HTML.`,
    )
    failed = true
    continue
  }

  console.log(
    `✓ ${target.label} listing: ${links.size} unique /${target.route}/… detail links in prerendered HTML (expected >= ${expected})`,
  )
}

if (failed) {
  console.error("\ncheck-prerendered-links: FAILED - listing pages are missing crawlable detail links.")
  process.exit(1)
}

console.log("check-prerendered-links: OK")
