"use client"
import type { Device } from "@/types/device"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, Sliders, X, ExternalLink, Scale } from "lucide-react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { allDeviceCategories as allCategories, allFeatures, allLoraFrequencies, allMicrocontrollers, allLoraRadios, allFirmwares, maxTxPowerDbm, formatTxPower } from "@/lib/data"
import { AddMissingCard } from "@/components/add-missing-card"

type SortOption = "default" | "price-asc" | "price-desc"

// Sort values arrive as plain strings (URL params, Select onValueChange);
// anything unrecognized falls back to the default order.
function parseSortOption(value: string | null): SortOption {
  return value === "price-asc" || value === "price-desc" ? value : "default"
}

export function DeviceFilters({ devices }: { devices: Device[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Add these refs and state for scroll behavior
  const lastScrollY = useRef(0)
  const [showMobileSearch, setShowMobileSearch] = useState(true)

  // Parse URL parameters for initial state
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("categories")?.split(",").filter(Boolean) || [],
  )
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(
    searchParams.get("features")?.split(",").filter(Boolean) || [],
  )
  const [selectedLoraFrequencies, setSelectedLoraFrequencies] = useState<string[]>(
    searchParams.get("frequencies")?.split(",").filter(Boolean) || [],
  )
  const [selectedMicrocontrollers, setSelectedMicrocontrollers] = useState<string[]>(
    searchParams.get("microcontrollers")?.split(",").filter(Boolean) || [],
  )
  const [selectedLoraRadios, setSelectedLoraRadios] = useState<string[]>(
    searchParams.get("radios")?.split(",").filter(Boolean) || [],
  )
  const [selectedFirmwares, setSelectedFirmwares] = useState<string[]>(
    searchParams.get("firmware")?.split(",").filter(Boolean) || [],
  )
  const [priceRange, setPriceRange] = useState<number[]>(() => {
    const min = searchParams.get("priceMin") ? Number.parseInt(searchParams.get("priceMin") || "0") : 0
    const max = searchParams.get("priceMax") ? Number.parseInt(searchParams.get("priceMax") || "500") : 500
    return [min, max]
  })
  const [minTxPower, setMinTxPower] = useState<number>(() =>
    searchParams.get("txMin") ? Number.parseInt(searchParams.get("txMin") || "0") : 0,
  )
  const [sortOption, setSortOption] = useState<SortOption>(parseSortOption(searchParams.get("sort")))

  // Comparison state
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>(
    searchParams.get("compare")?.split(",").filter(Boolean) || [],
  )
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(searchParams.get("compareOpen") === "true")

  // Filter devices based on search query, categories, features, and price range
  const filteredDevices = devices.filter((device) => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.description.toLowerCase().includes(searchQuery.toLowerCase())

    // Category filter
    const matchesCategory =
      selectedCategories.length === 0 || selectedCategories.some((category) => device.category.includes(category))

    // Features filter
    const matchesFeatures =
      selectedFeatures.length === 0 || selectedFeatures.every((feature) => device.features.includes(feature))

    // LoRa frequencies filter
    const matchesLoraFrequencies =
      selectedLoraFrequencies.length === 0 ||
      selectedLoraFrequencies.some((freq) => device.specifications.lora_frequencies.includes(freq))

    // Microcontroller filter
    const matchesMicrocontroller =
      selectedMicrocontrollers.length === 0 || selectedMicrocontrollers.includes(device.specifications.microcontroller)

    // LoRa radio filter
    const matchesLoraRadio =
      selectedLoraRadios.length === 0 ||
      (device.specifications.lora_radio !== undefined &&
        selectedLoraRadios.includes(device.specifications.lora_radio))

    // Firmware filter
    const matchesFirmware =
      selectedFirmwares.length === 0 || device.supported_firmware.some((fw) => selectedFirmwares.includes(fw))

    // Price filter
    const deviceMinPrice = Number.parseFloat(
      typeof device.price.min === "string" ? device.price.min : device.price.min.toString(),
    )
    const deviceMaxPrice = Number.parseFloat(
      typeof device.price.max === "string" ? device.price.max : device.price.max.toString(),
    )
    const selectedMinPrice = priceRange[0]
    const selectedMaxPrice = priceRange[1]

    const matchesPrice = deviceMaxPrice >= selectedMinPrice && deviceMinPrice <= selectedMaxPrice

    // Max TX power filter (minimum threshold). At 0 the filter is inactive.
    // Above 0, devices without a listed TX power are excluded.
    const matchesTxPower =
      minTxPower === 0 ||
      (device.specifications.max_tx_power_dbm !== undefined &&
        device.specifications.max_tx_power_dbm >= minTxPower)

    return (
      matchesSearch &&
      matchesCategory &&
      matchesFeatures &&
      matchesLoraFrequencies &&
      matchesMicrocontroller &&
      matchesLoraRadio &&
      matchesFirmware &&
      matchesPrice &&
      matchesTxPower
    )
  })

  // Sort devices
  const sortedDevices = [...filteredDevices].sort((a, b) => {
    if (sortOption === "price-asc") {
      const priceA = Number(typeof a.price.min === "string" ? a.price.min : a.price.min)
      const priceB = Number(typeof b.price.min === "string" ? b.price.min : b.price.min)
      return priceA - priceB
    }
    if (sortOption === "price-desc") {
      const priceA = Number(typeof a.price.min === "string" ? a.price.min : a.price.min)
      const priceB = Number(typeof b.price.min === "string" ? b.price.min : b.price.min)
      return priceB - priceA
    }
    return 0 // Default sorting (no change)
  })

  const devicesToCompare = devices.filter((device) => selectedForComparison.includes(device.id))

  // Modified toggle functions to update state
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) => (prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]))
  }

  const toggleLoraFrequency = (frequency: string) => {
    setSelectedLoraFrequencies((prev) =>
      prev.includes(frequency) ? prev.filter((f) => f !== frequency) : [...prev, frequency],
    )
  }

  const toggleMicrocontroller = (microcontroller: string) => {
    setSelectedMicrocontrollers((prev) =>
      prev.includes(microcontroller) ? prev.filter((m) => m !== microcontroller) : [...prev, microcontroller],
    )
  }

  const toggleLoraRadio = (radio: string) => {
    setSelectedLoraRadios((prev) => (prev.includes(radio) ? prev.filter((r) => r !== radio) : [...prev, radio]))
  }

  const toggleFirmware = (firmware: string) =>
    setSelectedFirmwares((prev) =>
      prev.includes(firmware) ? prev.filter((f) => f !== firmware) : [...prev, firmware],
    )

  const toggleDeviceComparison = (deviceId: string) => {
    setSelectedForComparison((prev) => {
      if (prev.includes(deviceId)) {
        return prev.filter((id) => id !== deviceId)
      } else {
        return [...prev, deviceId]
      }
    })
  }

  const clearComparison = () => {
    setSelectedForComparison([])
    setIsCompareModalOpen(false)
  }

  // Add scroll handler for mobile search visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY.current) {
        // Scrolling down
        setShowMobileSearch(false)
      } else {
        // Scrolling up
        setShowMobileSearch(true)
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Add this function after the clearComparison function
  const clearAllFilters = () => {
    setSearchQuery("")
    setSelectedCategories([])
    setSelectedFeatures([])
    setSelectedLoraFrequencies([])
    setSelectedMicrocontrollers([])
    setSelectedLoraRadios([])
    setSelectedFirmwares([])
    setPriceRange([0, 500])
    setMinTxPower(0)
    setSortOption("default")
  }

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery !== "" ||
    selectedCategories.length > 0 ||
    selectedFeatures.length > 0 ||
    selectedLoraFrequencies.length > 0 ||
    selectedMicrocontrollers.length > 0 ||
    selectedLoraRadios.length > 0 ||
    selectedFirmwares.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 500 ||
    minTxPower > 0 ||
    sortOption !== "default"

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())

    // Update search parameters
    if (searchQuery) params.set("q", searchQuery)
    else params.delete("q")

    if (selectedCategories.length > 0) params.set("categories", selectedCategories.join(","))
    else params.delete("categories")

    if (selectedFeatures.length > 0) params.set("features", selectedFeatures.join(","))
    else params.delete("features")

    if (selectedLoraFrequencies.length > 0) params.set("frequencies", selectedLoraFrequencies.join(","))
    else params.delete("frequencies")

    if (selectedMicrocontrollers.length > 0) params.set("microcontrollers", selectedMicrocontrollers.join(","))
    else params.delete("microcontrollers")

    if (selectedLoraRadios.length > 0) params.set("radios", selectedLoraRadios.join(","))
    else params.delete("radios")

    if (selectedFirmwares.length > 0) params.set("firmware", selectedFirmwares.join(","))
    else params.delete("firmware")

    if (priceRange[0] > 0) params.set("priceMin", priceRange[0].toString())
    else params.delete("priceMin")

    if (priceRange[1] < 500) params.set("priceMax", priceRange[1].toString())
    else params.delete("priceMax")

    if (minTxPower > 0) params.set("txMin", minTxPower.toString())
    else params.delete("txMin")

    if (sortOption !== "default") params.set("sort", sortOption)
    else params.delete("sort")

    if (selectedForComparison.length > 0) params.set("compare", selectedForComparison.join(","))
    else params.delete("compare")

    if (isCompareModalOpen) params.set("compareOpen", "true")
    else params.delete("compareOpen")

    // Update URL without refreshing the page
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [
    searchQuery,
    selectedCategories,
    selectedFeatures,
    selectedLoraFrequencies,
    selectedMicrocontrollers,
    selectedLoraRadios,
    selectedFirmwares,
    priceRange,
    minTxPower,
    sortOption,
    selectedForComparison,
    isCompareModalOpen,
    pathname,
    router,
    searchParams,
  ])

  // Listen for popstate events (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)

      setSearchQuery(params.get("q") || "")
      setSelectedCategories(params.get("categories")?.split(",").filter(Boolean) || [])
      setSelectedFeatures(params.get("features")?.split(",").filter(Boolean) || [])
      setSelectedLoraFrequencies(params.get("frequencies")?.split(",").filter(Boolean) || [])
      setSelectedMicrocontrollers(params.get("microcontrollers")?.split(",").filter(Boolean) || [])
      setSelectedLoraRadios(params.get("radios")?.split(",").filter(Boolean) || [])
      setSelectedFirmwares(params.get("firmware")?.split(",").filter(Boolean) || [])

      const min = params.get("priceMin") ? Number.parseInt(params.get("priceMin") || "0") : 0
      const max = params.get("priceMax") ? Number.parseInt(params.get("priceMax") || "500") : 500
      setPriceRange([min, max])

      setMinTxPower(params.get("txMin") ? Number.parseInt(params.get("txMin") || "0") : 0)

      setSortOption(parseSortOption(params.get("sort")))
      setSelectedForComparison(params.get("compare")?.split(",").filter(Boolean) || [])
      setIsCompareModalOpen(params.get("compareOpen") === "true")
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  return (
    <>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters - Desktop */}
        <div className="hidden md:block w-64 shrink-0">
          <div className="sticky top-20 space-y-6 overflow-y-scroll h-[80vh]">
            {hasActiveFilters && (
              <Button variant="secondary" size="sm" className="w-full" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear All Filters
              </Button>
            )}

            <div>
              <h3 className="font-semibold mb-3">Sort By</h3>
              <Select value={sortOption} onValueChange={(value) => setSortOption(parseSortOption(value))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a sort option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">Categories</h3>
              <div className="space-y-2">
                {allCategories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    <Label htmlFor={`category-${category}`} className="capitalize">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">LoRa Frequencies</h3>
              <div className="space-y-2">
                {allLoraFrequencies.map((frequency) => (
                  <div key={frequency} className="flex items-center space-x-2">
                    <Checkbox
                      id={`frequency-${frequency}`}
                      checked={selectedLoraFrequencies.includes(frequency)}
                      onCheckedChange={() => toggleLoraFrequency(frequency)}
                    />
                    <Label htmlFor={`frequency-${frequency}`}>{frequency}</Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">Firmware</h3>
              <div className="space-y-2">
                {allFirmwares.map((firmware) => (
                  <label key={firmware} className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox
                      checked={selectedFirmwares.includes(firmware)}
                      onCheckedChange={() => toggleFirmware(firmware)}
                    />
                    <span className="text-sm">{firmware}</span>
                  </label>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">Microcontroller</h3>
              <div className="space-y-2">
                {allMicrocontrollers.map((microcontroller) => (
                  <div key={microcontroller} className="flex items-center space-x-2">
                    <Checkbox
                      id={`microcontroller-${microcontroller}`}
                      checked={selectedMicrocontrollers.includes(microcontroller)}
                      onCheckedChange={() => toggleMicrocontroller(microcontroller)}
                    />
                    <Label htmlFor={`microcontroller-${microcontroller}`}>{microcontroller}</Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">LoRa Radio</h3>
              <div className="space-y-2">
                {allLoraRadios.map((radio) => (
                  <div key={radio} className="flex items-center space-x-2">
                    <Checkbox
                      id={`radio-${radio}`}
                      checked={selectedLoraRadios.includes(radio)}
                      onCheckedChange={() => toggleLoraRadio(radio)}
                    />
                    <Label htmlFor={`radio-${radio}`}>{radio}</Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">Price Range</h3>
              <Slider
                defaultValue={[0, 500]}
                max={500}
                step={1}
                value={priceRange}
                onValueChange={setPriceRange}
                className="my-6"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center border rounded-md">
                  <span className="px-2 bg-muted text-muted-foreground">$</span>
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => {
                      const value = Number(e.target.value)
                      if (!isNaN(value) && value >= 0) {
                        setPriceRange([value, priceRange[1]])
                      }
                    }}
                    className="w-12 p-1 text-center text-sm"
                    min="0"
                    max={priceRange[1]}
                  />
                </div>
                <span className="text-muted-foreground">to</span>
                <div className="flex items-center border rounded-md">
                  <span className="px-2 bg-muted text-muted-foreground">$</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => {
                      const value = Number(e.target.value)
                      if (!isNaN(value) && value >= priceRange[0]) {
                        setPriceRange([priceRange[0], value])
                      }
                    }}
                    className="w-12 p-1 text-center text-sm"
                    min={priceRange[0]}
                    max="120"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Shows devices with any price overlap in this range</p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">Min TX Power</h3>
              <Slider
                min={0}
                max={maxTxPowerDbm}
                step={1}
                value={[minTxPower]}
                onValueChange={(value) => setMinTxPower(value[0])}
                className="my-6"
              />
              <p className="text-sm">{minTxPower === 0 ? "Any TX power" : `At least ${formatTxPower(minTxPower)}`}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Devices without a listed TX power are hidden while this is above 0.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">Features</h3>
              <div className="space-y-2">
                {allFeatures.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={`feature-${feature}`}
                      checked={selectedFeatures.includes(feature)}
                      onCheckedChange={() => toggleFeature(feature)}
                    />
                    <Label htmlFor={`feature-${feature}`}>{feature}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Filters - Mobile */}
        <div className="md:hidden mb-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <Sliders className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="flex items-center justify-between">
                  <span>Filters</span>
                  {hasActiveFilters && (
                    <Button variant="secondary" size="sm" className="mr-3" onClick={clearAllFilters}>
                      <X className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  )}
                </SheetTitle>
                <SheetDescription>Filter devices by category, features, and price.</SheetDescription>
              </SheetHeader>
              <div className="space-y-6 py-4">
                <div>
                  <h3 className="font-semibold mb-3">Sort By</h3>
                  <Select value={sortOption} onValueChange={(value) => setSortOption(parseSortOption(value))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a sort option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Categories</h3>
                  <div className="space-y-2">
                    {allCategories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mobile-category-${category}`}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <Label htmlFor={`mobile-category-${category}`} className="capitalize">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">LoRa Frequencies</h3>
                  <div className="space-y-2">
                    {allLoraFrequencies.map((frequency) => (
                      <div key={frequency} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mobile-frequency-${frequency}`}
                          checked={selectedLoraFrequencies.includes(frequency)}
                          onCheckedChange={() => toggleLoraFrequency(frequency)}
                        />
                        <Label htmlFor={`mobile-frequency-${frequency}`}>{frequency}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Firmware</h3>
                  <div className="space-y-2">
                    {allFirmwares.map((firmware) => (
                      <label key={firmware} className="flex items-center space-x-2 cursor-pointer">
                        <Checkbox
                          checked={selectedFirmwares.includes(firmware)}
                          onCheckedChange={() => toggleFirmware(firmware)}
                        />
                        <span className="text-sm">{firmware}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Microcontroller</h3>
                  <div className="space-y-2">
                    {allMicrocontrollers.map((microcontroller) => (
                      <div key={microcontroller} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mobile-microcontroller-${microcontroller}`}
                          checked={selectedMicrocontrollers.includes(microcontroller)}
                          onCheckedChange={() => toggleMicrocontroller(microcontroller)}
                        />
                        <Label htmlFor={`mobile-microcontroller-${microcontroller}`}>{microcontroller}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">LoRa Radio</h3>
                  <div className="space-y-2">
                    {allLoraRadios.map((radio) => (
                      <div key={radio} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mobile-radio-${radio}`}
                          checked={selectedLoraRadios.includes(radio)}
                          onCheckedChange={() => toggleLoraRadio(radio)}
                        />
                        <Label htmlFor={`mobile-radio-${radio}`}>{radio}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Price Range</h3>
                  <Slider
                    defaultValue={[0, 500]}
                    max={500}
                    step={1}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="my-6"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border rounded-md">
                      <span className="px-2 bg-muted text-muted-foreground">$</span>
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => {
                          const value = Number(e.target.value)
                          if (!isNaN(value) && value >= 0) {
                            setPriceRange([value, priceRange[1]])
                          }
                        }}
                        className="w-12 p-1 text-center text-sm"
                        min="0"
                        max={priceRange[1]}
                      />
                    </div>
                    <span className="text-muted-foreground">to</span>
                    <div className="flex items-center border rounded-md">
                      <span className="px-2 bg-muted text-muted-foreground">$</span>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => {
                          const value = Number(e.target.value)
                          if (!isNaN(value) && value >= priceRange[0]) {
                            setPriceRange([priceRange[0], value])
                          }
                        }}
                        className="w-12 p-1 text-center text-sm"
                        min={priceRange[0]}
                        max="120"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Shows devices with any price overlap in this range
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Min TX Power</h3>
                  <Slider
                    min={0}
                    max={maxTxPowerDbm}
                    step={1}
                    value={[minTxPower]}
                    onValueChange={(value) => setMinTxPower(value[0])}
                    className="my-6"
                  />
                  <p className="text-sm">
                    {minTxPower === 0 ? "Any TX power" : `At least ${formatTxPower(minTxPower)}`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Devices without a listed TX power are hidden while this is above 0.
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Features</h3>
                  <div className="space-y-2">
                    {allFeatures.map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mobile-feature-${feature}`}
                          checked={selectedFeatures.includes(feature)}
                          onCheckedChange={() => toggleFeature(feature)}
                        />
                        <Label htmlFor={`mobile-feature-${feature}`}>{feature}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Device listing */}
        <div className="flex-1">
          {/* Desktop: Search and Compare side by side */}
          <div className="hidden md:flex gap-4 mb-8 sticky top-[8px] bg-white z-[50]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-10 pr-4 py-6"
                placeholder="Search devices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="bg-background border rounded-lg px-4 py-1 flex items-center justify-between shadow-sm">
              <div className="flex items-center">
                {selectedForComparison.length > 0 ? (
                  <>
                    <span className="font-medium mr-2">
                      {selectedForComparison.length} {selectedForComparison.length === 1 ? "device" : "devices"}{" "}
                      selected
                    </span>
                    <Button variant="outline" size="sm" onClick={clearComparison} className="ml-2">
                      Clear
                    </Button>
                  </>
                ) : (
                  <span className="text-muted-foreground text-sm">Select to compare</span>
                )}
              </div>
              <Button
                onClick={() => setIsCompareModalOpen(true)}
                disabled={selectedForComparison.length < 2}
                size="sm"
                className="ml-4"
              >
                Compare
              </Button>
            </div>
          </div>

          {/* Mobile: Search bar that hides on scroll down */}
          <div
            className={`md:hidden fixed top-16 left-0 right-0 z-30 bg-background px-4 py-2 transition-transform duration-300 ${
              showMobileSearch ? "translate-y-0" : "-translate-y-full"
            }`}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-10 pr-4"
                placeholder="Search devices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Mobile: Floating compare button */}
          {selectedForComparison.length > 0 && (
            <div className="md:hidden fixed bottom-6 right-6 z-40">
              <Button
                onClick={() => setIsCompareModalOpen(true)}
                disabled={selectedForComparison.length < 2}
                size="lg"
                variant="outline"
                className="rounded-full shadow-lg h-14 w-14 p-0 flex items-center justify-center"
              >
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-6 w-6 flex items-center justify-center">
                  {selectedForComparison.length}
                </span>
                <Scale size={32} strokeWidth={1} className="!w-8 !h-8" />
              </Button>
            </div>
          )}

          {sortedDevices.length === 0 && (
            <div className="text-center py-8 mb-4">
              <h3 className="text-lg font-semibold">No devices found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search query</p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedDevices.map((device) => (
                <Card key={device.id} className="overflow-hidden group">
                  <div className="aspect-square relative">
                    <Image
                      src={device.image_url[0] || "/placeholder.svg"}
                      alt={device.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 left-2 flex items-center bg-transparent group-hover:bg-white/90 rounded px-1 py-0.5">
                      <Checkbox
                        id={`compare-${device.id}`}
                        checked={selectedForComparison.includes(device.id)}
                        onCheckedChange={() => toggleDeviceComparison(device.id)}
                        className="h-5 w-5 border-gray-400 bg-white/90"
                      />
                      <span className="ml-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Compare
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg">{device.name}</h3>
                      <p className="text-sm text-muted-foreground">{device.manufacturer}</p>
                      <p className="text-sm line-clamp-2">{device.description}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between items-center">
                    <div className="font-semibold">
                      ${typeof device.price.min === "string" ? device.price.min : device.price.min.toFixed(2)}
                      {device.price.min !== device.price.max &&
                        ` - ${typeof device.price.max === "string" ? device.price.max : device.price.max.toFixed(2)}`}
                    </div>
                    <Button variant="outline" asChild size="sm">
                      <Link href={`/mesh/devices/${device.id}`}>View Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            <AddMissingCard type="device" />
          </div>
        </div>
      </div>

      {/* Comparison Modal */}
      <Dialog open={isCompareModalOpen} onOpenChange={setIsCompareModalOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Compare Devices</span>
              <Button variant="secondary" size="sm" className="mr-3" onClick={clearComparison}>
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </DialogTitle>
            <DialogDescription>Comparing {devicesToCompare.length} devices</DialogDescription>
          </DialogHeader>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Specification</TableHead>
                  {devicesToCompare.map((device) => (
                    <TableHead key={device.id} className="min-w-[200px]">
                      <div className="flex flex-col items-center">
                        <Link href={`/mesh/devices/${device.id}`} className="group">
                          <div className="relative w-20 h-20 mb-2 rounded-md overflow-hidden group-hover:ring-2 group-hover:ring-primary">
                            <Image
                              src={device.image_url[0] || "/placeholder.svg"}
                              alt={device.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="font-bold group-hover:text-primary">{device.name}</span>
                        </Link>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Basic Information */}
                <TableRow>
                  <TableCell className="font-medium">Manufacturer</TableCell>
                  {devicesToCompare.map((device) => (
                    <TableCell key={`${device.id}-manufacturer`}>{device.manufacturer}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Model</TableCell>
                  {devicesToCompare.map((device) => (
                    <TableCell key={`${device.id}-model`}>{device.model}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Category</TableCell>
                  {devicesToCompare.map((device) => (
                    <TableCell key={`${device.id}-category`} className="capitalize">
                      {device.category.join(", ")}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Price</TableCell>
                  {devicesToCompare.map((device) => (
                    <TableCell key={`${device.id}-price`}>
                      ${typeof device.price.min === "string" ? device.price.min : device.price.min.toFixed(2)}
                      {device.price.min !== device.price.max &&
                        ` - ${typeof device.price.max === "string" ? device.price.max : device.price.max.toFixed(2)}`}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Specifications */}
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={devicesToCompare.length + 1} className="font-bold">
                    Specifications
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">LoRa Frequencies</TableCell>
                  {devicesToCompare.map((device) => (
                    <TableCell key={`${device.id}-lora`}>{device.specifications.lora_frequencies.join(", ")}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">LoRa Radio</TableCell>
                  {devicesToCompare.map((device) => (
                    <TableCell key={`${device.id}-lora-radio`}>{device.specifications.lora_radio ?? "N/A"}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Max TX Power</TableCell>
                  {devicesToCompare.map((device) => (
                    <TableCell key={`${device.id}-tx-power`}>
                      {formatTxPower(device.specifications.max_tx_power_dbm)}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Microcontroller</TableCell>
                  {devicesToCompare.map((device) => (
                    <TableCell key={`${device.id}-microcontroller`}>{device.specifications.microcontroller}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Power Consumption</TableCell>
                  {devicesToCompare.map((device) => (
                    <TableCell key={`${device.id}-power`}>{device.specifications.power_consumption}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Battery Type</TableCell>
                  {devicesToCompare.map((device) => (
                    <TableCell key={`${device.id}-battery-type`}>{device.specifications.battery.type}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Battery Capacity</TableCell>
                  {devicesToCompare.map((device) => (
                    <TableCell key={`${device.id}-battery-capacity`}>
                      {(typeof device.specifications.battery.capacity_mAh === "string" &&
                        device.specifications.battery.capacity_mAh.length > 0) ||
                      (typeof device.specifications.battery.capacity_mAh === "number" &&
                        device.specifications.battery.capacity_mAh > 0)
                        ? `${device.specifications.battery.capacity_mAh} mAh`
                        : "N/A"}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Estimated Runtime</TableCell>
                  {devicesToCompare.map((device) => (
                    <TableCell key={`${device.id}-runtime`}>
                      {device.specifications.battery.estimated_runtime}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Antenna</TableCell>
                  {devicesToCompare.map((device) => (
                    <TableCell key={`${device.id}-antenna`}>{device.specifications.antenna}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Interfaces</TableCell>
                  {devicesToCompare.map((device) => (
                    <TableCell key={`${device.id}-interfaces`}>{device.specifications.interfaces.join(", ")}</TableCell>
                  ))}
                </TableRow>

                {/* Features */}
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={devicesToCompare.length + 1} className="font-bold">
                    Features
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Features</TableCell>
                  {devicesToCompare.map((device) => (
                    <TableCell key={`${device.id}-features`}>{device.features.join(", ")}</TableCell>
                  ))}
                </TableRow>

                {/* Purchase Options */}
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={devicesToCompare.length + 1} className="font-bold">
                    Purchase Options
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Suppliers</TableCell>
                  {devicesToCompare.map((device) => (
                    <TableCell key={`${device.id}-suppliers`}>
                      {device.purchase_urls.map((purchase) => purchase.supplier).join(", ")}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Purchase Links</TableCell>
                  {devicesToCompare.map((device) => (
                    <TableCell key={`${device.id}-purchase-links`}>
                      <div className="flex flex-col space-y-2">
                        {device.purchase_urls.map((purchase, index) => (
                          <Button key={index} size="sm" asChild>
                            <a
                              href={purchase.url}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="flex items-center justify-between"
                            >
                              <span>Buy on {purchase.supplier}</span>
                              <ExternalLink className="h-3 w-3 ml-2" />
                            </a>
                          </Button>
                        ))}
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/mesh/devices/${device.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
