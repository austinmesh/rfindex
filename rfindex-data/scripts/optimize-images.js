const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const IMAGES_DIR = path.join(
  __dirname,
  "..",
  "data",
  "meshtastic_devices",
  "images"
);
const MAX_DIMENSION = 800;
const WEBP_QUALITY = 80;
const MAX_SIZE_BYTES = 200 * 1024; // 200KB

async function optimizeImage(filePath) {
  const absolutePath = path.resolve(filePath);
  const filename = path.basename(absolutePath);

  if (!absolutePath.endsWith(".webp")) {
    console.log(`Skipping ${filename} (not a .webp file)`);
    return { file: filename, skipped: true, reason: "not webp" };
  }

  if (!fs.existsSync(absolutePath)) {
    console.log(`Skipping ${filename} (file not found)`);
    return { file: filename, skipped: true, reason: "not found" };
  }

  const originalBuffer = fs.readFileSync(absolutePath);
  const originalSize = originalBuffer.length;

  const metadata = await sharp(originalBuffer).metadata();
  const { width, height } = metadata;

  // Determine if resize is needed (don't upscale)
  let resizeOptions = null;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    if (width >= height) {
      resizeOptions = { width: MAX_DIMENSION, withoutEnlargement: true };
    } else {
      resizeOptions = { height: MAX_DIMENSION, withoutEnlargement: true };
    }
  }

  let pipeline = sharp(originalBuffer);
  if (resizeOptions) {
    pipeline = pipeline.resize(resizeOptions);
  }
  const optimizedBuffer = await pipeline
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  const optimizedSize = optimizedBuffer.length;

  if (optimizedSize < originalSize) {
    fs.writeFileSync(absolutePath, optimizedBuffer);
    const savedKB = ((originalSize - optimizedSize) / 1024).toFixed(1);
    console.log(
      `Optimized ${filename}: ${formatSize(originalSize)} -> ${formatSize(optimizedSize)} (saved ${savedKB}KB)`
    );
    return {
      file: filename,
      optimized: true,
      originalSize,
      optimizedSize,
    };
  } else {
    console.log(
      `Skipping ${filename}: already optimal (${formatSize(originalSize)})`
    );
    return { file: filename, skipped: true, reason: "already optimal" };
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  return `${(bytes / 1024).toFixed(1)}KB`;
}

async function main() {
  const args = process.argv.slice(2);
  let files;

  if (args.length > 0) {
    // Optimize specific files passed as arguments
    files = args.map((f) => path.resolve(f));
  } else {
    // Optimize all .webp files in the images directory
    if (!fs.existsSync(IMAGES_DIR)) {
      console.error(`Images directory not found: ${IMAGES_DIR}`);
      process.exit(1);
    }
    files = fs
      .readdirSync(IMAGES_DIR)
      .filter((f) => f.endsWith(".webp"))
      .map((f) => path.join(IMAGES_DIR, f));
  }

  if (files.length === 0) {
    console.log("No .webp files to optimize.");
    return;
  }

  console.log(`Processing ${files.length} image(s)...\n`);

  let optimizedCount = 0;
  let skippedCount = 0;
  let overSizeCount = 0;

  for (const file of files) {
    const result = await optimizeImage(file);
    if (result.optimized) {
      optimizedCount++;
    } else if (result.skipped) {
      skippedCount++;
    }
  }

  // Check for files still over max size
  for (const file of files) {
    if (fs.existsSync(file)) {
      const size = fs.statSync(file).size;
      if (size > MAX_SIZE_BYTES) {
        console.error(
          `\nWARNING: ${path.basename(file)} is ${formatSize(size)} (exceeds ${formatSize(MAX_SIZE_BYTES)} limit)`
        );
        overSizeCount++;
      }
    }
  }

  console.log(
    `\nDone. Optimized: ${optimizedCount}, Skipped: ${skippedCount}, Over limit: ${overSizeCount}`
  );

  if (overSizeCount > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Error optimizing images:", err);
  process.exit(1);
});
