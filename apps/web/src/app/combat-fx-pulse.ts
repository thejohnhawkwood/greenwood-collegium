import { useEffect, useState } from "react";

/** Show a combat FX pulse for one event, then clear. Presentation only. */
export function useCombatFxPulse(eventId?: string, durationMs = 750): boolean {
  const [expiredId, setExpiredId] = useState<string>();
  useEffect(() => {
    if (!eventId) return;
    const id = window.setTimeout(() => setExpiredId(eventId), durationMs);
    return () => window.clearTimeout(id);
  }, [eventId, durationMs]);
  return Boolean(eventId) && expiredId !== eventId;
}
