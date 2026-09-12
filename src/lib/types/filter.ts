// RF filters (bandpass / low-pass) measured with a 2-port VNA. Unlike antennas
// (reflection-only .s1p), filter tests attach Touchstone .s2p files carrying
// both S11 (match) and S21 (through loss), so the computed shapes below track
// both quantities.

// Provenance for the physical unit under test, so batch-to-batch variation is
// attributable across different testers. Same shape as antennas.
export type FilterTestSample = {
  supplier?: string
  purchase_date?: string
  sample_id?: string
  batch?: string
}

export type FilterTestMetadata = {
  tester: string
  date: string
  callsign?: string
  handle?: string
  sample?: FilterTestSample
}

// A single point of a parsed 2-port sweep. Computed by the prebuild from an
// attached Touchstone (.s2p) file; never authored by hand. s21_db is the raw
// through response (negative = loss); return_loss_db derives from |S11|.
// s11_re/s11_im are the complex reflection coefficient (normalized to the
// sweep's reference impedance), kept so the Smith chart can plot the match.
export type FilterSweepPoint = {
  frequency_hz: number
  s21_db: number
  return_loss_db: number
  s11_re: number
  s11_im: number
}

// Full sweep derived from one Touchstone file. Present only in generated output.
export type FilterSweep = {
  source_file: string
  file_name: string
  reference_impedance: number
  point_count: number
  start_hz: number
  stop_hz: number
  points: FilterSweepPoint[]
}

// Computed spot measurement at an operating frequency (e.g. Meshtastic US
// 906.875 MHz). insertion_loss_db is positive (= -S21 dB).
export type FilterMarker = {
  label: string
  frequency_mhz: number
  insertion_loss_db: number
  return_loss_db: number
}

// Computed attenuation at a common interferer frequency, from the widest sweep
// covering it. rejection_db is positive (= -S21 dB); small negatives from
// measurement slop are preserved and clamped at display time.
export type FilterRejectionPoint = {
  frequency_mhz: number
  label: string
  rejection_db: number
}

// 3 dB passband, computed only when a sweep brackets both band edges.
export type FilterPassband = {
  peak_s21_db: number
  peak_mhz: number
  low_3db_mhz: number
  high_3db_mhz: number
  bandwidth_3db_mhz: number
}

// Everything the prebuild derives from one test's sweeps.
export type FilterTestSummary = {
  markers: FilterMarker[]
  passband?: FilterPassband
  rejection: FilterRejectionPoint[]
}

export type FilterTestResult = {
  // Authored: bare filenames of VNA .s2p exports placed in the filter's own
  // directory, data/mesh_filters/touchstone/<slug>/. One test result = one
  // physical unit measured over several frequency ranges.
  touchstones: string[]
  // Authored override for this test's name in the sweep comparison chart legend.
  chart_label?: string
  notes: string
  metadata: FilterTestMetadata
  // Computed by the prebuild from `touchstones`; not authored.
  sweeps?: FilterSweep[]
  summary?: FilterTestSummary
}

export type FilterManufacturer = {
  brand_name: string
  url?: string
  part_number: string
  datasheet?: string
}

export type FilterSupplier = {
  name: string
  part_number?: string
  purchase_cost: string
  url: string
}

// Height is the longest/connector-to-connector dimension as measured.
export type FilterDimensions = {
  height: number
  width: number
  depth: number
}

export type RfFilter = {
  slug: string
  title: string
  manufacturer: FilterManufacturer
  filter_type: string
  connectors: string
  suppliers?: FilterSupplier[]
  test_results: FilterTestResult[]
  suggested?: boolean
  power_handling?: string
  dimensions?: FilterDimensions
  image?: string
  description?: string
  commentary?: string
  sort_order?: number
  // Which sweep range the detail-page chart opens on, as a "start-stop" MHz
  // key (e.g. "885-930"). Optional in authored JSON; the prebuild fills it
  // with the filter's custom mid sweep when absent, so generated data always
  // carries a value.
  default_range?: string
}

export type FilterSitemapItem = {
  id: string
  name: string
  lastModified: Date
}
