// OpenNext Cloudflare config
// See https://opennext.js.org/cloudflare for all options.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

export default {
  ...defineCloudflareConfig({
    // Read-only cache that serves the build-time prerendered SSG pages from
    // the Workers static assets binding (free tier; no R2/KV needed). Without
    // an incremental cache the Worker re-renders every SSG detail page on
    // demand, and `dynamicParams = false` on those pages would 404 them all,
    // because fallback:false forbids on-demand rendering. This site has no
    // ISR/revalidation, so a read-only prerender-only cache is a perfect fit.
    incrementalCache: staticAssetsIncrementalCache,
  }),
  // Validate the data against the JSON Schemas, generate data from `data/`, then
  // run the Next.js build. Validating first makes a bad contribution fail fast
  // with a friendly, field-level diagnostic instead of a cryptic crash deep in
  // the prebuild or the Next render. Without an explicit buildCommand, OpenNext
  // defaults to `pnpm build` on pnpm projects, which re-invokes this same
  // OpenNext build and creates an infinite loop. Running validate + prebuild +
  // `next build` here means every build path (build, deploy, preview, upload)
  // validates and regenerates data and lets OpenNext set standalone mode + the
  // workspace output-tracing root itself before bundling to `.open-next/`.
  // After `next build`, check-prerendered-links.ts asserts the listing pages
  // still ship crawlable detail links in their prerendered HTML (P1 item 9);
  // it fails the build if a client hook ever deopts them out of the static HTML.
  buildCommand:
    "node scripts/validate.js && npx tsx lib/prebuild.ts && next build && npx tsx scripts/check-prerendered-links.ts",
};
