import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GameTranscript } from "./GameTranscript.js";

describe("game transcript accessibility and plain text", () => {
  it("provides a named, keyboard-focusable live log without an initial jump button", () => {
    const html = renderToStaticMarkup(createElement(GameTranscript, { lines: [] }));
    expect(html).toContain('role="log"');
    expect(html).toContain('aria-label="Game transcript"');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain('aria-live="polite"');
    expect(html).not.toContain("<button");
  });

  it("preserves commands, narration, and notices as escaped plain text", () => {
    const html = renderToStaticMarkup(
      createElement(GameTranscript, {
        lines: [
          { id: "command", kind: "command", text: "look" },
          { id: "narration", kind: "narration", text: "Lantern Court\nAncient oak branches." },
          { id: "speech", kind: "narration", text: '<img src=x onerror="alert(1)">' },
          { id: "notice", kind: "notice", text: "You are disconnected." },
        ],
      }),
    );
    expect(html).toContain("&gt; look");
    expect(html).toContain("Lantern Court\nAncient oak branches.");
    expect(html).toContain("You are disconnected.");
    expect(html).toContain("&lt;img");
    expect(html).not.toContain("<img");
  });
});
