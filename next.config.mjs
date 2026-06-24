import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
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
