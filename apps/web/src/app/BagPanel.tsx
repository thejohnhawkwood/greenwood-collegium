import type { PlayState } from "@greenwood/contracts";

export function BagPanel({
  open,
  state,
  onClose,
  onSend,
}: {
  open: boolean;
  state?: PlayState;
  onClose: () => void;
  onSend: (command: string) => void;
}) {
  if (!open) {
    return null;
  }
  const items = state?.bag ?? [];
  const equipped = items.filter((item) => item.equipped);
  const carried = items.filter((item) => !item.equipped);
  return (
    <div className="bag-overlay" role="presentation" onClick={onClose}>
      <div
        className="bag-dialog"
        role="dialog"
        aria-labelledby="bag-heading"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="panel-heading">
          <h2 id="bag-heading">Bag and equipment</h2>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <p className="small-copy">
          {items.length
            ? `Carrying ${items.length} ${items.length === 1 ? "item" : "items"}.`
            : "Your bag is empty."}{" "}
          Type examine, equip, or drop.
        </p>
        <BagGroup title="In hand" items={equipped} empty="Nothing equipped" onSend={onSend} />
        <BagGroup title="Carried" items={carried} empty="Nothing else in the bag" onSend={onSend} />
      </div>
    </div>
  );
}

function BagGroup({
  title,
  items,
  empty,
  onSend,
}: {
  title: string;
  items: NonNullable<PlayState["bag"]>;
  empty: string;
  onSend: (command: string) => void;
}) {
  return (
    <section className="bag-group" aria-label={title}>
      <h3>{title}</h3>
      {items.length === 0 ? <p className="small-copy">{empty}</p> : null}
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <div>
              <strong>{item.name}</strong>
              {item.category ? <small>{item.category}</small> : null}
            </div>
            <div className="bag-actions">
              <button type="button" onClick={() => onSend(`examine ${item.name}`)}>
                Examine
              </button>
              {item.equipped ? null : (
                <button type="button" onClick={() => onSend(`equip ${item.name}`)}>
                  Equip
                </button>
              )}
              <button type="button" onClick={() => onSend(`drop ${item.name}`)}>
                Drop
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
