import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  async headers() {
    return [
      {
        // Applies to Worker-rendered pages. Static-asset responses (including
        // /admin/index.html) never reach the Worker and get the equivalent set
        // from public/_headers; keep the two in sync.
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            // Report-only until verified against the live site; violations
            // show in the browser console. 'unsafe-inline' covers the
            // Next.js inline bootstrap scripts, which have no nonces on
            // statically prerendered pages.
            key: 'Content-Security-Policy-Report-Only',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data:",
              "font-src 'self' data:",
              "connect-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Legacy /device/:id redirects (from original site)
      {
        source: '/device/:id',
        destination: '/mesh/devices/:id',
        permanent: true,
      },
      // Meshtastic → Mesh redirects (site restructure)
      { source: '/meshtastic/devices', destination: '/mesh/devices', permanent: true },
      { source: '/meshtastic/devices/:id', destination: '/mesh/devices/:id', permanent: true },
      { source: '/meshtastic/antennas', destination: '/mesh/antennas', permanent: true },
      { source: '/meshtastic/antennas/:id', destination: '/mesh/antennas/:id', permanent: true },
      { source: '/meshtastic', destination: '/mesh/devices', permanent: true },
      { source: '/mesh', destination: '/mesh/devices', permanent: true },
      // Meshtastic/MeshCore landing pages merged into the devices page
      { source: '/mesh/meshtastic', destination: '/mesh/devices', permanent: true },
      { source: '/mesh/meshcore', destination: '/mesh/devices', permanent: true },
    ];
  },
}

export default nextConfig
