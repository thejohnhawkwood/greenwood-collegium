import { describe, expect, it } from "vitest";
import { isUniqueViolation } from "./postgres.js";

describe("isUniqueViolation", () => {
  it("recognizes a wrapped Postgres unique violation", () => {
    const pgError = Object.assign(new Error("duplicate key"), { code: "23505" });
    const wrapped = Object.assign(new Error("Failed query"), { cause: pgError });
    expect(isUniqueViolation(wrapped)).toBe(true);
    expect(isUniqueViolation(new Error("nope"))).toBe(false);
  });
});
