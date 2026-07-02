import type { Antenna } from "@/types/antenna"
import type { Device } from "@/types/device"

// Canonical host. Matches the canonical URLs used across the app so metadata,
// OpenGraph, and JSON-LD all resolve to a single origin.
export const SITE_URL = "https://www.rfindex.com"

// Resolve a root-relative or already-absolute path to an absolute URL.
export function absoluteUrl(path: string): string {
  if (!path) return SITE_URL
  if (/^https?:\/\//.test(path)) return path
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`
}

const CURRENCY_BY_SYMBOL: Record<string, string> = { $: "USD", "€": "EUR", "£": "GBP" }

// Parse a display price like "$16.97" or "€13.85" into a number plus ISO currency.
export function parsePrice(raw?: string): { amount: number; currency: string } | null {
  if (!raw) return null
  const symbol = Object.keys(CURRENCY_BY_SYMBOL).find((s) => raw.includes(s))
  const amount = Number.parseFloat(raw.replace(/[^0-9.]/g, ""))
  if (Number.isNaN(amount)) return null
  return { amount, currency: symbol ? CURRENCY_BY_SYMBOL[symbol] : "USD" }
}

function parseVswr(v: string): number | null {
  const n = Number.parseFloat(v)
  return Number.isNaN(n) ? null : n
}

// Antenna titles sometimes already lead with the brand (e.g. brand "Alfa",
// title "Alfa AOA Omni"). Only prepend the brand when it is not already there,
// so we never render "Alfa Alfa AOA Omni".
export function brandedTitle(a: Antenna): string {
  const brand = a.manufacturer.brand_name
  return a.title.toLowerCase().startsWith(brand.toLowerCase()) ? a.title : `${brand} ${a.title}`
}

function firstFrequency(freqSpec: string | string[]): string {
  return Array.isArray(freqSpec) ? freqSpec[0] : freqSpec
}

function allFrequencies(freqSpec: string | string[]): string {
  return Array.isArray(freqSpec) ? freqSpec.join(", ") : freqSpec
}

// Best (lowest) VSWR we have measured, from sweep resonant points and markers.
export function bestMeasuredVswr(a: Antenna): { vswr: number; freqMhz?: number } | null {
  let best: { vswr: number; freqMhz?: number } | null = null
  for (const t of a.test_results) {
    if (t.sweep) {
      const v = t.sweep.min_vswr.vswr
      const f = t.sweep.min_vswr.frequency_hz / 1e6
      if (!best || v < best.vswr) best = { vswr: v, freqMhz: f }
    }
    for (const m of t.markers) {
      const v = parseVswr(m.vswr)
      if (v != null && (!best || v < best.vswr)) best = { vswr: v }
    }
  }
  return best
}

// Unique callsigns across all test results, in first-seen order.
export function testerCallsigns(a: Antenna): string[] {
  const set = new Set<string>()
  for (const t of a.test_results) if (t.metadata.callsign) set.add(t.metadata.callsign)
  return [...set]
}

export function hasSweeps(a: Antenna): boolean {
  return a.test_results.some((t) => t.sweep)
}

// Testing-forward meta description. Leads with the firsthand VSWR data so search
// snippets communicate that RF Index measured the antenna, not just listed specs.
export function antennaMetaDescription(a: Antenna): string {
  const bt = brandedTitle(a)
  const part = a.manufacturer.part_number
  const freq = firstFrequency(a.manufacturer.freq_spec)
  const testCount = a.test_results.length

  if (testCount === 0) {
    return `${bt} (${part}) ${freq} LoRa mesh antenna. Compare gain, connector, price, and full specs on RF Index.`
  }

  const best = bestMeasuredVswr(a)
  const calls = testerCallsigns(a)
  const who = calls.length ? `the mesh community (${calls.slice(0, 3).join(", ")})` : "the Austin Mesh community"
  const bestStr = best ? `, best VSWR ${best.vswr.toFixed(2)}:1` : ""
  const sweeps = hasSweeps(a) ? " with downloadable nanoVNA Touchstone sweeps" : ""
  const testWord = testCount === 1 ? "test" : "tests"

  return `Firsthand VSWR ${testWord} for the ${bt} (${part}) ${freq} LoRa mesh antenna, measured by ${who}${bestStr}${sweeps}. Compare gain, price, and return loss on RF Index.`
}

// Short, crawlable on-page paragraph reinforcing the firsthand-experience signal.
// Returns null for antennas with no test data so we never claim tests we lack.
export function antennaTestingSummary(a: Antenna): string | null {
  const testCount = a.test_results.length
  if (testCount === 0) return null

  const best = bestMeasuredVswr(a)
  const calls = testerCallsigns(a)
  const who = calls.length
    ? `the Austin Mesh community (${calls.slice(0, 4).join(", ")})`
    : "the Austin Mesh community"

  const parts: string[] = [
    `This page collects ${testCount} independent VSWR ${testCount === 1 ? "test" : "tests"} of the ${brandedTitle(a)}, measured firsthand by ${who}.`,
  ]
  if (hasSweeps(a)) {
    parts.push("Every nanoVNA sweep is charted below and downloadable as a Touchstone (.s1p) file.")
  }
  if (best) {
    parts.push(
      `Best measured VSWR is ${best.vswr.toFixed(2)}:1${best.freqMhz ? ` near ${Math.round(best.freqMhz)} MHz` : ""}.`,
    )
  }
  return parts.join(" ")
}

function breadcrumb(items: Array<[string, string]>) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, item], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item,
    })),
  }
}

// schema.org graph for an antenna detail page: Product (with AggregateOffer from
// real supplier prices), a Dataset describing our measurements, and a breadcrumb.
// No aggregateRating is emitted, we do not assign star ratings to test data.
export function antennaJsonLd(a: Antenna) {
  const url = `${SITE_URL}/mesh/antennas/${a.slug}`
  const graph: Record<string, unknown>[] = []

  const offers = a.suppliers.map((s) => {
    const p = parsePrice(s.purchase_cost)
    return {
      "@type": "Offer",
      url: s.url,
      ...(p ? { price: p.amount.toFixed(2), priceCurrency: p.currency } : {}),
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: s.name },
    }
  })
  const usdPrices = a.suppliers
    .map((s) => parsePrice(s.purchase_cost))
    .filter((p): p is { amount: number; currency: string } => !!p && p.currency === "USD")
    .map((p) => p.amount)

  const additionalProperty: Record<string, unknown>[] = []
  if (a.gain) additionalProperty.push({ "@type": "PropertyValue", name: "Gain", value: a.gain })
  additionalProperty.push({ "@type": "PropertyValue", name: "Connector", value: a.connector_type })
  additionalProperty.push({
    "@type": "PropertyValue",
    name: "Frequency",
    value: allFrequencies(a.manufacturer.freq_spec),
  })
  const best = bestMeasuredVswr(a)
  if (best) {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "Best measured VSWR",
      value: `${best.vswr.toFixed(2)}:1`,
    })
  }

  const product: Record<string, unknown> = {
    "@type": "Product",
    "@id": `${url}#product`,
    name: brandedTitle(a),
    description: antennaMetaDescription(a),
    ...(a.category ? { category: a.category } : {}),
    mpn: a.manufacturer.part_number,
    sku: a.manufacturer.part_number,
    brand: { "@type": "Brand", name: a.manufacturer.brand_name },
    ...(a.image ? { image: absoluteUrl(a.image) } : {}),
    url,
    additionalProperty,
  }
  if (offers.length) {
    product.offers = usdPrices.length
      ? {
          "@type": "AggregateOffer",
          priceCurrency: "USD",
          lowPrice: Math.min(...usdPrices).toFixed(2),
          highPrice: Math.max(...usdPrices).toFixed(2),
          offerCount: offers.length,
          offers,
        }
      : offers
  }
  graph.push(product)

  if (a.test_results.length) {
    const distribution = a.test_results
      .filter((t) => t.sweep)
      .map((t) => ({
        "@type": "DataDownload",
        encodingFormat: "application/x-touchstone",
        contentUrl: absoluteUrl(t.sweep!.source_file),
      }))
    const testers = [...new Map(a.test_results.map((t) => [t.metadata.tester, t.metadata])).values()]
    graph.push({
      "@type": "Dataset",
      "@id": `${url}#measurements`,
      name: `VSWR and return loss measurements for the ${brandedTitle(a)}`,
      description: `Firsthand vector network analyzer (nanoVNA) reflection measurements of the ${brandedTitle(a)} ${a.manufacturer.part_number} LoRa mesh antenna, collected by the Austin Mesh community.`,
      url,
      isAccessibleForFree: true,
      license: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
      measurementTechnique: "Vector network analyzer (nanoVNA) reflection sweep",
      variableMeasured: ["Voltage standing wave ratio (VSWR)", "Return loss (dB)"],
      creator: [
        { "@type": "Organization", name: "Austin Mesh", url: SITE_URL },
        ...testers.map((m) => ({
          "@type": "Person",
          name: m.tester,
          ...(m.callsign ? { alternateName: m.callsign } : {}),
        })),
      ],
      about: { "@id": `${url}#product` },
      ...(distribution.length ? { distribution } : {}),
    })
  }

  graph.push(
    breadcrumb([
      ["Home", SITE_URL],
      ["Mesh Antennas", `${SITE_URL}/mesh/antennas`],
      [a.title, url],
    ]),
  )

  return { "@context": "https://schema.org", "@graph": graph }
}

