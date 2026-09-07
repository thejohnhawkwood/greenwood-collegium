import { afterEach, describe, expect, it } from "vitest";
import { allowedOrigins, isAllowedBrowserOrigin, isPrivateLanOrigin } from "./gateway.js";

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

  it("treats RFC1918 http origins as private LAN", () => {
    expect(isPrivateLanOrigin("http://192.168.50.32:3000")).toBe(true);
    expect(isPrivateLanOrigin("http://10.0.0.8:3000")).toBe(true);
    expect(isPrivateLanOrigin("http://172.16.4.2:3000")).toBe(true);
    expect(isPrivateLanOrigin("https://192.168.50.32:3000")).toBe(false);
    expect(isPrivateLanOrigin("http://8.8.8.8:3000")).toBe(false);
  });

  it("allows home-LAN browsers only outside production", () => {
    expect(isAllowedBrowserOrigin("http://192.168.50.32:3000", false)).toBe(true);
    expect(isAllowedBrowserOrigin("http://192.168.50.32:3000", true)).toBe(false);
    expect(isAllowedBrowserOrigin("https://evil.example", false)).toBe(false);
  });
});
