import type { PlayState } from "@greenwood/contracts";

export function QuestJournal({
  open,
  state,
  onClose,
}: {
  open: boolean;
  state?: PlayState;
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }
  const quests = state?.quests ?? [];
  const active = quests.filter((quest) => quest.status === "active");
  const finished = quests.filter((quest) => quest.status === "completed");
  return (
    <div className="bag-overlay" role="presentation" onClick={onClose}>
      <div
        className="quest-dialog"
        role="dialog"
        aria-labelledby="quest-journal-heading"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="panel-heading">
          <h2 id="quest-journal-heading">Current quests</h2>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <p className="small-copy">
          {quests.length
            ? `${active.length} active · ${finished.length} finished`
            : "You have no tasks yet."}
        </p>
        {active.length ? (
          <section className="quest-group" aria-label="Active quests">
            {active.map((quest) => (
              <QuestEntry key={quest.id} quest={quest} />
            ))}
          </section>
        ) : null}
        {finished.length ? (
          <section className="quest-group" aria-label="Finished quests">
            <h3 className="quest-group-heading">Finished</h3>
            {finished.map((quest) => (
              <QuestEntry key={quest.id} quest={quest} />
            ))}
          </section>
        ) : null}
      </div>
    </div>
  );
}

function QuestEntry({ quest }: { quest: PlayState["quests"][number] }) {
  const done = quest.steps.filter((step) => step.done).length;
  return (
    <article className="quest-entry" data-status={quest.status}>
      <h3 className="quest-title">{quest.title}</h3>
      <p className="quest-progress">
        {quest.status === "completed"
          ? "Completed"
          : `${String(done)} of ${String(quest.steps.length)} steps done`}
      </p>
      <ul className="quest-steps">
        {quest.steps.map((step) => (
          <li key={step.id} className={step.done ? "done" : "open"}>
            <span className="quest-mark" aria-hidden="true">
              {step.done ? "✓" : "•"}
            </span>
            <div>
              <span className="quest-step-label">{step.label}</span>
              {step.hint ? <small className="quest-hint">{step.hint}</small> : null}
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}
