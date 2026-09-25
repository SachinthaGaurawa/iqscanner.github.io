import sharp from "sharp";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const favicon = readFileSync(join(root, "public", "favicon.svg"));
const maskable = readFileSync(join(root, "public", "icons", "maskable-source.svg"));

const jobs = [
  { src: favicon, out: "public/icons/icon-192.png", size: 192 },
  { src: favicon, out: "public/icons/icon-512.png", size: 512 },
  { src: favicon, out: "public/icons/icon-32.png", size: 32 },
  { src: favicon, out: "public/icons/icon-16.png", size: 16 },
  { src: favicon, out: "src/app/apple-icon.png", size: 180 },
  { src: maskable, out: "public/icons/icon-512-maskable.png", size: 512 },
  { src: maskable, out: "public/icons/icon-192-maskable.png", size: 192 },
];

for (const job of jobs) {
  await sharp(job.src, { density: 384 })
    .resize(job.size, job.size)
    .png()
    .toFile(join(root, job.out));
  console.log("generated", job.out);
}
