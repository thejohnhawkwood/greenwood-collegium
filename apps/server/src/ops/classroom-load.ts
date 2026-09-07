import { io as ioClient, type Socket } from "socket.io-client";
import { SESSION_COOKIE } from "../auth/cookies.js";
import {
  assertSafeLoadOrigin,
  evaluateLoadReport,
  type ClassroomLoadReport,
} from "./load-metrics.js";

export const CLASSROOM_LOAD_CLIENTS = 30;

export async function runClassroomLoad(input: {
  origin: string;
  sessionTokens: readonly string[];
}): Promise<ClassroomLoadReport> {
  assertSafeLoadOrigin(input.origin);
  const tokens = input.sessionTokens.slice(0, CLASSROOM_LOAD_CLIENTS);
  const lookAckMs: number[] = [];
  let connected = 0;
  let lookAccepted = 0;
  let sayAccepted = 0;
  let moveAccepted = 0;
  let reconnects = 0;
  let rejected = 0;
  let connectErrors = 0;

  const sockets = await Promise.all(
    tokens.map(async (token) => {
      try {
        const socket = await connectPlay(input.origin, token);
        connected += 1;
        return socket;
      } catch {
        connectErrors += 1;
        return undefined;
      }
    }),
  );
  const seated = sockets.filter((socket): socket is Socket => socket !== undefined);

  for (const [index, socket] of seated.entries()) {
    const look = await timedCommand(socket, `cmd-look-${String(index)}`, "look");
    lookAckMs.push(look.ms);
    tally(look.status, (accepted) => {
      if (accepted) {
        lookAccepted += 1;
      } else {
        rejected += 1;
      }
    });
    const said = await timedCommand(socket, `cmd-say-${String(index)}`, "say here");
    tally(said.status, (accepted) => {
      if (accepted) {
        sayAccepted += 1;
      } else {
        rejected += 1;
      }
    });
    if (index < 10) {
      const north = await timedCommand(socket, `cmd-north-${String(index)}`, "north");
      tally(north.status, (accepted) => {
        if (accepted) {
          moveAccepted += 1;
        } else {
          rejected += 1;
        }
      });
      const south = await timedCommand(socket, `cmd-south-${String(index)}`, "south");
      tally(south.status, (accepted) => {
        if (accepted) {
          moveAccepted += 1;
        } else {
          rejected += 1;
        }
      });
    }
  }

  for (const socket of seated.slice(0, 5)) {
    socket.disconnect();
  }
  for (const [index, token] of tokens.slice(0, 5).entries()) {
    try {
      const again = await connectPlay(input.origin, token);
      reconnects += 1;
      const look = await timedCommand(again, `cmd-look-resume-${String(index)}`, "look");
      tally(look.status, (accepted) => {
        if (!accepted) {
          rejected += 1;
        }
      });
      again.disconnect();
    } catch {
      connectErrors += 1;
    }
  }

  for (const socket of seated.slice(5)) {
    socket.disconnect();
  }

  return evaluateLoadReport({
    clients: tokens.length,
    connected,
    lookAccepted,
    sayAccepted,
    moveAccepted,
    reconnects,
    rejected,
    connectErrors,
    lookAckMs,
  });
}

async function connectPlay(origin: string, sessionToken: string): Promise<Socket> {
  const socket = ioClient(origin, {
    transports: ["websocket"],
    extraHeaders: { Cookie: `${SESSION_COOKIE}=${sessionToken}` },
    auth: { lastSequence: 0 },
  });
  await new Promise<void>((resolve, reject) => {
    socket.once("connect", () => {
      resolve();
    });
    socket.once("connect_error", reject);
  });
  return socket;
}

async function timedCommand(
  socket: Socket,
  commandId: string,
  raw: string,
): Promise<{ status: string; ms: number }> {
  const started = Date.now();
  const ack = await new Promise<{ status?: string }>((resolve) => {
    socket.emit(
      "command",
      { schemaVersion: 0, commandId, raw, lastSequence: 0 },
      (payload: { status?: string }) => {
        resolve(payload);
      },
    );
  });
  return { status: ack.status ?? "missing", ms: Date.now() - started };
}

function tally(status: string, count: (accepted: boolean) => void): void {
  count(status === "accepted");
}
