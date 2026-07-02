import type { Metadata } from 'next'
import { GoogleAnalytics } from '@next/third-parties/google'
import './globals.css'

const description =
  'Compare mesh networking and radio hardware, including devices and antennas, with firsthand VSWR test results, SWR sweep charts, specs, pricing, and buy links.'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.rfindex.com'),
  title: 'RF Index',
  description,
  openGraph: {
    type: 'website',
    siteName: 'RF Index',
    url: '/',
    title: 'RF Index',
    description,
    images: [{ url: '/web-app-manifest-512x512.png', width: 512, height: 512, alt: 'RF Index' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RF Index',
    description,
    images: ['/web-app-manifest-512x512.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head><meta name="apple-mobile-web-app-title" content="RF Index" /></head>
      <body>{children}</body>
      <GoogleAnalytics gaId="G-472ZDTTS45" />
    </html>
  )
}
