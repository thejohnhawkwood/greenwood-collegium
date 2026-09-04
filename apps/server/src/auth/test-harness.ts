import { createMemoryStores } from "../persistence/memory.js";
import { testHasher } from "./hasher.js";
import { createAuthService, type AuthService } from "./service.js";

export const TEST_BOOTSTRAP_TOKEN = "test-bootstrap-token";

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
