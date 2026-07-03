#!/usr/bin/env node
// List (or check) the soft-relation values a device can reference:
//   - manufacturers  -> data/mesh_manufacturers/*.json (title)
//   - suppliers      -> data/suppliers/*.json (title)
//   - features       -> the distinct strings used ACROSS existing devices,
//                       which lib/data.ts turns into filter facets. This is the
//                       authoritative vocabulary, NOT the mesh_features
//                       collection (they diverge).
//
// These are enforced by the CMS, not the JSON Schema, so `pnpm validate` will
// not catch a typo. Use this before writing a device to reuse an exact value.
//
// Usage (run from anywhere; repo root is auto-detected):
//   node .claude/skills/add-rfindex-data/list-relations.mjs
//   node .claude/skills/add-rfindex-data/list-relations.mjs "Heltec"
import { readFileSync, readdirSync, existsSync } from "node:fs";
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

function titles(dir) {
  const d = join(ROOT, "data", dir);
  if (!existsSync(d)) return [];
  return readdirSync(d)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(join(d, f), "utf8")).title)
    .filter(Boolean)
    .sort(byName);
}

function deviceFeatures() {
  const d = join(ROOT, "data", "mesh_devices");
  const set = new Set();
  for (const f of readdirSync(d).filter((x) => x.endsWith(".json"))) {
    (JSON.parse(readFileSync(join(d, f), "utf8")).features || []).forEach((x) => set.add(x));
  }
  return [...set].sort(byName);
}

const groups = [
  ["manufacturer", titles("mesh_manufacturers")],
  ["supplier", titles("suppliers")],
  ["feature", deviceFeatures()],
];

const query = process.argv[2];
if (query) {
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const q = norm(query);
  for (const [label, list] of groups) {
    const exact = list.find((v) => v === query);
    const near = list.filter((v) => v !== query && norm(v) === q);
    if (exact) console.log(`${label}: EXACT — reuse "${exact}"`);
    else if (near.length) console.log(`${label}: near match (typo?) — "${near.join('", "')}"`);
    else console.log(`${label}: no match — new value (warn & confirm before adding)`);
  }
} else {
  for (const [label, list] of groups) {
    console.log(`# ${label}s (${list.length})`);
    console.log(list.join("\n"));
    console.log("");
  }
}
