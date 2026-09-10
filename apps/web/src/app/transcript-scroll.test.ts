import { describe, expect, it } from "vitest";
import { TranscriptScroll } from "./transcript-scroll.js";

function setup() {
  const scroll = new TranscriptScroll();
  const viewport = { scrollTop: 0, scrollHeight: 1_000, clientHeight: 300 };
  scroll.entriesChanged(viewport, "initial");
  return { scroll, viewport };
}

describe("transcript reading position", () => {
  it("follows new entries when already reading the latest", () => {
    const { scroll, viewport } = setup();
    expect(viewport.scrollTop).toBe(700);
    viewport.scrollHeight = 1_200;
    expect(scroll.entriesChanged(viewport, "arrival")).toBe(false);
    expect(viewport.scrollTop).toBe(900);
  });

  it("preserves an older reading position through speech, arrivals, and notices", () => {
    const { scroll, viewport } = setup();
    viewport.scrollTop = 250;
    expect(scroll.scrolled(viewport)).toBe(false);
    for (const id of ["speech", "arrival", "notice"]) {
      viewport.scrollHeight += 100;
      expect(scroll.entriesChanged(viewport, id)).toBe(true);
      expect(viewport.scrollTop).toBe(250);
    }
    // An unrelated render or scrolling partway down does not clear unread entries.
    expect(scroll.entriesChanged(viewport, "notice")).toBe(true);
    viewport.scrollTop = 400;
    expect(scroll.scrolled(viewport)).toBe(true);
  });

  it("clears the button and resumes following when the reader scrolls to the end", () => {
    const { scroll, viewport } = setup();
    viewport.scrollTop = 100;
    scroll.scrolled(viewport);
    viewport.scrollHeight = 1_200;
    scroll.entriesChanged(viewport, "speech");
    viewport.scrollTop = 900;
    expect(scroll.scrolled(viewport)).toBe(false);
    viewport.scrollHeight += 100;
    expect(scroll.entriesChanged(viewport, "arrival")).toBe(false);
    expect(viewport.scrollTop).toBe(1_000);
  });

  it("jumps explicitly and follows subsequent messages", () => {
    const { scroll, viewport } = setup();
    viewport.scrollTop = 100;
    scroll.scrolled(viewport);
    viewport.scrollHeight = 1_200;
    scroll.entriesChanged(viewport, "speech");
    expect(scroll.jumpToLatest(viewport)).toBe(false);
    expect(viewport.scrollTop).toBe(900);
    viewport.scrollHeight = 1_400;
    expect(scroll.entriesChanged(viewport, "arrival")).toBe(false);
    expect(viewport.scrollTop).toBe(1_100);
  });

  it("does not mark unchanged entries unread and tolerates fractional scroll measurements", () => {
    const { scroll, viewport } = setup();
    viewport.scrollTop = 698.5;
    scroll.scrolled(viewport);
    viewport.scrollHeight += 100;
    expect(scroll.entriesChanged(viewport, "speech")).toBe(false);
    viewport.scrollTop = 50;
    scroll.scrolled(viewport);
    expect(scroll.entriesChanged(viewport, "speech")).toBe(false);
    expect(viewport.scrollTop).toBe(50);
  });

  it("keeps the latest visible on resize while leaving older reading positions alone", () => {
    const { scroll, viewport } = setup();
    viewport.clientHeight = 200;
    expect(scroll.resized(viewport)).toBe(false);
    expect(viewport.scrollTop).toBe(800);
    viewport.scrollTop = 100;
    scroll.scrolled(viewport);
    viewport.scrollHeight += 100;
    scroll.entriesChanged(viewport, "speech");
    viewport.clientHeight = 400;
    expect(scroll.resized(viewport)).toBe(true);
    expect(viewport.scrollTop).toBe(100);
  });

  it("handles a transcript shorter than its viewport", () => {
    const scroll = new TranscriptScroll();
    const viewport = { scrollTop: 0, scrollHeight: 100, clientHeight: 300 };
    expect(scroll.entriesChanged(viewport, "first")).toBe(false);
    expect(viewport.scrollTop).toBe(0);
  });
});
