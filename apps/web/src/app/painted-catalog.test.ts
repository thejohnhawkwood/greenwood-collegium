import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { inflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { FX_FILES } from "./combat-fx.js";
import { NPC_PLATE_FILES } from "./npc-plates.js";
import { OBJECT_PLATE_FILES } from "./object-plates.js";
import { COLLEGIUM_ROOM_PLATES } from "./room-plates.js";
import {
  APPEARANCE_ACCESSORIES,
  APPEARANCE_BUILDS,
  APPEARANCE_CLOTHING,
  APPEARANCE_EARS,
  APPEARANCE_FACES,
  APPEARANCE_MARKINGS,
  APPEARANCE_MUZZLES,
} from "@greenwood/contracts";
import { KNOWN_SPECIES, SPECIES_FIT } from "./portrait-layers.js";

const artRoot = join(dirname(fileURLToPath(import.meta.url)), "../../public/art");

const rooms = COLLEGIUM_ROOM_PLATES.map((room) => room.id);

function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function lookHasPaperFrame(path: string): boolean {
  const buf = readFileSync(path);
  let offset = 8;
  let width = 0;
  let height = 0;
  const parts: Buffer[] = [];
  while (offset + 8 <= buf.length) {
    const length = buf.readUInt32BE(offset);
    const type = buf.subarray(offset + 4, offset + 8).toString("ascii");
    const data = buf.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      if (data[8] !== 8 || data[9] !== 6) return false;
    } else if (type === "IDAT") {
      parts.push(data);
    } else if (type === "IEND") {
      break;
    }
    offset += 12 + length;
  }
  const raw = inflateSync(Buffer.concat(parts));
  const stride = width * 4;
  const prev = Buffer.alloc(stride);
  const row = Buffer.alloc(stride);
  let src = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[src++];
    const filtered = raw.subarray(src, src + stride);
    src += stride;
    for (let i = 0; i < stride; i++) {
      const left = i >= 4 ? row[i - 4] : 0;
      const up = prev[i];
      const upLeft = i >= 4 ? prev[i - 4] : 0;
      const recon =
        filter === 0
          ? filtered[i]
          : filter === 1
            ? (filtered[i] + left) & 255
            : filter === 2
              ? (filtered[i] + up) & 255
              : filter === 3
                ? (filtered[i] + Math.floor((left + up) / 2)) & 255
                : (filtered[i] + paeth(left, up, upLeft)) & 255;
      row[i] = recon;
    }
    let paper = 0;
    for (let x = 0; x < width; x++) {
      const red = row[x * 4];
      const green = row[x * 4 + 1];
      const blue = row[x * 4 + 2];
      const alpha = row[x * 4 + 3];
      if (
        alpha >= 8 &&
        red >= 220 &&
        green >= 218 &&
        blue >= 208 &&
        Math.min(red, green, blue) >= 200
      ) {
        paper += 1;
      }
    }
    if (paper >= width - 2) return true;
    row.copy(prev);
  }
  return false;
}

describe("painted catalog files", () => {
  it("keeps a complete look paint for every species, gender and look", () => {
    for (const species of KNOWN_SPECIES) {
      for (const gender of ["female", "male"] as const) {
        for (const look of APPEARANCE_CLOTHING) {
          expect(
            existsSync(join(artRoot, "characters/looks", `${species}-${gender}-${look}.png`)),
          ).toBe(true);
        }
      }
    }
  });
  it("keeps a body paint for every species, gender and build", () => {
    for (const species of KNOWN_SPECIES) {
      for (const gender of ["female", "male"] as const) {
        for (const build of APPEARANCE_BUILDS) {
          expect(
            existsSync(join(artRoot, "characters/bodies", `${species}-${gender}-${build}.png`)),
          ).toBe(true);
        }
      }
    }
  });
  it("keeps shared clothing, face, and accessory layers", () => {
    const fits = [...new Set(Object.values(SPECIES_FIT))];
    for (const fit of fits) {
      for (const clothing of APPEARANCE_CLOTHING) {
        expect(existsSync(join(artRoot, "characters/clothing", `${fit}-${clothing}.png`))).toBe(
          true,
        );
      }
    }
    for (const marking of APPEARANCE_MARKINGS.filter((value) => value !== "plain")) {
      expect(existsSync(join(artRoot, "characters/markings", `${marking}.png`))).toBe(true);
    }
    for (const muzzle of APPEARANCE_MUZZLES) {
      expect(existsSync(join(artRoot, "characters/muzzles", `shared-${muzzle}.png`))).toBe(true);
    }
    for (const ears of APPEARANCE_EARS) {
      expect(existsSync(join(artRoot, "characters/ears", `shared-${ears}.png`))).toBe(true);
    }
    for (const face of APPEARANCE_FACES) {
      expect(existsSync(join(artRoot, "characters/faces", `${face}.png`))).toBe(true);
    }
    for (const accessory of APPEARANCE_ACCESSORIES.filter((value) => value !== "none")) {
      expect(existsSync(join(artRoot, "characters/accessories", `${accessory}.png`))).toBe(true);
    }
  });
  it("keeps look plates free of leftover paper-white frames", () => {
    const looks = join(artRoot, "characters/looks");
    for (const name of readdirSync(looks).filter((file) => file.endsWith(".png"))) {
      expect(lookHasPaperFrame(join(looks, name)), name).toBe(false);
    }
  });
  it("keeps NPC and foe plates free of leftover paper-white frames", () => {
    const npcs = join(artRoot, "characters/npcs");
    for (const name of readdirSync(npcs).filter((file) => file.endsWith(".png"))) {
      expect(lookHasPaperFrame(join(npcs, name)), name).toBe(false);
    }
  });
  it("keeps a unique painted plate for every speaking NPC and the dummy", () => {
    expect(NPC_PLATE_FILES).toHaveLength(16);
    for (const id of NPC_PLATE_FILES) {
      const path = join(artRoot, "characters/npcs", `${id}.png`);
      expect(existsSync(path)).toBe(true);
      expect(statSync(path).size).toBeGreaterThan(20_000);
    }
  });
  it("keeps a unique painted plate for every clickable room object and takeable item", () => {
    expect(OBJECT_PLATE_FILES).toHaveLength(39);
    for (const id of OBJECT_PLATE_FILES) {
      const path = join(artRoot, "objects", `${id}.png`);
      expect(existsSync(path)).toBe(true);
      expect(statSync(path).size).toBeGreaterThan(15_000);
    }
  });
  it("keeps a punched overlay for every combat FX plate", () => {
    expect(FX_FILES).toHaveLength(27);
    for (const id of FX_FILES) {
      const path = join(artRoot, "fx", `${id}.png`);
      expect(existsSync(path), id).toBe(true);
      expect(statSync(path).size).toBeGreaterThan(4_000);
    }
  });
  it("keeps a painted plate for every Collegium room", () => {
    expect(rooms).toHaveLength(32);
    for (const room of rooms) {
      const path = join(artRoot, "rooms", `${room}.png`);
      expect(existsSync(path)).toBe(true);
      expect(statSync(path).size).toBeGreaterThan(80_000);
    }
  });
});
