import { describe, expect, it } from "vitest";
import { SESSION_HELLO_EVENT, sessionHelloSchema } from "./session-hello.js";

describe("session-hello", () => {
  it("carries a process boot id and is not a sequenced game event", () => {
    expect(SESSION_HELLO_EVENT).toBe("session-hello");
    expect(sessionHelloSchema.parse({ bootId: "boot-lantern-1" }).bootId).toBe("boot-lantern-1");
    expect(sessionHelloSchema.safeParse({}).success).toBe(false);
  });
});
