import type { SchoolId } from "./state.js";

export const SCHOOL_IDS = ["ember", "thorn", "veil", "stars", "stone", "steel"] as const;

export function isSchoolId(value: string | undefined): value is SchoolId {
  return Boolean(value && (SCHOOL_IDS as readonly string[]).includes(value));
}
