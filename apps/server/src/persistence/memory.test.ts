import { describe } from "vitest";
import { InMemoryAccountRepository, InMemoryCharacterRepository } from "./memory.js";
import { persistAccountAndCharacter } from "./persist.contract.js";

describe("in-memory persistence", () => {
  const accounts = new InMemoryAccountRepository();
  persistAccountAndCharacter(accounts, new InMemoryCharacterRepository(accounts));
});
