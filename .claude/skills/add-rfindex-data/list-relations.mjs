#!/usr/bin/env node
// List (or check) the reference values a device relation can point at:
//   - manufacturer -> a slug from data/mesh_manufacturers/ + data/manufacturers/
//   - supplier     -> a slug from data/suppliers/
//   - feature      -> a value in the fixed enum in schemas/mesh_devices.json
//
// A device's `manufacturer` and `purchase_urls[].supplier` store the reference
// SLUG (not the display title), and `features` values must be in the schema
// enum. All three are enforced by `pnpm validate` (referential-integrity check
// for the slugs, schema enum for features). This tool exists to help you pick
// the right existing slug/value and avoid coining a duplicate, and to report
// the exact slug to write into the device JSON.
//
// Usage (run from anywhere; repo root is auto-detected):
//   node .claude/skills/add-rfindex-data/list-relations.mjs
//   node .claude/skills/add-rfindex-data/list-relations.mjs "Muzi Works"
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

function findRoot(start) {
  let dir = start;
  for (let i = 0; i < 8; i++) {
    if (existsSync(join(dir, "data", "mesh_devices"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  if (existsSync(join(process.cwd(), "data", "mesh_devices"))) return process.cwd();
  throw new Error("could not locate repo root (no data/mesh_devices found)");
}

const ROOT = findRoot(dirname(fileURLToPath(import.meta.url)));
const byName = (a, b) => a.localeCompare(b);

// Parse one JSON file, returning null (with a warning naming the file) instead
// of throwing. One malformed file mid-edit should not abort the whole tool.
function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (err) {
    console.warn(`! skipping ${path}: ${err.message}`);
    return null;
  }
}

// Collect { title, slug } pairs from one or more reference collections.
function refs(...dirs) {
  const out = [];
  for (const dir of dirs) {
    const d = join(ROOT, "data", dir);
    if (!existsSync(d)) continue;
    for (const f of readdirSync(d).filter((x) => x.endsWith(".json"))) {
      const data = readJson(join(d, f));
      if (data?.slug) out.push({ title: data.title || data.slug, slug: data.slug });
    }
  }
  return out.sort((a, b) => byName(a.slug, b.slug));
}

// The device feature vocabulary is the schema enum (the single source of truth),
// NOT the strings derived from existing devices and NOT the mesh_features
// collection.
function featureEnum() {
  const schema = readJson(join(ROOT, "schemas", "mesh_devices.json"));
  const values = schema?.properties?.features?.items?.enum || [];
  return [...values].sort(byName);
}

// Slugify the way the reference slugs are formed: fold to ASCII, lowercase,
// hyphenate. NFKD folds accented/compatibility characters so a stylized brand
// query still lands on its plain slug.
const slugify = (s) =>
  String(s)
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const manufacturers = refs("mesh_manufacturers", "manufacturers");
const suppliers = refs("suppliers");
const features = featureEnum();

const query = process.argv[2];
if (query) {
  const q = slugify(query);
  // Manufacturer/supplier: match the query's slug form against known slugs, so
  // a plain query ("Muzi Works") lands on its slug even when the stored title
  // is stylized ("muzi works").
  for (const [label, list] of [["manufacturer", manufacturers], ["supplier", suppliers]]) {
    const exact = list.find((r) => r.slug === q);
    const near = list.filter(
      (r) => r.slug !== q && (slugify(r.title) === q || r.slug.startsWith(q) || q.startsWith(r.slug)),
    );
    if (exact) console.log(`${label}: match. Use slug "${exact.slug}" (title "${exact.title}")`);
    else if (near.length) console.log(`${label}: near match? ${near.map((r) => `"${r.slug}"`).join(", ")}`);
    else console.log(`${label}: no match, new value. Warn and confirm before adding a reference file.`);
  }
  // Feature: exact/near against the enum (values are plain ASCII).
  const fnorm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");
  const fq = fnorm(query);
  const fExact = features.find((v) => v === query);
  const fNear = features.filter((v) => v !== query && fnorm(v) === fq);
  if (fExact) console.log(`feature: enum value "${fExact}"`);
  else if (fNear.length) console.log(`feature: near match (casing?) "${fNear.join('", "')}"`);
  else console.log(`feature: not in the schema enum. Needs a reviewed schema change (see SKILL.md).`);
} else {
  console.log(`# manufacturers (${manufacturers.length})  [slug then title]`);
  for (const r of manufacturers) console.log(`${r.slug}  (${r.title})`);
  console.log("");
  console.log(`# suppliers (${suppliers.length})  [slug then title]`);
  for (const r of suppliers) console.log(`${r.slug}  (${r.title})`);
  console.log("");
  console.log(`# features (${features.length})  [schemas/mesh_devices.json enum]`);
  console.log(features.join("\n"));
  console.log("");
}
