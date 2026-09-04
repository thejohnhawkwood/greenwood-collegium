import { hash, verify } from "@node-rs/argon2";

export type PasswordHasher = {
  hash(password: string): Promise<string>;
  verify(hash: string, password: string): Promise<boolean>;
};

export const argon2Hasher: PasswordHasher = {
  hash(password: string) {
    // Default algorithm for this package is Argon2id.
    return hash(password);
  },
  verify(hashed: string, password: string) {
    return verify(hashed, password);
  },
};

export const testHasher: PasswordHasher = {
  async hash(password: string) {
    return `test:${password}`;
  },
  async verify(hashed: string, password: string) {
    return hashed === `test:${password}`;
  },
};
