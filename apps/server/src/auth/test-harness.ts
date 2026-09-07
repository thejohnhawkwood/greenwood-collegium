import { createMemoryStores } from "../persistence/memory.js";
import { testHasher } from "./hasher.js";
import { createAuthService, type AuthService } from "./service.js";

export const TEST_BOOTSTRAP_TOKEN = "test-bootstrap-token";

export async function completeTestCharacter(
  auth: AuthService,
  accountId: string,
  input: { name: string; speciesId: string; gender: "female" | "male" | "nonbinary" } = {
    name: "Rowan",
    speciesId: "hare",
    gender: "female",
  },
): Promise<void> {
  const result = await auth.completeCharacter(accountId, input);
  if (!result.ok) {
    throw new Error(result.message);
  }
}

export function createTestAuth(now: () => Date = () => new Date()): {
  auth: AuthService;
  bootstrapToken: string;
} & ReturnType<typeof createMemoryStores> {
  const stores = createMemoryStores();
  return {
    ...stores,
    bootstrapToken: TEST_BOOTSTRAP_TOKEN,
    auth: createAuthService({
      ...stores,
      hasher: testHasher,
      bootstrapToken: TEST_BOOTSTRAP_TOKEN,
      now,
    }),
  };
}
