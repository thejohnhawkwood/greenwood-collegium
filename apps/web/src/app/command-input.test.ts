import { describe, expect, it } from "vitest";
import { SOCKET_TRANSPORTS, canSendCommand } from "./command-input.js";

describe("command input", () => {
  it("keeps polling as a fallback so guest play can connect without a raw websocket", () => {
    expect(SOCKET_TRANSPORTS).toEqual(["websocket", "polling"]);
  });

  it("sends only when the socket is connected and the line is not blank", () => {
    expect(canSendCommand("connected", "look")).toBe(true);
    expect(canSendCommand("disconnected", "look")).toBe(false);
    expect(canSendCommand("connected", "   ")).toBe(false);
  });
});
