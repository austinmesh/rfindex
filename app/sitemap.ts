import type { MetadataRoute } from "next"
import { deviceSitemapData, antennaSitemapData } from "@/lib/data"

export default function sitemap(): MetadataRoute.Sitemap {
  // Base URL of your website
  const baseUrl = "https://rfindex.com" // Replace with your actual domain

  // Create sitemap entries
  const sitemapEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/mesh/devices`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/mesh/antennas`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ]

  // Add device pages to sitemap
  deviceSitemapData.forEach((device) => {
    sitemapEntries.push({
      url: `${baseUrl}/mesh/devices/${device.id}`,
      lastModified: device.lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    })
  })

  // Add antenna pages to sitemap
  antennaSitemapData.forEach((antenna) => {
    sitemapEntries.push({
      url: `${baseUrl}/mesh/antennas/${antenna.id}`,
      lastModified: antenna.lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    })
  })

  return sitemapEntries
}
