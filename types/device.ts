export type DevicePrice = {
  min: number | string
  max: number | string
  currency: string
}

export type DeviceBattery = {
  type: string
  capacity_mAh?: number | string
  estimated_runtime?: string
}

export type DeviceSpecifications = {
  lora_frequencies: string[]
  microcontroller: string
  lora_radio?: string
  max_tx_power_dbm?: number
  power_consumption: string
  battery: DeviceBattery
  antenna: string
  interfaces: string[]
}

export type PurchaseUrl = {
  supplier: string
  url: string
  type?: string
}

export type Device = {
  id: string
  name: string
  manufacturer: string
  model: string
  description: string
  category: string[]
  image_url: string[]
  purchase_urls: PurchaseUrl[]
  price: DevicePrice
  specifications: DeviceSpecifications
  features: string[]
  commentary?: string
  sort_order?: number
  /** No longer sold. Still listed and labeled; sorts last in the default order. */
  discontinued?: boolean
  /** id of the successor device (discontinued devices only). */
  replaced_by?: string
}

export type DeviceSitemapItem = {
  id: string
  name: string
  lastModified: Date
}
