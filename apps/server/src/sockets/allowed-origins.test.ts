import { afterEach, describe, expect, it } from "vitest";
import { allowedOrigins } from "./gateway.js";

describe("allowedOrigins", () => {
  const previousAllowed = process.env.ALLOWED_ORIGINS;
  const previousRender = process.env.RENDER_EXTERNAL_URL;

  afterEach(() => {
    if (previousAllowed === undefined) {
      delete process.env.ALLOWED_ORIGINS;
    } else {
      process.env.ALLOWED_ORIGINS = previousAllowed;
    }
    if (previousRender === undefined) {
      delete process.env.RENDER_EXTERNAL_URL;
    } else {
      process.env.RENDER_EXTERNAL_URL = previousRender;
    }
  });

  it("includes Render's public URL when present", () => {
    process.env.ALLOWED_ORIGINS = "http://localhost:5173";
    process.env.RENDER_EXTERNAL_URL = "https://greenwood-collegium.onrender.com/";
    expect(allowedOrigins()).toEqual([
      "http://localhost:5173",
      "https://greenwood-collegium.onrender.com",
    ]);
  });
});
