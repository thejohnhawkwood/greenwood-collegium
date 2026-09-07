const SECRET_FIELD =
  /password|token|secret|cookie|authorization|database_url|ticket|raw|narration/iu;

export function safeErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : "unknown error";
  return raw
    .replaceAll(/postgres(?:ql)?:\/\/\S+/giu, "[redacted]")
    .replaceAll(/DATABASE_URL/giu, "[redacted]");
}

export function redactLogFields(fields: Record<string, unknown>): Record<string, unknown> {
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (SECRET_FIELD.test(key)) {
      continue;
    }
    safe[key] = value;
  }
  return safe;
}

export function classroomCommandFields(input: {
  commandId: string;
  verb: string;
  status: string;
  errorCode?: string;
  durationMs: number;
  characterId: string;
  accountId?: string;
  username?: string;
  connected: number;
}): Record<string, unknown> {
  return redactLogFields({
    event: "command",
    commandId: input.commandId,
    verb: input.verb,
    status: input.status,
    errorCode: input.errorCode,
    durationMs: input.durationMs,
    characterId: input.characterId,
    accountId: input.accountId,
    username: input.username,
    connected: input.connected,
  });
}
