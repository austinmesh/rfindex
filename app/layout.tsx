import type { Metadata } from 'next'
import { GoogleAnalytics } from '@next/third-parties/google'
import './globals.css'

export const metadata: Metadata = {
  title: 'RF Index',
  description: 'Compare mesh networking and radio hardware, including devices and antennas, with specs, pricing, and test results.',
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
