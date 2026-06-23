export type AntennaMarker = {
  frequency: string
  vswr: string
}

export type AntennaTestMetadata = {
  tester: string
  date: string
}

export type AntennaTestResult = {
  markers: AntennaMarker[]
  notes: string
  metadata: AntennaTestMetadata
}

export type AntennaManufacturer = {
  brand_name: string
  url?: string
  part_number: string
  description: string
  freq_spec: string[]
  datasheet: string
}

export type AntennaSupplier = {
  name: string
  part_number?: string
  purchase_cost: string
  url: string
}

export type AntennaDimensions = {
  length: number
  width: number | null
}

export type Antenna = {
  slug: string
  title: string
  manufacturer: AntennaManufacturer
  suppliers: AntennaSupplier[]
  test_results: AntennaTestResult[]
  suggested?: boolean
  category?: string
  pdf?: string
  dimensions?: AntennaDimensions
  connector_type: string
  gain?: string
  image?: string
  description?: string
  sort_order?: number
}

export type AntennaSitemapItem = {
  id: string
  name: string
  lastModified: Date
}

export type StatusOption = {
  value: string
  label: string
}
