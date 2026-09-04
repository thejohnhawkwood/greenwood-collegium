import { schemaVersion } from "@greenwood/contracts";
import { APP_TITLE } from "./title.js";

export function App() {
  return (
    <main className="shell">
      <h1>{APP_TITLE}</h1>
      <p>Repository foundation. This is not a playable game yet.</p>
      <p className="meta">Shared contract schema version {schemaVersion}.</p>
    </main>
  );
}
