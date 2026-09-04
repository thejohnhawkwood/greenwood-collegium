import { z } from "zod";

/** Shared schema version for later command and event contracts (Ticket 002). */
export const schemaVersion = 0;

export const schemaVersionSchema = z.number().int().nonnegative();
