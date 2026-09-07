import { describe, expect, it, vi } from "vitest";
import { loadSocketTicket } from "./socket-ticket.js";

describe("loadSocketTicket", () => {
  it("returns a server-issued ticket and ignores a failed read", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ticket: "play-ticket" }),
    });
    vi.stubGlobal("fetch", fetchMock);
    await expect(loadSocketTicket()).resolves.toBe("play-ticket");
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({}) });
    await expect(loadSocketTicket()).resolves.toBeUndefined();
    vi.unstubAllGlobals();
  });
});
