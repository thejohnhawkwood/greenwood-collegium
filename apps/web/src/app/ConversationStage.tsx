import type { PlayState } from "@greenwood/contracts";

export function ConversationStage({
  conversation,
  onSend,
}: {
  conversation?: PlayState["conversation"];
  onSend: (command: string) => void;
}) {
  if (!conversation) {
    return null;
  }
  return (
    <aside className="conversation-stage" aria-label={`Talking with ${conversation.npcName}`}>
      <p className="conversation-speaker">{conversation.npcName}</p>
      <p className="conversation-prompt">{conversation.prompt}</p>
      {conversation.choices.length ? (
        <div className="conversation-choices">
          {conversation.choices.map((choice) => (
            <button key={choice.say} type="button" onClick={() => onSend(`say ${choice.say}`)}>
              {choice.label}
            </button>
          ))}
        </div>
      ) : null}
    </aside>
  );
}
