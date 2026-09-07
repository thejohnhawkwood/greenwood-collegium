export type LatencySummary = {
  p50: number;
  p95: number;
};

export type ClassroomLoadReport = {
  clients: number;
  connected: number;
  lookAccepted: number;
  sayAccepted: number;
  moveAccepted: number;
  reconnects: number;
  rejected: number;
  connectErrors: number;
  lookAckMs: LatencySummary;
  passed: boolean;
};

export function percentile(samples: readonly number[], p: number): number {
  if (samples.length === 0) {
    return 0;
  }
  const sorted = [...samples].sort((left, right) => left - right);
  const rank = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[rank] ?? 0;
}

export function summarizeLatency(samples: readonly number[]): LatencySummary {
  return {
    p50: percentile(samples, 50),
    p95: percentile(samples, 95),
  };
}

export function evaluateLoadReport(
  report: Omit<ClassroomLoadReport, "passed" | "lookAckMs"> & { lookAckMs: readonly number[] },
): ClassroomLoadReport {
  const lookAckMs = summarizeLatency(report.lookAckMs);
  const passed =
    report.connected === report.clients &&
    report.lookAccepted === report.clients &&
    report.sayAccepted === report.clients &&
    report.connectErrors === 0 &&
    report.rejected === 0;
  return { ...report, lookAckMs, passed };
}

export function formatLoadReport(report: ClassroomLoadReport): string {
  return [
    `Classroom load: ${String(report.clients)} clients`,
    `  connected ${String(report.connected)}  look ${String(report.lookAccepted)}  say ${String(report.sayAccepted)}  move ${String(report.moveAccepted)}`,
    `  reconnects ${String(report.reconnects)}  rejected ${String(report.rejected)}  connect errors ${String(report.connectErrors)}`,
    `  look ack p50 ${String(report.lookAckMs.p50)} ms  p95 ${String(report.lookAckMs.p95)} ms`,
    report.passed ? "  passed" : "  failed",
  ].join("\n");
}

export function assertSafeLoadOrigin(origin: string): void {
  const host = new URL(origin).hostname.toLowerCase();
  if (host.endsWith("onrender.com")) {
    throw new Error("Do not point the classroom load simulation at Render.");
  }
}
