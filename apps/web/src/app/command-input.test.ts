import { describe, expect, it } from "vitest";
import { SOCKET_TRANSPORTS, SOCKET_UPGRADE, canSendCommand } from "./command-input.js";

describe("command input", () => {
  it("stays on polling so Render and Cloudflare cannot drop a websocket upgrade", () => {
    expect(SOCKET_TRANSPORTS).toEqual(["polling"]);
    expect(SOCKET_UPGRADE).toBe(false);
  });

  it("sends only when the socket is connected and the line is not blank", () => {
    expect(canSendCommand("connected", "look")).toBe(true);
    expect(canSendCommand("disconnected", "look")).toBe(false);
    expect(canSendCommand("connected", "   ")).toBe(false);
  });
});
