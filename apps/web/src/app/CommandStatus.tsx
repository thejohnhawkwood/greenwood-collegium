import type { PlayState } from "@greenwood/contracts";

export function CommandStatus({ state }: { state?: PlayState }) {
  if (!state) {
    return null;
  }
  const quest = state.quests.find((entry) => entry.status === "active" && entry.current);
  if (!state.duelAsk && !quest) {
    return null;
  }
  return (
    <div className="command-status">
      {state.duelAsk ? (
        <p className="duel-wait">Waiting for {state.duelAsk.name} to agree to a duel.</p>
      ) : null}
      {quest?.current ? (
        <p className="quest-dock">
          <span>Now</span> {quest.title}: {quest.current}
        </p>
      ) : null}
    </div>
  );
}
