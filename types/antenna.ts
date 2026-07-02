export type AntennaMarker = {
  frequency: string
  vswr: string
}

// Structured test configuration. All fields optional and free-text; use `notes`
// on the test result as the escape hatch for anything not captured here.
export type AntennaTestConfiguration = {
  ground_plane?: string
  position?: string
}

// Provenance for the physical unit under test, so batch-to-batch variation is
// attributable across different testers.
export type AntennaTestSample = {
  supplier?: string
  purchase_date?: string
  sample_id?: string
  batch?: string
}

export type AntennaTestMetadata = {
  tester: string
  date: string
  callsign?: string
  handle?: string
  sample?: AntennaTestSample
}

// A single point of a parsed sweep. Computed by the prebuild from an attached
// Touchstone (.s1p) file; never authored by hand.
export type AntennaSweepPoint = {
  frequency_hz: number
  vswr: number
  return_loss_db: number
}

// Full sweep derived from a Touchstone file. Present only in generated output.
export type AntennaSweep = {
  source_file: string
  reference_impedance: number
  point_count: number
  min_vswr: { frequency_hz: number; vswr: number }
  points: AntennaSweepPoint[]
}

export type AntennaTestResult = {
  markers: AntennaMarker[]
  notes: string
  metadata: AntennaTestMetadata
  configuration?: AntennaTestConfiguration
  // Authored: bare filename of a nanoVNA .s1p export placed in the antenna's own
  // directory, data/mesh_antennas/touchstone/<slug>/. Parsed into `sweep`.
  touchstone?: string
  // Authored override for the frequencies markers are derived at (e.g.
  // ["902MHz", "915MHz", "928MHz"]). Defaults applied by the prebuild.
  marker_frequencies?: string[]
  // Authored override for this test's name in the sweep comparison chart legend.
  // Use when the derived label (from configuration/tester) is ambiguous, e.g. two
  // tests that share a ground-plane/position but differ by some other variable.
  chart_label?: string
  // Computed by the prebuild from `touchstone`; not authored.
  sweep?: AntennaSweep
}

export type AntennaManufacturer = {
  brand_name: string
  url?: string
  part_number: string
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
  commentary?: string
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
