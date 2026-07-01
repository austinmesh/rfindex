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
  supported_firmware: string[]
  commentary?: string
  sort_order?: number
}

export type DeviceSitemapItem = {
  id: string
  name: string
  lastModified: Date
}
