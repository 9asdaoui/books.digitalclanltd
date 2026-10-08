/**
 * Generate PNG icons from brand-mark.svg for PWA and Apple touch.
 * Run: node scripts/generate-icons.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");
const svgPath = path.join(publicDir, "brand-mark.svg");
const svg = fs.readFileSync(svgPath);

const sizes = [
  { name: "apple-touch-icon.png", size: 180 },
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
];

for (const { name, size } of sizes) {
  await sharp(svg).resize(size, size).png().toFile(path.join(publicDir, name));
  console.log(`Wrote ${name} (${size}x${size})`);
}

// favicon.ico — 48px PNG wrapped as ico via multi-size png (browsers accept png named ico often; use 32+48)
await sharp(svg).resize(48, 48).png().toFile(path.join(publicDir, "favicon.ico"));
console.log("Wrote favicon.ico");
