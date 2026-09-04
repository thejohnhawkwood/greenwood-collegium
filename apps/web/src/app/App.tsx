import { commandAckSchema, eventEnvelopeSchema, schemaVersion } from "@greenwood/contracts";
import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { createLookRequest } from "./look-request.js";
import { APP_TITLE } from "./title.js";

export function App() {
  const socketRef = useRef<Socket | null>(null);
  const [connection, setConnection] = useState("disconnected");
  const [narration, setNarration] = useState("");
  const [notice, setNotice] = useState(
    "Press look after you connect. This is not the classic transcript yet.",
  );

  useEffect(() => {
    const socket = io({
      path: "/socket.io",
      transports: ["websocket"],
    });
    socketRef.current = socket;
    socket.on("connect", () => {
      setConnection("connected");
    });
    socket.on("disconnect", () => {
      setConnection("disconnected");
    });
    socket.on("event", (payload: unknown) => {
      const parsed = eventEnvelopeSchema.safeParse(payload);
      if (parsed.success) {
        setNarration(parsed.data.narration);
      }
    });

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, []);

  function sendLook() {
    const socket = socketRef.current;
    if (!socket) {
      return;
    }

    socket.emit("command", createLookRequest(crypto.randomUUID()), (payload: unknown) => {
      const ack = commandAckSchema.safeParse(payload);
      if (!ack.success) {
        setNotice("The server acknowledgement was not valid.");
        return;
      }
      if (ack.data.status === "rejected") {
        setNotice(ack.data.message);
        return;
      }
      setNotice("look accepted.");
    });
  }

  return (
    <main className="shell">
      <h1>{APP_TITLE}</h1>
      <p>Ticket 004 socket proof. Classic transcript arrives in Ticket 005.</p>
      <p className="meta">
        Connection: {connection}. Contract schema {schemaVersion}.
      </p>
      <p>
        <button type="button" onClick={sendLook} disabled={connection !== "connected"}>
          look
        </button>
      </p>
      <p className="meta">{notice}</p>
      {narration ? <pre className="transcript">{narration}</pre> : null}
    </main>
  );
}
