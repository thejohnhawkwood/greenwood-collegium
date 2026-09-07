import { describe, expect, it } from "vitest";
import { SOCKET_TRANSPORTS, canSendCommand } from "./command-input.js";

describe("command input", () => {
  it("opens on polling first so the session cookie reaches Render before a websocket upgrade", () => {
    expect(SOCKET_TRANSPORTS).toEqual(["polling", "websocket"]);
  });

  it("sends only when the socket is connected and the line is not blank", () => {
    expect(canSendCommand("connected", "look")).toBe(true);
    expect(canSendCommand("disconnected", "look")).toBe(false);
    expect(canSendCommand("connected", "   ")).toBe(false);
  });
});
