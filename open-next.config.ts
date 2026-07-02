// OpenNext Cloudflare config
// See https://opennext.js.org/cloudflare for all options.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default {
  ...defineCloudflareConfig({
    // For best results consider enabling R2 caching:
    // incrementalCache: r2IncrementalCache,
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
  buildCommand: "node scripts/validate.js && npx tsx lib/prebuild.ts && next build",
};
