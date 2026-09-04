import type { CommandAck, EventEnvelope } from "@greenwood/contracts";

export type RecordedCommand = {
  ack: CommandAck;
  events: EventEnvelope[];
  notices: readonly { characterId: string; event: EventEnvelope }[];
};

export class CommandLog {
  private readonly byCharacter = new Map<string, Map<string, RecordedCommand>>();

  get(characterId: string, commandId: string): RecordedCommand | undefined {
    return this.byCharacter.get(characterId)?.get(commandId);
  }

  set(characterId: string, commandId: string, recorded: RecordedCommand): void {
    const current = this.byCharacter.get(characterId) ?? new Map<string, RecordedCommand>();
    current.set(commandId, recorded);
    this.byCharacter.set(characterId, current);
  }
}
