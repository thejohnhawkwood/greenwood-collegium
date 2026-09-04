export class RateLimiter {
  private readonly stamps = new Map<string, number[]>();

  constructor(private readonly now: () => number = Date.now) {}

  allow(key: string, max: number, windowMs: number): boolean {
    const now = this.now();
    const recent = (this.stamps.get(key) ?? []).filter((stamp) => now - stamp < windowMs);
    if (recent.length >= max) {
      this.stamps.set(key, recent);
      return false;
    }
    recent.push(now);
    this.stamps.set(key, recent);
    return true;
  }
}

export const SAY_RATE_MAX = 5;
export const SAY_RATE_WINDOW_MS = 10_000;
export const COMMAND_RATE_MAX = 20;
export const COMMAND_RATE_WINDOW_MS = 10_000;
