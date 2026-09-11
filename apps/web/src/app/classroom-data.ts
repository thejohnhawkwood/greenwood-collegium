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
  const header = "username,collegian,role,status,invite_token,invite_reference";
  const listed = new Set<string>();
  const inviteRows = classroom.invites.map((invite) => {
    const account = classroom.accounts.find(
      (candidate) =>
        candidate.inviteReference === invite.id ||
        (invite.username !== undefined && candidate.username === invite.username),
    );
    const username = account?.username ?? invite.username ?? "";
    if (username) {
      listed.add(username);
    }
    return [
      csvCell(username),
      csvCell(account?.characterName ?? invite.characterName ?? ""),
      csvCell(account?.role ?? invite.role),
      csvCell(account?.status ?? invite.status),
      csvCell(invite.status === "unused" ? (invite.token ?? "") : ""),
      csvCell(invite.id),
    ].join(",");
  });
  const extraAccounts = classroom.accounts
    .filter((account) => !listed.has(account.username))
    .map((account) =>
      [
        csvCell(account.username),
        csvCell(account.characterName ?? ""),
        csvCell(account.role),
        csvCell(account.status),
        "",
        csvCell(account.inviteReference ?? ""),
      ].join(","),
    );
  return `${[header, ...inviteRows, ...extraAccounts].join("\n")}\n`;
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
