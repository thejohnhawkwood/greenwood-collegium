import type { PlayState } from "@greenwood/contracts";
import { useState } from "react";

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
  const items = state?.bag ?? [];
  const [selectedId, setSelectedId] = useState(items[0]?.id);
  if (!open) {
    return null;
  }
  const selected = items.find((item) => item.id === selectedId) ?? items[0];
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
        <BagGroup
          title="In hand"
          items={equipped}
          selectedId={selected?.id}
          empty="Nothing equipped"
          onSelect={setSelectedId}
          onSend={onSend}
        />
        <BagGroup
          title="Carried"
          items={carried}
          selectedId={selected?.id}
          empty="Nothing else in the bag"
          onSelect={setSelectedId}
          onSend={onSend}
        />
        {selected ? (
          <section className="bag-detail" aria-label="Selected item">
            <h3>{selected.name}</h3>
            <p className="small-copy">
              {selected.equipped ? "In hand." : "In the bag."}
              {selected.category ? ` ${selected.category}.` : ""} One of this item.
            </p>
            <div className="bag-actions">
              <button type="button" onClick={() => onSend(`examine ${selected.name}`)}>
                Examine
              </button>
              {selected.equipped ? null : (
                <button type="button" onClick={() => onSend(`equip ${selected.name}`)}>
                  Equip
                </button>
              )}
              <button type="button" onClick={() => onSend(`drop ${selected.name}`)}>
                Drop
              </button>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function BagGroup({
  title,
  items,
  selectedId,
  empty,
  onSelect,
  onSend,
}: {
  title: string;
  items: NonNullable<PlayState["bag"]>;
  selectedId?: string;
  empty: string;
  onSelect: (id: string) => void;
  onSend: (command: string) => void;
}) {
  return (
    <section className="bag-group" aria-label={title}>
      <h3>{title}</h3>
      {items.length === 0 ? <p className="small-copy">{empty}</p> : null}
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={item.id === selectedId ? "bag-item-current" : undefined}
              aria-pressed={item.id === selectedId}
              onClick={() => onSelect(item.id)}
            >
              <strong>{item.name}</strong>
              {item.category ? <small>{item.category}</small> : null}
            </button>
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
