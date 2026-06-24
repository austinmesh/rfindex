// OpenNext Cloudflare config
// See https://opennext.js.org/cloudflare for all options.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default {
  ...defineCloudflareConfig({
    // For best results consider enabling R2 caching:
    // incrementalCache: r2IncrementalCache,
  }),
  // Generate data from `data/`, then run the Next.js build. Without an explicit
  // buildCommand, OpenNext defaults to `pnpm build` on pnpm projects, which
  // re-invokes this same OpenNext build and creates an infinite loop. Running
  // the prebuild + `next build` here means every build path (build, deploy,
  // preview, upload) regenerates data and lets OpenNext set standalone mode +
  // the workspace output-tracing root itself before bundling to `.open-next/`.
  buildCommand: "npx tsx lib/prebuild.ts && next build",
};
