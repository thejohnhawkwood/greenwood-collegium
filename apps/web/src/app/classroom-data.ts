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

function accountForInvite(classroom: AuthClassroom, invite: AuthClassroom["invites"][number]) {
  return classroom.accounts.find(
    (candidate) =>
      candidate.inviteReference === invite.id ||
      (invite.username !== undefined && candidate.username === invite.username),
  );
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function rosterCsv(classroom: AuthClassroom): string {
  const header =
    "username,collegian,role,status,invite_token,invite_token_hash,invite_reference";
  const listed = new Set<string>();
  const inviteRows = classroom.invites.map((invite) => {
    const account = accountForInvite(classroom, invite);
    const username = account?.username ?? invite.username ?? "";
    if (username) {
      listed.add(username);
    }
    return [
      csvCell(username),
      csvCell(account?.characterName ?? invite.characterName ?? ""),
      csvCell(account?.role ?? invite.role),
      csvCell(account?.status ?? invite.status),
      csvCell(invite.token ?? ""),
      csvCell(invite.tokenHash ?? ""),
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
        "",
        csvCell(account.inviteReference ?? ""),
      ].join(","),
    );
  return `${[header, ...inviteRows, ...extraAccounts].join("\n")}\n`;
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const input = text.replace(/^\uFEFF/, "");
  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (quoted) {
      if (character === '"') {
        if (input[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(cell);
      cell = "";
    } else if (character === "\n") {
      row.push(cell);
      if (row.some((value) => value.trim() !== "")) {
        rows.push(row);
      }
      row = [];
      cell = "";
    } else if (character !== "\r") {
      cell += character;
    }
  }
  row.push(cell);
  if (row.some((value) => value.trim() !== "")) {
    rows.push(row);
  }
  return rows;
}

function columnIndex(header: string[], names: string[]): number {
  return header.findIndex((cell) => names.includes(cell.trim().toLowerCase()));
}

export type MatchPrivateClassListResult =
  | { ok: true; csv: string; matched: number; unused: number; unmatched: number }
  | { ok: false; message: string };

export async function matchPrivateClassList(
  classroom: AuthClassroom,
  privateCsv: string,
): Promise<MatchPrivateClassListResult> {
  const rows = parseCsvRows(privateCsv);
  const header = rows[0];
  if (!header) {
    return { ok: false, message: "That file has no rows." };
  }
  const nameIndex = columnIndex(header, ["student_name", "student", "name"]);
  const tokenIndex = columnIndex(header, ["invite_token", "token"]);
  const emailIndex = columnIndex(header, ["email", "school_email"]);
  if (nameIndex < 0 || tokenIndex < 0) {
    return {
      ok: false,
      message: "That file needs student_name and invite_token columns.",
    };
  }

  const listed = new Set<string>();
  const joined: string[] = [];
  let matched = 0;
  let unused = 0;
  let unmatched = 0;

  for (const row of rows.slice(1)) {
    const student = (row[nameIndex] ?? "").trim();
    const token = (row[tokenIndex] ?? "").trim();
    const email = emailIndex >= 0 ? (row[emailIndex] ?? "").trim() : "";
    if (!student || !token) {
      continue;
    }
    const digest = await sha256Hex(token);
    const invite = classroom.invites.find(
      (candidate) => candidate.token === token || candidate.tokenHash === digest,
    );
    const account = invite ? accountForInvite(classroom, invite) : undefined;
    const username = account?.username ?? invite?.username ?? "";
    const collegian = account?.characterName ?? invite?.characterName ?? "";
    if (username) {
      listed.add(username);
      matched += 1;
    } else if (invite?.status === "unused") {
      unused += 1;
    } else {
      unmatched += 1;
    }
    const note = username
      ? "joined"
      : invite?.status === "unused"
        ? "invite still unused"
        : "invite not on this roster";
    joined.push(
      [csvCell(student), csvCell(username), csvCell(collegian), csvCell(email), csvCell(note)].join(
        ",",
      ),
    );
  }

  const extras = classroom.accounts
    .filter((account) => account.role === "student" && !listed.has(account.username))
    .map((account) =>
      [
        "",
        csvCell(account.username),
        csvCell(account.characterName ?? ""),
        "",
        csvCell("account not on the private class list"),
      ].join(","),
    );

  return {
    ok: true,
    csv: `${["student_name,username,collegian,email,note", ...joined, ...extras].join("\n")}\n`,
    matched,
    unused,
    unmatched,
  };
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
