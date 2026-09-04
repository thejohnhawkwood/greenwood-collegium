import type { FastifyInstance } from "fastify";

const foundationPage = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>The Greenwood Collegium</title>
    <style>
      :root {
        color-scheme: dark;
        --ink: #e8e0d0;
        --moss: #1b2a22;
        --lantern: #d4a45a;
        --font: ui-monospace, "Cascadia Code", "Segoe UI Mono", monospace;
      }
      body {
        margin: 0;
        min-height: 100vh;
        background: var(--moss);
        color: var(--ink);
        font-family: var(--font);
      }
      main {
        max-width: 40rem;
        margin: 0 auto;
        padding: 3rem 1.5rem;
      }
      h1 {
        color: var(--lantern);
        font-weight: 600;
      }
      a {
        color: var(--lantern);
      }
    </style>
  </head>
  <body>
    <main>
      <h1>The Greenwood Collegium</h1>
      <p>Repository foundation. This is not a playable game yet.</p>
      <p>Health checks:</p>
      <ul>
        <li><a href="/health/live">/health/live</a></li>
        <li><a href="/health/ready">/health/ready</a></li>
        <li><a href="/version">/version</a></li>
      </ul>
    </main>
  </body>
</html>
`;

export async function registerRootRoute(app: FastifyInstance): Promise<void> {
  app.get("/", async (_request, reply) => {
    return reply.type("text/html; charset=utf-8").send(foundationPage);
  });
}
