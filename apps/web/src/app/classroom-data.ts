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
