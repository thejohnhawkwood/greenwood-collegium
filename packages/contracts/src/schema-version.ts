import { z } from "zod";

/** First public event-envelope generation. Bump only with a compatibility plan. */
export const schemaVersion = 0;

export const schemaVersionSchema = z.literal(schemaVersion);
