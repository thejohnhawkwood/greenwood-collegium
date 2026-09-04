import { createDevWorld } from "./application/dev-world.js";
import { buildApp } from "./app.js";
import { attachRealtime } from "./sockets/gateway.js";

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const host = process.env.HOST ?? "0.0.0.0";

const app = await buildApp();
await attachRealtime(app, createDevWorld());
await app.listen({ port, host });
