import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CommandStatus } from "./CommandStatus.js";
import { DuelPrompt } from "./DuelPrompt.js";
import type { PlayState } from "@greenwood/contracts";

describe("duel and quest status", () => {
  it("asks for a visible accept or decline", () => {
    const html = renderToStaticMarkup(
      createElement(DuelPrompt, {
        conversation: {
          npcId: "duel-challenge",
          npcName: "Moss",
          prompt: "Moss asks for a classroom duel. Both of you must agree.",
          choices: [
            { say: "1", label: "Accept the duel" },
            { say: "2", label: "Decline" },
          ],
        },
        onSend: () => {},
      }),
    );
    expect(html).toContain("Classroom duel");
    expect(html).toContain("Moss asks for a classroom duel");
    expect(html).toContain("Accept the duel");
    expect(html).toContain("Decline");
  });

  it("keeps the waiting ask and the current quest beside the command box", () => {
    const state = {
      quests: [
        {
          id: "arrival",
          title: "Arrival at the Collegium",
          status: "active",
          current: "Say hello so Porter knows you arrived.",
          steps: [],
        },
      ],
      duelAsk: { name: "Moss" },
    } as unknown as PlayState;
    const html = renderToStaticMarkup(createElement(CommandStatus, { state }));
    expect(html).toContain("Waiting for Moss to agree to a duel.");
    expect(html).toContain("Arrival at the Collegium");
    expect(html).toContain("Say hello so Porter knows you arrived.");
  });
});
