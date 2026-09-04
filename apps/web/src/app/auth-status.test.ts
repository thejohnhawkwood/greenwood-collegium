import { describe, expect, it } from "vitest";
import { defaultAuthStatus, shouldShowAuthGate } from "./auth-status.js";

describe("shouldShowAuthGate", () => {
  it("hides the gate for guests when guest play is allowed", () => {
    expect(shouldShowAuthGate(defaultAuthStatus(), false)).toBe(false);
    expect(shouldShowAuthGate({ ...defaultAuthStatus(), allowGuestPlay: false }, false)).toBe(true);
    expect(shouldShowAuthGate(defaultAuthStatus(), true)).toBe(true);
    expect(
      shouldShowAuthGate({ signedIn: true, allowGuestPlay: false, bootstrapOpen: false }, true),
    ).toBe(false);
  });
});
