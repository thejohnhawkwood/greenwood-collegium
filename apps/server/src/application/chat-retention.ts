const DEFAULT_CHAT_RETENTION_DAYS = 30;

export function chatRetentionCutoff(now = new Date()): Date {
  const parsed = Number.parseInt(process.env.CHAT_RETENTION_DAYS ?? "", 10);
  const days =
    Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_CHAT_RETENTION_DAYS;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}
