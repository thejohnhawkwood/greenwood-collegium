import { SESSION_HELLO_EVENT, sessionHelloSchema } from "@greenwood/contracts";
import { afterEach, describe, expect, it } from "vitest";
import { io as ioClient, type Socket } from "socket.io-client";
import { createDevWorld } from "../application/dev-world.js";
import { buildApp } from "../app.js";
import { attachRealtime } from "./gateway.js";

describe("session-hello", () => {
  let app: Awaited<ReturnType<typeof buildApp>> | undefined;
  let client: Socket | undefined;
  let other: Socket | undefined;

  afterEach(async () => {
    client?.disconnect();
    other?.disconnect();
    client = undefined;
    other = undefined;
    if (app) {
      await app.close();
      app = undefined;
    }
  });

  it("emits one process boot id to every socket, and a new process uses another", async () => {
    app = await buildApp();
    await attachRealtime(app, createDevWorld());
    await app.listen({ port: 0, host: "127.0.0.1" });
    const firstPort = listenPort(app);

    client = connect(firstPort);
    other = connect(firstPort);
    const first = sessionHelloSchema.parse(await nextHello(client));
    const sameProcess = sessionHelloSchema.parse(await nextHello(other));
    expect(first.bootId).toBe(sameProcess.bootId);

    client.disconnect();
    other.disconnect();
    await app.close();
    app = undefined;

    app = await buildApp();
    await attachRealtime(app, createDevWorld());
    await app.listen({ port: 0, host: "127.0.0.1" });
    client = connect(listenPort(app));
    const restarted = sessionHelloSchema.parse(await nextHello(client));
    expect(restarted.bootId).not.toBe(first.bootId);
  });
});

function listenPort(app: Awaited<ReturnType<typeof buildApp>>): number {
  const address = app.server.address();
  if (!address || typeof address === "string") {
    throw new Error("expected a TCP address");
  }
  return address.port;
}

function connect(port: number): Socket {
  return ioClient(`http://127.0.0.1:${String(port)}`, {
    transports: ["websocket"],
  });
}

function nextHello(socket: Socket): Promise<unknown> {
  return new Promise((resolve, reject) => {
    socket.once(SESSION_HELLO_EVENT, resolve);
    socket.once("connect_error", reject);
  });
}
