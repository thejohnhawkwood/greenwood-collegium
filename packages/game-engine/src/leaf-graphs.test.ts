import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { LEAF_GRAPHS } from "./leaf-graphs.js";

describe("Primer leaf graphs", () => {
  it("matches the declarative content copy", () => {
    const file = join(
      dirname(fileURLToPath(import.meta.url)),
      "../../content/primer/leaf-graphs.json",
    );
    expect(JSON.parse(readFileSync(file, "utf8"))).toEqual(LEAF_GRAPHS);
  });
});
