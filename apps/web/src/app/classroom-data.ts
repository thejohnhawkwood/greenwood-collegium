import { authClassroomSchema, type AuthClassroom } from "@greenwood/contracts";

export async function loadClassroom(): Promise<AuthClassroom | undefined> {
  const response = await fetch("/auth/classroom", { credentials: "same-origin" });
  if (!response.ok) {
    return undefined;
  }
  const parsed = authClassroomSchema.safeParse(await response.json());
  return parsed.success ? parsed.data : undefined;
}

export function unusedInvites(classroom: AuthClassroom) {
  return classroom.invites.filter((invite) => invite.status === "unused");
}

export function usedInvites(classroom: AuthClassroom) {
  return classroom.invites.filter((invite) => invite.status === "used");
}

export function unusedStudentTokens(classroom: AuthClassroom): string[] {
  return unusedInvites(classroom)
    .filter((invite) => invite.role === "student" && Boolean(invite.token))
    .map((invite) => invite.token as string);
}

export function unusedStudentTokenText(classroom: AuthClassroom): string {
  const tokens = unusedStudentTokens(classroom);
  return tokens.length === 0 ? "" : `${tokens.join("\n")}\n`;
}

function csvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

export function rosterCsv(classroom: AuthClassroom): string {
  const header = "invite_token,invite_reference,login,collegian,role,status";
  const unused = unusedInvites(classroom).map((invite) =>
    [
      csvCell(invite.token ?? ""),
      csvCell(invite.id),
      csvCell(invite.username ?? ""),
      csvCell(invite.characterName ?? ""),
      csvCell(invite.role),
      csvCell(invite.status),
    ].join(","),
  );
  const accounts = classroom.accounts.map((account) =>
    [
      "",
      csvCell(account.inviteReference ?? ""),
      csvCell(account.username),
      csvCell(account.characterName ?? ""),
      csvCell(account.role),
      csvCell(account.status),
    ].join(","),
  );
  return `${[header, ...unused, ...accounts].join("\n")}\n`;
}

export function downloadTextFile(filename: string, content: string, type = "text/plain"): void {
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
