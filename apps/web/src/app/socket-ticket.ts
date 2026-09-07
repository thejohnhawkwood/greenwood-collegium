import { authSocketTicketSchema } from "@greenwood/contracts";

export async function loadSocketTicket(): Promise<string | undefined> {
  const response = await fetch("/auth/socket-ticket", { credentials: "same-origin" });
  if (!response.ok) {
    return undefined;
  }
  const parsed = authSocketTicketSchema.safeParse(await response.json());
  return parsed.success ? parsed.data.ticket : undefined;
}
