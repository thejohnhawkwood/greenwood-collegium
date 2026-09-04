import { describe, expect, it } from "vitest";
import { APP_TITLE } from "./title.js";

describe("web scaffold", () => {
  it("keeps the product title", () => {
    expect(APP_TITLE).toBe("The Greenwood Collegium");
  });
});
