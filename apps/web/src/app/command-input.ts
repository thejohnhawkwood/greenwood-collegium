export const SOCKET_TRANSPORTS = ["websocket", "polling"] as const;

export const DISCONNECTED_COMMAND_NOTICE =
  "The courtyard is not connected yet. Wait for Connection: connected, then press Enter.";

export function canSendCommand(connection: string, raw: string): boolean {
  return connection === "connected" && raw.trim().length > 0;
}
