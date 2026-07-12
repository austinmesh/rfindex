"use client"
import type { Antenna } from "@/types/antenna"

import { useCallback, useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, Sliders, ThumbsUp, ThumbsDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { allAntennaCategories as allCategories, statusOptions } from "@/lib/data"
import { bestVswrAt915 } from "@/lib/seo"
import { AddMissingCard } from "@/components/add-missing-card"
import { parseIntParam, useUrlFilterSync } from "@/hooks/use-url-filter-sync"

type SortOption = "default" | "price-asc" | "price-desc"

// Sort values arrive as plain strings (URL params, Select onValueChange);
// anything unrecognized falls back to the default order.
function parseSortOption(value: string | null): SortOption {
  return value === "price-asc" || value === "price-desc" ? value : "default"
}

export function AntennaFilters({ antennas }: { antennas: Antenna[] }) {
  // Upper bound for the price filter, derived from the data so a newly added
  // higher-priced antenna is never silently hidden by a too-low default ceiling.
  // Rounded up to the next $10, with a $50 floor to keep a sensible minimum range.
  const maxAntennaPrice = Math.max(
    50,
    ...antennas
      .flatMap((antenna) =>
        antenna.suppliers.map((supplier) => Number.parseFloat(supplier.purchase_cost.replace(/[^0-9.]/g, ""))),
      )
      .filter((price) => !isNaN(price))
      .map((price) => Math.ceil(price / 10) * 10),
  )

  // State starts at defaults so the server render (and the static prerender)
  // emits every antenna card as a crawlable link. Real URL params are applied
  // after hydration by useUrlFilterSync (see below). Known tradeoff: a deep
  // link with filter params paints the full unfiltered grid first, then snaps
  // to the filtered subset once the mount sync runs. That is the price of
  // keeping every card in the crawlable HTML; do not "fix" it by reading
  // useSearchParams() during render here, which would deopt the route back
  // into client-side rendering and empty the static HTML (the PR-B bug).
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedConnectorTypes, setSelectedConnectorTypes] = useState<string[]>([])
  const [selectedFrequencies, setSelectedFrequencies] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<number[]>([0, maxAntennaPrice])
  const [sortOption, setSortOption] = useState<SortOption>("default")

  // Extract all unique connector types
  const allConnectorTypes = useMemo(() => {
    return Array.from(new Set(antennas.map((a) => a.connector_type))).sort()
  }, [antennas])

  // Extract all unique frequencies
  const allFrequencies = useMemo(() => {
    const freqSet = new Set<string>()
    antennas.forEach((antenna) => {
      if (Array.isArray(antenna.manufacturer.freq_spec)) {
        antenna.manufacturer.freq_spec.forEach((freq) => freqSet.add(freq))
      } else {
        // Handle legacy data where freq_spec might still be a string
        freqSet.add(antenna.manufacturer.freq_spec as string)
      }
    })
    return Array.from(freqSet).sort()
  }, [antennas])

  // Set all filter state from the given URL params. Identity-stable (its only
  // dep is the data-derived price ceiling), as useUrlFilterSync requires.
  const applyParams = useCallback((params: URLSearchParams) => {
    setSearchQuery(params.get("q") || "")
    setSelectedCategories(params.get("categories")?.split(",").filter(Boolean) || [])
    setSelectedStatuses(params.get("statuses")?.split(",").filter(Boolean) || [])
    setSelectedConnectorTypes(params.get("connectors")?.split(",").filter(Boolean) || [])
    setSelectedFrequencies(params.get("frequencies")?.split(",").filter(Boolean) || [])
    setPriceRange([parseIntParam(params.get("priceMin"), 0), parseIntParam(params.get("priceMax"), maxAntennaPrice)])
    setSortOption(parseSortOption(params.get("sort")))
  }, [maxAntennaPrice])

  // Write filter state into URL params. Recreated when filter state changes;
  // the identity change triggers the hook's URL-write effect.
  const serializeParams = useCallback((params: URLSearchParams) => {
    if (searchQuery) params.set("q", searchQuery)
    else params.delete("q")

    if (selectedCategories.length > 0) params.set("categories", selectedCategories.join(","))
    else params.delete("categories")

    if (selectedStatuses.length > 0) params.set("statuses", selectedStatuses.join(","))
    else params.delete("statuses")

    if (selectedConnectorTypes.length > 0) params.set("connectors", selectedConnectorTypes.join(","))
    else params.delete("connectors")

    if (selectedFrequencies.length > 0) params.set("frequencies", selectedFrequencies.join(","))
    else params.delete("frequencies")

    if (priceRange[0] > 0) params.set("priceMin", priceRange[0].toString())
    else params.delete("priceMin")

    if (priceRange[1] < maxAntennaPrice) params.set("priceMax", priceRange[1].toString())
    else params.delete("priceMax")

    if (sortOption !== "default") params.set("sort", sortOption)
    else params.delete("sort")
  }, [
    searchQuery,
    selectedCategories,
    selectedStatuses,
    selectedConnectorTypes,
    selectedFrequencies,
    priceRange,
    sortOption,
    maxAntennaPrice,
  ])

  // Two-way URL <-> state sync: hydrates from deep links after mount, reacts
  // to back/forward and same-route <Link> navigations, and writes filter
  // changes back to the URL. `listener` must be rendered (it is Suspense-
  // isolated so its useSearchParams() cannot deopt the static prerender).
  const { listener } = useUrlFilterSync({ applyParams, serializeParams })

  // Helper function to get the price range for an antenna
  const getAntennaPrice = (antenna: Antenna) => {
    const prices = antenna.suppliers
      .map((supplier) => Number.parseFloat(supplier.purchase_cost.replace(/[^0-9.]/g, "")))
      .filter((price) => !isNaN(price))

    if (prices.length === 0) return { min: 0, max: 0 }

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    }
  }

  // Helper function to format price display
  const formatPriceDisplay = (antenna: Antenna) => {
    const { min, max } = getAntennaPrice(antenna)

    if (min === max) {
      return `$${min.toFixed(2)}`
    }

    return `$${min.toFixed(2)} - $${max.toFixed(2)}`
  }

  // Filter antennas based on search query, categories, statuses, and price range
  const filteredAntennas = antennas.filter((antenna) => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      antenna.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      antenna.manufacturer.part_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (antenna.test_results[0]?.notes &&
        antenna.test_results[0].notes.toLowerCase().includes(searchQuery.toLowerCase()))

    // Category filter
    const matchesCategory =
      selectedCategories.length === 0 || (antenna.category && selectedCategories.includes(antenna.category))

    // Status filter (suggested or not)
    const matchesStatus =
      selectedStatuses.length === 0 ||
      (antenna.suggested !== undefined && selectedStatuses.includes(antenna.suggested.toString()))

    // Connector type filter
    const matchesConnectorType =
      selectedConnectorTypes.length === 0 || selectedConnectorTypes.includes(antenna.connector_type)

    // Frequency filter
    const matchesFrequency =
      selectedFrequencies.length === 0 ||
      (Array.isArray(antenna.manufacturer.freq_spec)
        ? antenna.manufacturer.freq_spec.some((freq) => selectedFrequencies.includes(freq))
        : selectedFrequencies.includes(antenna.manufacturer.freq_spec as string))

    // Price filter
    const { min, max } = getAntennaPrice(antenna)
    const selectedMinPrice = priceRange[0]
    const selectedMaxPrice = priceRange[1]

    // There is overlap if:
    // - The antenna's max price is >= the selected min price AND
    // - The antenna's min price is <= the selected max price
    const matchesPrice = max >= selectedMinPrice && min <= selectedMaxPrice

    return matchesSearch && matchesCategory && matchesStatus && matchesConnectorType && matchesFrequency && matchesPrice
  })

  // Sort the filtered antennas based on the selected sort option
  const sortedAntennas = [...filteredAntennas].sort((a, b) => {
    if (sortOption === "price-asc") {
      return getAntennaPrice(a).min - getAntennaPrice(b).min
    } else if (sortOption === "price-desc") {
      return getAntennaPrice(b).min - getAntennaPrice(a).min
    }
    // Default: return in original order
    return 0
  })

  // Modified toggle functions
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
  }

  const toggleConnectorType = (connectorType: string) => {
    setSelectedConnectorTypes((prev) =>
      prev.includes(connectorType) ? prev.filter((c) => c !== connectorType) : [...prev, connectorType],
    )
  }

  const toggleFrequency = (frequency: string) => {
    setSelectedFrequencies((prev) =>
      prev.includes(frequency) ? prev.filter((f) => f !== frequency) : [...prev, frequency],
    )
  }

  // Helper function to render status badge
  const renderStatusBadge = (suggested?: boolean) => {
    if (suggested === undefined) return null

    return suggested ? (
      <Badge>
        <ThumbsUp className="h-3 w-3 mr-1" /> Suggested
      </Badge>
    ) : (
      <Badge variant="destructive">
        <ThumbsDown className="h-3 w-3 mr-1" /> Not Suggested
      </Badge>
    )
  }

  // Helper function to get the best measured VSWR at 915MHz across all tests.
  // Antennas are often tested in multiple configurations (e.g. with and without
  // a ground plane); showing the best avoids surfacing an arbitrary first test.
  const getVSWR = (antenna: Antenna) => bestVswrAt915(antenna) ?? "N/A"

  // Helper function to display frequency
  const displayFrequency = (freqSpec: string | string[]) => {
    if (Array.isArray(freqSpec)) {
      return freqSpec.join(", ")
    }
    return freqSpec
  }

  return (
    <>
      {listener}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters - Desktop */}
        <div className="hidden md:block w-64 shrink-0">
          <div className="sticky top-20 space-y-6 max-h-[80vh] overflow-y-auto pr-2">
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
                    <Label htmlFor={`category-${category}`}>{category}</Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">Connector Type</h3>
              <div className="space-y-2">
                {allConnectorTypes.map((connectorType) => (
                  <div key={connectorType} className="flex items-center space-x-2">
                    <Checkbox
                      id={`connector-${connectorType}`}
                      checked={selectedConnectorTypes.includes(connectorType)}
                      onCheckedChange={() => toggleConnectorType(connectorType)}
                    />
                    <Label htmlFor={`connector-${connectorType}`}>{connectorType}</Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">Frequency</h3>
              <div className="space-y-2">
                {allFrequencies.map((frequency) => (
                  <div key={frequency} className="flex items-center space-x-2">
                    <Checkbox
                      id={`frequency-${frequency}`}
                      checked={selectedFrequencies.includes(frequency)}
                      onCheckedChange={() => toggleFrequency(frequency)}
                    />
                    <Label htmlFor={`frequency-${frequency}`}>{frequency}</Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">Status</h3>
              <div className="space-y-2">
                {statusOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${option.value}`}
                      checked={selectedStatuses.includes(option.value)}
                      onCheckedChange={() => toggleStatus(option.value)}
                    />
                    <Label htmlFor={`status-${option.value}`}>{option.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">Price Range</h3>
              <div className="flex items-center justify-between mb-6">
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
                    max={maxAntennaPrice}
                  />
                </div>
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
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>Filter antennas by category, status, and price.</SheetDescription>
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
                        <Label htmlFor={`mobile-category-${category}`}>{category}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Connector Type</h3>
                  <div className="space-y-2">
                    {allConnectorTypes.map((connectorType) => (
                      <div key={connectorType} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mobile-connector-${connectorType}`}
                          checked={selectedConnectorTypes.includes(connectorType)}
                          onCheckedChange={() => toggleConnectorType(connectorType)}
                        />
                        <Label htmlFor={`mobile-connector-${connectorType}`}>{connectorType}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Frequency</h3>
                  <div className="space-y-2">
                    {allFrequencies.map((frequency) => (
                      <div key={frequency} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mobile-frequency-${frequency}`}
                          checked={selectedFrequencies.includes(frequency)}
                          onCheckedChange={() => toggleFrequency(frequency)}
                        />
                        <Label htmlFor={`mobile-frequency-${frequency}`}>{frequency}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Status</h3>
                  <div className="space-y-2">
                    {statusOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mobile-status-${option.value}`}
                          checked={selectedStatuses.includes(option.value)}
                          onCheckedChange={() => toggleStatus(option.value)}
                        />
                        <Label htmlFor={`mobile-status-${option.value}`}>{option.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Price Range</h3>
                  <div className="flex items-center justify-between mb-6">
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
                        max={maxAntennaPrice}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Antenna listing */}
        <div className="flex-1">
          {/* Search bar */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-10 pr-4"
                aria-label="Search antennas"
                placeholder="Search antennas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          {sortedAntennas.length === 0 && (
            <div className="text-center py-8 mb-4">
              <h3 className="text-lg font-semibold">No antennas found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search query</p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedAntennas.map((antenna) => (
                <Card key={antenna.slug} className="overflow-hidden">
                  <div className="aspect-square relative">
                    <Link
                      href={`/mesh/antennas/${antenna.slug}`}
                      aria-label={antenna.title}
                      className="absolute inset-0 block"
                    >
                      <Image
                        src={
                          antenna.image ||
                          `/placeholder.svg?height=300&width=300&text=${antenna.manufacturer.part_number || "/placeholder.svg"}`
                        }
                        alt={antenna.title}
                        fill
                        className="object-contain p-4"
                      />
                    </Link>
                    <div className="absolute top-2 right-2">{renderStatusBadge(antenna.suggested)}</div>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg">
                        <Link href={`/mesh/antennas/${antenna.slug}`} className="hover:underline">
                          {antenna.title}
                        </Link>
                      </h3>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Frequency:</span>{" "}
                        {displayFrequency(antenna.manufacturer.freq_spec)}
                      </div>
                      <div>
                        <span className="text-muted-foreground">VSWR (915MHz):</span> {getVSWR(antenna)}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Connector:</span> {antenna.connector_type}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Gain:</span> {antenna.gain}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between items-center">
                    <div className="font-semibold">{formatPriceDisplay(antenna)}</div>
                    <Button asChild size="sm">
                      <Link href={`/mesh/antennas/${antenna.slug}`}>View Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            <AddMissingCard type="antenna" />
          </div>
        </div>
      </div>
    </>
  )
}
