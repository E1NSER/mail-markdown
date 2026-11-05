#!/usr/bin/env node
import { execFile as runFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import * as fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const project = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const resources = path.join(project, "Resources");
const master = path.join(resources, "AppIcon-v2.svg");
const execFile = promisify(runFile);
const variants = [
  ["icon_16x16.png", 16], ["icon_16x16@2x.png", 32],
  ["icon_32x32.png", 32], ["icon_32x32@2x.png", 64],
  ["icon_128x128.png", 128], ["icon_128x128@2x.png", 256],
  ["icon_256x256.png", 256], ["icon_256x256@2x.png", 512],
  ["icon_512x512.png", 512], ["icon_512x512@2x.png", 1024],
];

async function existingFile(filename) {
  try {
    const stat = await fs.lstat(filename);
    if (!stat.isFile()) throw new Error(`Expected a regular file: ${filename}`);
    return { data: await fs.readFile(filename), mode: stat.mode & 0o777 };
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

// Stage complete files beside their destinations before changing any output.
// Renames are atomic; a failed commit restores already replaced originals.
async function replaceOutputs(outputs) {
  const token = randomUUID();
  const staged = [];
  try {
    for (const [filename, data] of outputs) {
      const original = await existingFile(filename);
      if (original?.data.equals(data)) continue;
      const next = path.join(path.dirname(filename), `.${path.basename(filename)}.${token}.next`);
      const backup = `${next}.backup`;
      const entry = { filename, next, backup, original, committed: false };
      staged.push(entry);
      await fs.writeFile(next, data, { flag: "wx", mode: original?.mode ?? 0o644 });
      if (original) await fs.writeFile(backup, original.data, { flag: "wx", mode: original.mode });
    }
    for (const entry of staged) {
      await fs.rename(entry.next, entry.filename);
      entry.committed = true;
    }
  } catch (error) {
    const rollbackErrors = [];
    for (const entry of staged.toReversed()) {
      if (!entry.committed) continue;
      try {
        if (entry.original) await fs.rename(entry.backup, entry.filename);
        else await fs.rm(entry.filename, { force: true });
      } catch (rollbackError) {
        entry.keepBackup = true;
        rollbackErrors.push(new Error(`Restore ${entry.filename} from ${entry.backup}`, { cause: rollbackError }));
      }
    }
    if (rollbackErrors.length) throw new AggregateError([error, ...rollbackErrors], "Icon update rollback needs attention.");
    throw error;
  } finally {
    await Promise.all(staged.flatMap((entry) => [
      fs.rm(entry.next, { force: true }),
      ...(entry.keepBackup ? [] : [fs.rm(entry.backup, { force: true })]),
    ]));
  }
}

async function generate() {
  if (process.platform !== "darwin") throw new Error("Icon generation requires macOS iconutil.");
  if (Number(process.versions.node.split(".")[0]) !== 24) throw new Error("Use Node.js 24.x for reproducible icon generation.");
  const require = createRequire(path.join(project, "website", "package.json"));
  let sharp;
  try {
    sharp = require("sharp");
  } catch (error) {
    throw new Error("Install the locked website dependencies first: npm --prefix website ci", { cause: error });
  }
  const svg = await fs.readFile(master);
  const metadata = await sharp(svg).metadata();
  if (metadata.format !== "svg" || metadata.width !== 1024 || metadata.height !== 1024) {
    throw new Error("The canonical SVG must have a 1024 × 1024 canvas.");
  }
  const temporary = await fs.mkdtemp(path.join(resources, ".icon-build-"));
  try {
    const iconset = path.join(temporary, "AppIcon.iconset");
    const roundtrip = path.join(temporary, "Roundtrip.iconset");
    const icns = path.join(temporary, "AppIcon.icns");
    await fs.mkdir(iconset);
    const pngs = new Map();
    for (const size of new Set(variants.map(([, size]) => size))) {
      // Rasterize the SVG at twice each target size, preserving transparency.
      const png = await sharp(svg, { density: 144 * size / 1024 })
        .resize(size, size).png({ compressionLevel: 9 }).toBuffer();
      const info = await sharp(png).metadata();
      if (info.width !== size || info.height !== size || !info.hasAlpha) throw new Error(`Invalid ${size}px PNG.`);
      pngs.set(size, png);
    }
    for (const [name, size] of variants) await fs.writeFile(path.join(iconset, name), pngs.get(size));
    await execFile("/usr/bin/iconutil", ["-c", "icns", iconset, "-o", icns]);
    await execFile("/usr/bin/iconutil", ["-c", "iconset", icns, "-o", roundtrip]);
    for (const [name, size] of variants) {
      const image = sharp(path.join(roundtrip, name));
      const info = await image.metadata();
      if (info.width !== size || info.height !== size || !info.hasAlpha) throw new Error(`Invalid ICNS roundtrip: ${name}`);
      const restored = await image.ensureAlpha().raw().toBuffer();
      // iconutil re-encodes legacy 16/32px slots, so validate decoding and the
      // transparent outer margin rather than requiring identical RGB bytes.
      if (restored.length !== size * size * 4 || restored[3] !== 0 || restored.at(-1) !== 0) {
        throw new Error(`Invalid ICNS transparency: ${name}`);
      }
    }
    if (!(await fs.readFile(master)).equals(svg)) throw new Error("The SVG changed during generation; run again.");
    const icnsData = await fs.readFile(icns);
    const outputs = new Map([
      [path.join(resources, "AppIcon.png"), pngs.get(1024)],
      [path.join(resources, "AppIcon.icns"), icnsData],
      [path.join(project, "website/public/app-icon.svg"), svg],
      [path.join(project, "website/app/icon.svg"), svg],
    ]);
    for (const [name, data] of [["AppIcon-v2.png", pngs.get(1024)], ["AppIcon-v2.icns", icnsData], ["AppIcon.svg", svg]]) {
      const filename = path.join(resources, name);
      if (await existingFile(filename)) outputs.set(filename, data);
    }
    await replaceOutputs(outputs);
    console.log(`Generated icons from Resources/AppIcon-v2.svg with sharp ${sharp.versions.sharp}; verified all 10 ICNS sizes and synchronized SVG copies.`);
  } finally {
    await fs.rm(temporary, { recursive: true, force: true });
  }
}

generate().catch((error) => {
  console.error(error.message);
  if (error instanceof AggregateError) for (const detail of error.errors) console.error(detail.message);
  process.exitCode = 1;
});
