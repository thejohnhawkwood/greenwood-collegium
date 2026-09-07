import { describe, expect, it } from "vitest";
import {
  ARRIVAL_LANTERN,
  FRAME_ARRIVAL,
  FRAME_BOUGH_LEFT,
  FRAME_BOUGH_RIGHT,
  LEFT_LANTERNS,
  RIGHT_LANTERNS,
} from "./academy-frame.js";

describe("academy frame art", () => {
  it("serves the living-frame paintings from public URLs", () => {
    expect(FRAME_BOUGH_LEFT).toBe("/frame/bough-left.jpg");
    expect(FRAME_BOUGH_RIGHT).toBe("/frame/bough-right.jpg");
    expect(FRAME_ARRIVAL).toBe("/frame/arrival-students.png");
  });

  it("places a lantern glow on each painted lamp", () => {
    expect(LEFT_LANTERNS).toHaveLength(3);
    expect(RIGHT_LANTERNS).toHaveLength(3);
    expect(ARRIVAL_LANTERN.left).toBe("54.2%");
    expect(ARRIVAL_LANTERN.top).toBe("73.4%");
  });
});
