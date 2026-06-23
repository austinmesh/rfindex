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

let failures = 0;
let total = 0;

for (const [name, { schema, dir }] of Object.entries(collections)) {
  const schemaPath = path.join(ROOT, "schemas", schema);
  const schemaData = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  const validate = ajv.compile(schemaData);

  const dataDir = path.join(ROOT, "data", dir);
  const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    total++;
    const filePath = path.join(dataDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    if (!validate(data)) {
      failures++;
      console.error(`FAIL: data/${dir}/${file}`);
      for (const err of validate.errors) {
        console.error(`  ${err.instancePath || "/"}: ${err.message}`);
      }
    }
  }
}

console.log(`\nValidated ${total} files across ${Object.keys(collections).length} collections.`);

if (failures > 0) {
  console.error(`${failures} file(s) failed validation.`);
  process.exit(1);
} else {
  console.log("All files passed.");
}
