"use client"
import type { RfFilter } from "@/types/filter"

import { useCallback, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, Sliders, ThumbsUp, ThumbsDown, Scale, X, ExternalLinkIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { allFilterTypes, allFilterConnectors } from "@/lib/data"
import { bestFilterMarker, filterPassband } from "@/lib/seo"
import { AddMissingCard } from "@/components/add-missing-card"
import { ExternalLink } from "@/components/external-link"
import { FilterCompareChart } from "@/components/filter-compare-chart-lazy"
import { useUrlFilterSync } from "@/hooks/use-url-filter-sync"

type SortOption = "default" | "loss-meshtastic" | "loss-meshcore"

// Sort values arrive as plain strings (URL params, Select onValueChange);
// anything unrecognized falls back to the default order.
function parseSortOption(value: string | null): SortOption {
  return value === "loss-meshtastic" || value === "loss-meshcore" ? value : "default"
}

export function FilterBrowser({ filters }: { filters: RfFilter[] }) {
  // State starts at defaults so the server render (and the static prerender)
  // emits every filter card as a crawlable link. Real URL params are applied
  // after hydration by useUrlFilterSync; see AntennaFilters for the full
  // rationale (do not read useSearchParams() during render here).
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedConnectors, setSelectedConnectors] = useState<string[]>([])
  const [sortOption, setSortOption] = useState<SortOption>("default")

  // Comparison state
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([])
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false)

  // Set all filter state from the given URL params. Identity-stable, as
  // useUrlFilterSync requires.
  const applyParams = useCallback((params: URLSearchParams) => {
    setSearchQuery(params.get("q") || "")
    setSelectedTypes(params.get("types")?.split(",").filter(Boolean) || [])
    setSelectedConnectors(params.get("connectors")?.split(",").filter(Boolean) || [])
    setSortOption(parseSortOption(params.get("sort")))
    setSelectedForComparison(params.get("compare")?.split(",").filter(Boolean) || [])
    setIsCompareModalOpen(params.get("compareOpen") === "true")
  }, [])

  // Write filter state into URL params. Recreated when filter state changes;
  // the identity change triggers the hook's URL-write effect.
  const serializeParams = useCallback(
    (params: URLSearchParams) => {
      if (searchQuery) params.set("q", searchQuery)
      else params.delete("q")

      if (selectedTypes.length > 0) params.set("types", selectedTypes.join(","))
      else params.delete("types")

      if (selectedConnectors.length > 0) params.set("connectors", selectedConnectors.join(","))
      else params.delete("connectors")

      if (sortOption !== "default") params.set("sort", sortOption)
      else params.delete("sort")

      if (selectedForComparison.length > 0) params.set("compare", selectedForComparison.join(","))
      else params.delete("compare")

      if (isCompareModalOpen) params.set("compareOpen", "true")
      else params.delete("compareOpen")
    },
    [searchQuery, selectedTypes, selectedConnectors, sortOption, selectedForComparison, isCompareModalOpen],
  )

  const { listener } = useUrlFilterSync({ applyParams, serializeParams })

  const filtersToCompare = filters.filter((filter) => selectedForComparison.includes(filter.slug))

  const toggleComparison = (slug: string) => {
    setSelectedForComparison((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    )
  }

  const clearComparison = () => {
    setSelectedForComparison([])
    setIsCompareModalOpen(false)
  }

  const lossAt = (filter: RfFilter, label: string) =>
    bestFilterMarker(filter, label)?.insertion_loss_db ?? Number.POSITIVE_INFINITY

  const filteredFilters = filters.filter((filter) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      q === "" ||
      filter.title.toLowerCase().includes(q) ||
      filter.manufacturer.brand_name.toLowerCase().includes(q) ||
      filter.manufacturer.part_number.toLowerCase().includes(q)

    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(filter.filter_type)

    const matchesConnectors =
      selectedConnectors.length === 0 || selectedConnectors.includes(filter.connectors)

    return matchesSearch && matchesType && matchesConnectors
  })

  const sortedFilters = [...filteredFilters].sort((a, b) => {
    if (sortOption === "loss-meshtastic") return lossAt(a, "Meshtastic") - lossAt(b, "Meshtastic")
    if (sortOption === "loss-meshcore") return lossAt(a, "MeshCore") - lossAt(b, "MeshCore")
    return 0
  })

  const toggleType = (type: string) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  const toggleConnectors = (connectors: string) => {
    setSelectedConnectors((prev) =>
      prev.includes(connectors) ? prev.filter((c) => c !== connectors) : [...prev, connectors],
    )
  }

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

  const formatLoss = (filter: RfFilter, label: string) => {
    const marker = bestFilterMarker(filter, label)
    return marker ? `${marker.insertion_loss_db.toFixed(2)} dB` : "N/A"
  }

  // Return loss at a single operating frequency (used in the comparison table,
  // where each frequency gets its own row).
  const formatMarkerReturnLoss = (filter: RfFilter, label: string) => {
    const marker = bestFilterMarker(filter, label)
    return marker ? `${marker.return_loss_db.toFixed(1)} dB` : "N/A"
  }

  // Best (highest) measured return loss at either mesh operating frequency. A
  // single-frequency filter (e.g. one tuned to MeshCore) is judged at the
  // frequency it is for.
  const formatReturnLoss = (filter: RfFilter) => {
    const markers = [bestFilterMarker(filter, "Meshtastic"), bestFilterMarker(filter, "MeshCore")].filter(
      (m): m is NonNullable<typeof m> => m !== null,
    )
    if (!markers.length) return "N/A"
    const best = markers.reduce((a, b) => (a.return_loss_db >= b.return_loss_db ? a : b))
    return `${best.return_loss_db.toFixed(1)} dB`
  }

  const formatBandwidth = (filter: RfFilter) => {
    const pb = filterPassband(filter)
    return pb ? `${pb.bandwidth_3db_mhz} MHz` : "N/A"
  }

  const facets = (idPrefix: string) => (
    <>
      <div>
        <h3 className="font-semibold mb-3">Sort By</h3>
        <Select value={sortOption} onValueChange={(value) => setSortOption(parseSortOption(value))}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a sort option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="loss-meshtastic">Loss at Meshtastic freq</SelectItem>
            <SelectItem value="loss-meshcore">Loss at MeshCore freq</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-3">Filter Type</h3>
        <div className="space-y-2">
          {allFilterTypes.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`${idPrefix}type-${type}`}
                checked={selectedTypes.includes(type)}
                onCheckedChange={() => toggleType(type)}
              />
              <Label htmlFor={`${idPrefix}type-${type}`}>{type}</Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-3">Connectors</h3>
        <div className="space-y-2">
          {allFilterConnectors.map((connectors) => (
            <div key={connectors} className="flex items-center space-x-2">
              <Checkbox
                id={`${idPrefix}connectors-${connectors}`}
                checked={selectedConnectors.includes(connectors)}
                onCheckedChange={() => toggleConnectors(connectors)}
              />
              <Label htmlFor={`${idPrefix}connectors-${connectors}`}>{connectors}</Label>
            </div>
          ))}
        </div>
      </div>
    </>
  )

  return (
    <>
      {listener}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Facets - Desktop */}
        <div className="hidden md:block w-64 shrink-0">
          <div className="sticky top-20 space-y-6 max-h-[80vh] overflow-y-auto pr-2">{facets("")}</div>
        </div>

        {/* Facets - Mobile */}
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
                <SheetDescription>Narrow the list by filter type and connectors.</SheetDescription>
              </SheetHeader>
              <div className="space-y-6 py-4">{facets("mobile-")}</div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Filter listing */}
        <div className="flex-1">
          {/* Search bar + compare bar */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-10 pr-4"
                aria-label="Search filters"
                placeholder="Search filters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border bg-background px-4 py-2 shadow-sm">
              <div className="flex items-center">
                {selectedForComparison.length > 0 ? (
                  <>
                    <span className="mr-2 font-medium">
                      {selectedForComparison.length} selected
                    </span>
                    <Button variant="outline" size="sm" onClick={clearComparison}>
                      Clear
                    </Button>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">Select to compare</span>
                )}
              </div>
              <Button
                onClick={() => setIsCompareModalOpen(true)}
                disabled={selectedForComparison.length < 2}
                size="sm"
              >
                Compare
              </Button>
            </div>
          </div>
          {sortedFilters.length === 0 && (
            <div className="text-center py-8 mb-4">
              <h3 className="text-lg font-semibold">No filters found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search query</p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedFilters.map((filter) => (
              <Card key={filter.slug} className="overflow-hidden group">
                <div className="aspect-square relative">
                  <Link
                    href={`/mesh/filters/${filter.slug}`}
                    aria-label={filter.title}
                    className="absolute inset-0 block"
                  >
                    <Image
                      src={
                        filter.image ||
                        `/placeholder.svg?height=300&width=300&text=${filter.manufacturer.part_number || "/placeholder.svg"}`
                      }
                      alt={filter.title}
                      fill
                      className="object-contain p-4"
                    />
                  </Link>
                  <div className="absolute top-2 left-2 flex items-center rounded bg-transparent px-1 py-0.5 group-hover:bg-white/90">
                    <Checkbox
                      id={`compare-${filter.slug}`}
                      aria-label={`Compare ${filter.title}`}
                      checked={selectedForComparison.includes(filter.slug)}
                      onCheckedChange={() => toggleComparison(filter.slug)}
                      className="h-5 w-5 border-gray-400 bg-white/90"
                    />
                    <label
                      htmlFor={`compare-${filter.slug}`}
                      className="ml-1 cursor-pointer text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      Compare
                    </label>
                  </div>
                  <div className="absolute top-2 right-2">{renderStatusBadge(filter.suggested)}</div>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">
                      <Link href={`/mesh/filters/${filter.slug}`} className="hover:underline">
                        {filter.title}
                      </Link>
                    </h3>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span> {filter.filter_type}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Connectors:</span> {filter.connectors}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Meshtastic loss:</span> {formatLoss(filter, "Meshtastic")}
                    </div>
                    <div>
                      <span className="text-muted-foreground">MeshCore loss:</span> {formatLoss(filter, "MeshCore")}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Return loss:</span> {formatReturnLoss(filter)}
                    </div>
                    <div>
                      <span className="text-muted-foreground">3 dB bandwidth:</span> {formatBandwidth(filter)}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-end items-center">
                  <Button asChild size="sm">
                    <Link href={`/mesh/filters/${filter.slug}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
            <AddMissingCard type="filter" />
          </div>
        </div>
      </div>

      {/* Mobile: floating compare button */}
      {selectedForComparison.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40 sm:hidden">
          <Button
            onClick={() => setIsCompareModalOpen(true)}
            disabled={selectedForComparison.length < 2}
            size="lg"
            variant="outline"
            className="relative flex h-14 w-14 items-center justify-center rounded-full p-0 shadow-lg"
          >
            <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {selectedForComparison.length}
            </span>
            <Scale size={32} strokeWidth={1} className="!h-8 !w-8" />
          </Button>
        </div>
      )}

      {/* Comparison modal */}
      <Dialog open={isCompareModalOpen} onOpenChange={setIsCompareModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-[90vw] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Compare Filters</span>
              <Button variant="secondary" size="sm" className="mr-3" onClick={clearComparison}>
                <X className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            </DialogTitle>
            <DialogDescription>Comparing {filtersToCompare.length} filters</DialogDescription>
          </DialogHeader>

          {/* All selected filters' measured insertion loss on one chart */}
          <div className="mb-6">
            <FilterCompareChart filters={filtersToCompare} />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Specification</TableHead>
                  {filtersToCompare.map((filter) => (
                    <TableHead key={filter.slug} className="min-w-[180px]">
                      <div className="flex flex-col items-center">
                        <Link href={`/mesh/filters/${filter.slug}`} className="group">
                          <div className="relative mb-2 h-20 w-20 overflow-hidden rounded-md group-hover:ring-2 group-hover:ring-primary">
                            <Image
                              src={
                                filter.image ||
                                `/placeholder.svg?height=80&width=80&text=${filter.manufacturer.part_number}`
                              }
                              alt={filter.title}
                              fill
                              className="object-contain p-1"
                            />
                          </div>
                          <span className="font-bold group-hover:text-primary">{filter.title}</span>
                        </Link>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Brand</TableCell>
                  {filtersToCompare.map((filter) => (
                    <TableCell key={`${filter.slug}-brand`}>{filter.manufacturer.brand_name}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Part Number</TableCell>
                  {filtersToCompare.map((filter) => (
                    <TableCell key={`${filter.slug}-part`}>{filter.manufacturer.part_number}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Filter Type</TableCell>
                  {filtersToCompare.map((filter) => (
                    <TableCell key={`${filter.slug}-type`}>{filter.filter_type}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Connectors</TableCell>
                  {filtersToCompare.map((filter) => (
                    <TableCell key={`${filter.slug}-connectors`}>{filter.connectors}</TableCell>
                  ))}
                </TableRow>

                {/* Measured performance */}
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={filtersToCompare.length + 1} className="font-bold">
                    Measured Performance
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Loss at Meshtastic (906.875 MHz)</TableCell>
                  {filtersToCompare.map((filter) => (
                    <TableCell key={`${filter.slug}-loss-mt`}>{formatLoss(filter, "Meshtastic")}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Loss at MeshCore (910.525 MHz)</TableCell>
                  {filtersToCompare.map((filter) => (
                    <TableCell key={`${filter.slug}-loss-mc`}>{formatLoss(filter, "MeshCore")}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Return Loss at Meshtastic</TableCell>
                  {filtersToCompare.map((filter) => (
                    <TableCell key={`${filter.slug}-rl-mt`}>{formatMarkerReturnLoss(filter, "Meshtastic")}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Return Loss at MeshCore</TableCell>
                  {filtersToCompare.map((filter) => (
                    <TableCell key={`${filter.slug}-rl-mc`}>{formatMarkerReturnLoss(filter, "MeshCore")}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">3 dB Passband</TableCell>
                  {filtersToCompare.map((filter) => {
                    const pb = filterPassband(filter)
                    return (
                      <TableCell key={`${filter.slug}-passband`}>
                        {pb ? `${pb.low_3db_mhz}-${pb.high_3db_mhz} MHz (${pb.bandwidth_3db_mhz} MHz)` : "N/A"}
                      </TableCell>
                    )
                  })}
                </TableRow>

                {/* Physical */}
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={filtersToCompare.length + 1} className="font-bold">
                    Physical
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Power Handling</TableCell>
                  {filtersToCompare.map((filter) => (
                    <TableCell key={`${filter.slug}-power`}>{filter.power_handling ?? "N/A"}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Dimensions</TableCell>
                  {filtersToCompare.map((filter) => (
                    <TableCell key={`${filter.slug}-dims`}>
                      {filter.dimensions
                        ? `${filter.dimensions.height} x ${filter.dimensions.width} x ${filter.dimensions.depth} mm`
                        : "N/A"}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Purchase */}
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={filtersToCompare.length + 1} className="font-bold">
                    Links
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Buy / Details</TableCell>
                  {filtersToCompare.map((filter) => (
                    <TableCell key={`${filter.slug}-links`}>
                      <div className="flex flex-col space-y-2">
                        {(filter.suppliers ?? []).map((supplier, index) => (
                          <Button key={index} variant="outline" size="sm" className="border-primary" asChild>
                            <ExternalLink href={supplier.url} className="flex items-center justify-between">
                              <span>Buy from {supplier.name}</span>
                              <ExternalLinkIcon className="ml-2 h-3 w-3" />
                            </ExternalLink>
                          </Button>
                        ))}
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/mesh/filters/${filter.slug}`}>View Details</Link>
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
