import sharp from "sharp";
import pngToIco from "png-to-ico";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const favicon = readFileSync(join(root, "public", "favicon.svg"));

const sizes = [16, 32, 48];
const pngBuffers = await Promise.all(
  sizes.map((size) => sharp(favicon, { density: 384 }).resize(size, size).png().toBuffer()),
);

const ico = await pngToIco(pngBuffers);
writeFileSync(join(root, "src", "app", "favicon.ico"), ico);
console.log("generated src/app/favicon.ico from sizes", sizes);
