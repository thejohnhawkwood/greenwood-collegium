const INTERACTIVE = "a, button, input, select, textarea, label, option";

export type ClosestTarget = {
  closest(selectors: string): unknown;
};

export function shouldFocusCommandInput(target: ClosestTarget | EventTarget | null): boolean {
  if (target === null || typeof target !== "object" || !("closest" in target)) {
    return true;
  }
  const closest = target.closest;
  if (typeof closest !== "function") {
    return true;
  }
  return closest.call(target, INTERACTIVE) === null;
}
