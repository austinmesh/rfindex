const Ajv = require("ajv");
const fs = require("fs");
const path = require("path");

const ajv = new Ajv({ allErrors: true });

const ROOT = path.resolve(__dirname, "..");

const collections = {
  bands:                    { schema: "bands.json",                    dir: "bands" },
  manufacturers:            { schema: "manufacturers.json",            dir: "manufacturers" },
  mesh_manufacturers:       { schema: "mesh_manufacturers.json",       dir: "mesh_manufacturers" },
  suppliers:                { schema: "suppliers.json",                dir: "suppliers" },
  modulations:              { schema: "modulations.json",              dir: "modulations" },
  antenna_connectors:       { schema: "antenna_connectors.json",       dir: "antenna_connectors" },
  radios:                   { schema: "radios.json",                   dir: "radios" },
  mesh_features:            { schema: "mesh_features.json",            dir: "mesh_features" },
  mesh_antennas:            { schema: "mesh_antennas.json",            dir: "mesh_antennas" },
  mesh_devices:             { schema: "mesh_devices.json",             dir: "mesh_devices" },
};

// Convert a character offset in `raw` into a 1-based line/column.
function lineColFromPos(raw, pos) {
  let line = 1;
  let col = 1;
  for (let i = 0; i < pos && i < raw.length; i++) {
    if (raw[i] === "\n") {
      line++;
      col = 1;
    } else {
      col++;
    }
  }
  return { line, col };
}

// Best-effort location for a JSON.parse SyntaxError. Node's message format
// varies by version: some include "at position N", some include
// "(line X column Y)", and some (e.g. trailing-comma errors) include neither.
function locateJsonError(raw, err) {
  const msg = err.message || "";

  const lc = /line (\d+) column (\d+)/.exec(msg);
  if (lc) return ` (line ${lc[1]}, col ${lc[2]})`;

  const pos = /position (\d+)/.exec(msg);
  if (pos) {
    const { line, col } = lineColFromPos(raw, Number(pos[1]));
    return ` (line ${line}, col ${col})`;
  }

  // Fallback: a trailing comma (comma immediately before } or ]) is by far the
  // most common hand-edit mistake and is what triggers the position-less
  // "Unexpected token ']'" style messages on newer Node.
  const trailingComma = /,(\s*[}\]])/.exec(raw);
  if (trailingComma) {
    const { line, col } = lineColFromPos(raw, trailingComma.index);
    return ` (line ${line}, col ${col} — likely a trailing comma)`;
  }

  return "";
}

const failedFiles = [];
// Retain every successfully-parsed file per collection so the cross-file checks
// below (uniqueness, image existence, referential integrity) can run after the
// per-file schema pass.
const parsed = {};
let total = 0;

for (const [name, { schema, dir }] of Object.entries(collections)) {
  parsed[name] = [];
  const schemaPath = path.join(ROOT, "schemas", schema);

  let schemaData;
  try {
    schemaData = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  } catch (err) {
    console.error(`INVALID SCHEMA: schemas/${schema}`);
    console.error(`  ${err.message}`);
    failedFiles.push(`schemas/${schema}`);
    continue;
  }
  const validate = ajv.compile(schemaData);

  const dataDir = path.join(ROOT, "data", dir);
  const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    total++;
    const rel = `data/${dir}/${file}`;
    const filePath = path.join(dataDir, file);
    const raw = fs.readFileSync(filePath, "utf8");

    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      console.error(`INVALID JSON: ${rel}${locateJsonError(raw, err)}`);
      console.error(`  ${err.message}`);
      failedFiles.push(rel);
      continue;
    }

    parsed[name].push({ file: rel, data });

    if (!validate(data)) {
      console.error(`FAIL: ${rel}`);
      for (const err of validate.errors) {
        console.error(`  ${err.instancePath || "/"}: ${err.message}`);
      }
      failedFiles.push(rel);
    }
  }
}

// --- Cross-file integrity checks (contributor guardrails) ---
// These catch classes of error that per-file schema validation cannot see: two
// files claiming the same id, an image reference with no file on disk, or a
// manufacturer/supplier that no reference collection knows about.

const refName = (x) => x.data.title ?? x.data.name ?? x.data.id ?? x.data.slug;

// 1. id / slug uniqueness (FATAL). Detail routes resolve by first-match .find(),
//    so a duplicate silently shadows another page at the same URL and doubles a
//    sitemap entry. Filenames do not equal ids, so the filesystem is no guard.
function checkUnique(items, keyField) {
  const seen = new Map();
  for (const { file, data } of items) {
    const key = data[keyField];
    if (key == null) continue; // presence is enforced by the per-file schema
    if (seen.has(key)) {
      console.error(`DUPLICATE ${keyField}: "${key}" in ${file} (already used by ${seen.get(key)})`);
      failedFiles.push(file);
    } else {
      seen.set(key, file);
    }
  }
}
checkUnique(parsed.mesh_devices, "id");
checkUnique(parsed.mesh_antennas, "slug");

// 2. Image existence (FATAL). A referenced image must exist as source under
//    data/<collection>/images/ (the prebuild copies these into public/). The
//    image field is optional, so this only fires when one is present.
function checkImages(items, imagesRel) {
  for (const { file, data } of items) {
    if (!data.image) continue;
    const base = String(data.image).split("/").pop();
    if (!fs.existsSync(path.join(ROOT, imagesRel, base))) {
      console.error(`MISSING IMAGE: ${file} references "${data.image}" but ${imagesRel}/${base} is not on disk`);
      failedFiles.push(file);
    }
  }
}
checkImages(parsed.mesh_devices, "data/mesh_devices/images");
checkImages(parsed.mesh_antennas, "data/mesh_antennas/images");

// 3. Referential integrity (WARNING, not yet fatal). Every device manufacturer
//    and purchase-URL supplier should resolve to a reference collection. The
//    live data currently has known drift (casing splits, a few missing brands),
//    so this warns rather than failing. Once the reference collections are
//    backfilled and normalized (architecture review, item 14), promote these to
//    failedFiles.push(...) to turn drift into a red check.
const manufacturerRef = new Set(
  [...parsed.mesh_manufacturers, ...parsed.manufacturers].map(refName).filter(Boolean),
);
const supplierRef = new Set(parsed.suppliers.map(refName).filter(Boolean));
let refWarnings = 0;
for (const { file, data } of parsed.mesh_devices) {
  if (data.manufacturer && !manufacturerRef.has(data.manufacturer)) {
    console.warn(`  ~ ${file}: manufacturer "${data.manufacturer}" is not in mesh_manufacturers/manufacturers`);
    refWarnings++;
  }
  for (const p of data.purchase_urls || []) {
    if (p.supplier && !supplierRef.has(p.supplier)) {
      console.warn(`  ~ ${file}: supplier "${p.supplier}" is not in suppliers`);
      refWarnings++;
    }
  }
}
if (refWarnings > 0) {
  console.warn(
    `\n${refWarnings} referential-integrity warning(s). Not fatal yet; backfill the reference collections, then promote to errors.`,
  );
}

console.log(`\nValidated ${total} files across ${Object.keys(collections).length} collections.`);

if (failedFiles.length > 0) {
  console.error(`\n${failedFiles.length} file(s) failed validation:`);
  for (const f of failedFiles) {
    console.error(`  - ${f}`);
  }
  process.exit(1);
} else {
  console.log("All files passed.");
}
