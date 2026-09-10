import { createMemoryStores } from "../persistence/memory.js";
import { testHasher } from "./hasher.js";
import { createAuthService, type AuthService } from "./service.js";
import type { ModerationRepository } from "../persistence/moderation-types.js";
const fixtureModeration = new WeakMap<AuthService, ModerationRepository>();

export const TEST_BOOTSTRAP_TOKEN = "test-bootstrap-token";

export async function completeTestCharacter(
  auth: AuthService,
  accountId: string,
  input: { name: string; speciesId: string; gender: "female" | "male" } = {
    name: "Rowan",
    speciesId: "hare",
    gender: "female",
  },
): Promise<void> {
  const result = await auth.completeCharacter(accountId, input);
  if (!result.ok) {
    throw new Error(result.message);
  }
  // This helper creates a play-ready fictional account. Approval behaviour itself
  // is tested through the classroom service and HTTP routes, without this helper.
  const review = await auth.reviewStatus(accountId);
  if (review.revision)
    await fixtureModeration
      .get(auth)
      ?.put(accountId, { review: { revision: review.revision, status: "approved" } });
}

export function createTestAuth(now: () => Date = () => new Date()): {
  auth: AuthService;
  bootstrapToken: string;
} & ReturnType<typeof createMemoryStores> {
  const stores = createMemoryStores();
  const auth = createAuthService({
    ...stores,
    hasher: testHasher,
    bootstrapToken: TEST_BOOTSTRAP_TOKEN,
    now,
  });
  fixtureModeration.set(auth, stores.moderation);
  return {
    ...stores,
    bootstrapToken: TEST_BOOTSTRAP_TOKEN,
    auth,
  };
}
