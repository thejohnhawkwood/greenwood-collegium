import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App.js";
import { CharacterBuilder } from "./app/CharacterBuilder.js";
import { RoomCatalog } from "./app/RoomCatalog.js";
import "./styles/tokens.css";
import "./styles/app.css";
import "./styles/play.css";

const root = document.getElementById("root");
if (!root) {
  throw new Error("root element missing");
}

const params = new URLSearchParams(window.location.search);
const page = params.has("builder") ? (
  <CharacterBuilder />
) : params.has("rooms") ? (
  <RoomCatalog />
) : (
  <App />
);

createRoot(root).render(<StrictMode>{page}</StrictMode>);
