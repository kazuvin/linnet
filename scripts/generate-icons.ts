import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, "../public");
const SVG_PATH = path.join(PUBLIC_DIR, "favicon.svg");

const svgBuffer = fs.readFileSync(SVG_PATH);

async function generateIcon(
  size: number,
  filename: string,
  padding = 0,
): Promise<void> {
  const innerSize = size - padding * 2;

  const resized = await sharp(svgBuffer)
    .resize(innerSize, innerSize, { fit: "contain", background: "transparent" })
    .png()
    .toBuffer();

  if (padding > 0) {
    await sharp(resized)
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 245, g: 243, b: 238, alpha: 1 },
      })
      .png()
      .toFile(path.join(PUBLIC_DIR, filename));
  } else {
    await sharp(svgBuffer)
      .resize(size, size, {
        fit: "contain",
        background: { r: 245, g: 243, b: 238, alpha: 1 },
      })
      .png()
      .toFile(path.join(PUBLIC_DIR, filename));
  }

  console.log(`Generated: ${filename} (${size}x${size})`);
}

async function main() {
  await generateIcon(192, "icon-192.png");
  await generateIcon(512, "icon-512.png");
  // maskable: 20% safe zone padding
  await generateIcon(512, "icon-maskable-512.png", Math.round(512 * 0.1));
  await generateIcon(180, "apple-touch-icon.png");

  console.log("All icons generated successfully!");
}

main().catch((err) => {
  console.error("Failed to generate icons:", err);
  process.exit(1);
});
