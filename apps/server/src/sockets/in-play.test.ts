import { describe, expect, it } from "vitest";
import { echoInPlay } from "./gateway.js";

describe("courtyard in-play echo", () => {
  it("lists only connected sockets and uses the live room", () => {
    const sockets = new Map<string, { connected: boolean }>([
      ["char-live", { connected: true }],
      ["char-grace", { connected: false }],
    ]);
    const identities = new Map([
      ["char-live", { accountId: "acct-teacher" }],
      ["char-grace", { accountId: "acct-pupil" }],
    ]);
    expect(
      echoInPlay(sockets, identities, {
        characters: {
          "char-live": { roomId: "great-hall" },
          "char-grace": { roomId: "lantern-court" },
        },
        rooms: {
          "great-hall": { title: "Great Hall" },
          "lantern-court": { title: "Lantern Court" },
        },
      }),
    ).toEqual([
      {
        characterId: "char-live",
        accountId: "acct-teacher",
        roomId: "great-hall",
        roomTitle: "Great Hall",
      },
    ]);
  });
});
