const Ajv = require("ajv");
const fs = require("fs");
const path = require("path");

const ajv = new Ajv({ allErrors: true });

const ROOT = path.resolve(__dirname, "..");

const collections = {
  bands:                    { schema: "bands.json",                    dir: "bands" },
  manufacturers:            { schema: "manufacturers.json",            dir: "manufacturers" },
  meshtastic_manufacturers: { schema: "meshtastic_manufacturers.json", dir: "meshtastic_manufacturers" },
  suppliers:                { schema: "suppliers.json",                dir: "suppliers" },
  modulations:              { schema: "modulations.json",              dir: "modulations" },
  antenna_connectors:       { schema: "antenna_connectors.json",       dir: "antenna_connectors" },
  radios:                   { schema: "radios.json",                   dir: "radios" },
  meshtastic_features:      { schema: "meshtastic_features.json",      dir: "meshtastic_features" },
  meshtastic_antennas:      { schema: "meshtastic_antennas.json",      dir: "meshtastic_antennas" },
  meshtastic_devices:       { schema: "meshtastic_devices.json",       dir: "meshtastic_devices" },
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
let total = 0;

for (const [name, { schema, dir }] of Object.entries(collections)) {
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

    if (!validate(data)) {
      console.error(`FAIL: ${rel}`);
      for (const err of validate.errors) {
        console.error(`  ${err.instancePath || "/"}: ${err.message}`);
      }
      failedFiles.push(rel);
    }
  }
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
