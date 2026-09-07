import { describe, expect, it } from "vitest";
import {
  assertSafeLoadOrigin,
  evaluateLoadReport,
  formatLoadReport,
  percentile,
} from "./load-metrics.js";

describe("load metrics", () => {
  it("summarizes a passing classroom and refuses a Render origin", () => {
    expect(percentile([10, 20, 30, 40, 50], 50)).toBe(30);
    const report = evaluateLoadReport({
      clients: 30,
      connected: 30,
      lookAccepted: 30,
      sayAccepted: 30,
      moveAccepted: 10,
      reconnects: 5,
      rejected: 0,
      connectErrors: 0,
      lookAckMs: [12, 18, 20],
    });
    expect(report.passed).toBe(true);
    expect(formatLoadReport(report)).toContain("passed");
    expect(() => assertSafeLoadOrigin("https://greenwood-collegium.onrender.com")).toThrow(
      /Do not point/,
    );
  });
});