// schema.org graph for a device detail page: Product with an AggregateOffer built
// from the device price range (per-supplier prices are not tracked) plus a breadcrumb.
export function deviceJsonLd(d: Device) {
  const url = `${SITE_URL}/mesh/devices/${d.id}`
  const image = d.image_url?.[0] ? absoluteUrl(d.image_url[0]) : undefined

  const additionalProperty: Record<string, unknown>[] = []
  const spec = d.specifications
  if (spec?.microcontroller)
    additionalProperty.push({ "@type": "PropertyValue", name: "Microcontroller", value: spec.microcontroller })
  if (spec?.lora_radio)
    additionalProperty.push({ "@type": "PropertyValue", name: "LoRa radio", value: spec.lora_radio })
  if (spec?.lora_frequencies?.length)
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "LoRa frequency",
      value: spec.lora_frequencies.join(", "),
    })
  if (d.supported_firmware?.length)
    additionalProperty.push({ "@type": "PropertyValue", name: "Firmware", value: d.supported_firmware.join(", ") })
  if (typeof spec?.max_tx_power_dbm === "number")
    additionalProperty.push({ "@type": "PropertyValue", name: "Max TX power", value: `${spec.max_tx_power_dbm} dBm` })

  const product: Record<string, unknown> = {
    "@type": "Product",
    "@id": `${url}#product`,
    name: d.name,
    description: d.description,
    ...(d.category?.length ? { category: d.category } : {}),
    mpn: d.model,
    sku: d.model,
    brand: { "@type": "Brand", name: d.manufacturer },
    ...(image ? { image } : {}),
    url,
    additionalProperty,
  }
  if (d.price && d.purchase_urls?.length) {
    product.offers = {
      "@type": "AggregateOffer",
      priceCurrency: d.price.currency || "USD",
      lowPrice: String(d.price.min),
      highPrice: String(d.price.max),
      offerCount: d.purchase_urls.length,
      availability: "https://schema.org/InStock",
    }
  }

  return {
    "@context": "https://schema.org",
    "@graph": [
      product,
      breadcrumb([
        ["Home", SITE_URL],
        ["Mesh Devices", `${SITE_URL}/mesh/devices`],
        [d.name, url],
      ]),
    ],
  }
}
