import type { SpeechRecord } from "@greenwood/contracts";

export type ModerationState = {
  review?: { revision: string; status: "approved" | "rejected"; reason?: string };
  mutedUntil?: string;
  timeoutUntil?: string;
};
export type SpeechInput = Omit<SpeechRecord, "id"> & { commandId: string };
export type SpeechQuery = {
  day: string;
  after: number;
  accountId?: string;
  roomId?: string;
  limit: number;
  since: string;
};
export interface ModerationRepository {
  get(accountId: string): Promise<ModerationState>;
  put(accountId: string, state: ModerationState): Promise<void>;
  chatPaused(): Promise<boolean>;
  pauseChat(paused: boolean): Promise<void>;
  appendSpeech(input: SpeechInput): Promise<boolean>;
  speech(query: SpeechQuery): Promise<SpeechRecord[]>;
  speechDays(since: string): Promise<string[]>;
  pruneSpeech(before: string): Promise<void>;
}
export type PurgeResult = { accountIds: string[]; characterIds: string[]; invites: number };
export interface ClassroomResetRepository {
  purgeStudents(): Promise<PurgeResult>;
  purgeCharacter(accountId: string): Promise<string[]>;
}
