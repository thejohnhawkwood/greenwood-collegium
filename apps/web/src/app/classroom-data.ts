import { authClassroomSchema, type AuthClassroom, type AuthClassroomChat } from "@greenwood/contracts";

export async function loadClassroom(): Promise<AuthClassroom | undefined> {
  const response = await fetch("/auth/classroom", { credentials: "same-origin" });
  if (!response.ok) {
    return undefined;
  }
  const parsed = authClassroomSchema.safeParse(await response.json());
  return parsed.success ? parsed.data : undefined;
}

export type RosterRow = {
  key: string;
  token?: string;
  username?: string;
  characterName?: string;
  role: string;
  status: string;
  removable: boolean;
};

export function unusedInvites(classroom: AuthClassroom) {
  return classroom.invites.filter((invite) => invite.status === "unused");
}

export function usedInvites(classroom: AuthClassroom) {
  return classroom.invites.filter((invite) => invite.status === "used");
}

export function rosterRows(classroom: AuthClassroom): RosterRow[] {
  const linked = new Set(
    classroom.invites
      .map((invite) => invite.username?.toLowerCase())
      .filter((username): username is string => Boolean(username)),
  );
  const fromInvites = classroom.invites.map((invite) => {
    const account = classroom.accounts.find(
      (entry) => entry.username.toLowerCase() === invite.username?.toLowerCase(),
    );
    return {
      key: invite.id,
      token: invite.token,
      username: invite.username,
      characterName: invite.characterName ?? account?.characterName,
      role: invite.role,
      status: account?.status ?? invite.status,
      removable: account?.status === "active" && account.role === "student",
    };
  });
  const extras = classroom.accounts
    .filter((account) => !linked.has(account.username.toLowerCase()))
    .map((account) => ({
      key: account.accountId,
      username: account.username,
      characterName: account.characterName,
      role: account.role,
      status: account.status,
      removable: account.status === "active" && account.role === "student",
    }));
  return [...fromInvites, ...extras];
}

export function classroomChat(classroom: AuthClassroom): AuthClassroomChat[] {
  return classroom.chat ?? [];
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
  const header = "invite_token,login,collegian,role,status";
  const lines = rosterRows(classroom).map((row) =>
    [
      csvCell(row.token ?? ""),
      csvCell(row.username ?? ""),
      csvCell(row.characterName ?? ""),
      csvCell(row.role),
      csvCell(row.status),
    ].join(","),
  );
  return `${[header, ...lines].join("\n")}\n`;
}

export function downloadTextFile(
  filename: string,
  content: string,
  type = "text/plain",
): void {
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
