import type { EquipmentSlotId, EquipmentSlotView, PlayState } from "@greenwood/contracts";
import { useState } from "react";
import { CharacterPortrait } from "./CharacterPortrait.js";

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
  const carried = items.filter((item) => !item.equipped);
  const slots = state?.slots ?? [];
  const wornLabel = slots.find((slot) => slot.itemId === selected?.id)?.label;
  const character = state?.character;
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
        <div className="bag-layout">
          <section className="bag-doll" aria-label="Equipment">
            <div className="paper-doll">
              <div className="portrait-mat">
                <CharacterPortrait
                  visual={character?.visual}
                  name={character?.name ?? "Your Collegian"}
                />
              </div>
              {slots.map((slot) => (
                <GearSlot
                  key={slot.id}
                  slot={slot}
                  selected={slot.itemId === selected?.id}
                  onSelect={setSelectedId}
                />
              ))}
            </div>
          </section>
          <BagGroup
            title="Carried"
            items={carried}
            selectedId={selected?.id}
            empty="Nothing else in the bag"
            onSelect={setSelectedId}
          />
          {selected ? (
            <section className="bag-detail" aria-label="Selected item">
              <h3>{selected.name}</h3>
              <p className="small-copy">
                {selected.equipped ? `Worn on ${wornLabel ?? "your person"}.` : "In the bag."}
                {selected.category ? ` ${selected.category}.` : ""}
              </p>
              {selected.description ? <p>{selected.description}</p> : null}
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
    </div>
  );
}

function GearSlot({
  slot,
  selected,
  onSelect,
}: {
  slot: EquipmentSlotView;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const filled = Boolean(slot.itemId && slot.itemName);
  const caption = slot.blocked ? "Both hands" : filled ? slot.itemName : slot.label;
  const aria = slot.blocked
    ? `${slot.label}, both hands, ${slot.itemName ?? "weapon"}`
    : filled
      ? `${slot.label}, ${slot.itemName}`
      : `${slot.label}, empty`;
  return (
    <button
      type="button"
      className={`gear-slot${filled ? " is-filled" : ""}${slot.blocked ? " is-blocked" : ""}`}
      style={{ gridArea: slot.id }}
      aria-label={aria}
      aria-pressed={filled ? selected : undefined}
      onClick={() => {
        if (slot.itemId) onSelect(slot.itemId);
      }}
    >
      <SlotGlyph id={slot.id} />
      <span className="gear-slot-caption">{caption}</span>
    </button>
  );
}

function SlotGlyph({ id }: { id: EquipmentSlotId }) {
  return (
    <svg className="gear-glyph" viewBox="0 0 32 32" aria-hidden="true">
      {glyph(id)}
    </svg>
  );
}

function glyph(id: EquipmentSlotId) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (id) {
    case "helmet":
      return (
        <>
          <path {...common} d="M7 18c0-7 4-12 9-12s9 5 9 12" />
          <path {...common} d="M7 18h18M11 18v4h10v-4" />
        </>
      );
    case "necklace":
      return (
        <>
          <path {...common} d="M10 8c2 6 4 8 6 8s4-2 6-8" />
          <circle {...common} cx="16" cy="22" r="3.2" />
        </>
      );
    case "cloak":
      return <path {...common} d="M12 6h8l6 20H6L12 6zm4 0v20" />;
    case "armor":
      return <path {...common} d="M10 6h12l2 6v12H8V12l2-6zm6 0v18" />;
    case "gloves":
      return <path {...common} d="M9 16V8h3v6h1V7h3v7h1V9h3v10c0 4-3 6-6 6s-5-2-5-6z" />;
    case "boots":
      return <path {...common} d="M11 5h7v14h5v5H8v-8h3V5z" />;
    case "ring-1":
    case "ring-2":
      return (
        <>
          <circle {...common} cx="16" cy="18" r="6" />
          <path {...common} d="M16 8l2 4h-4z" />
        </>
      );
    case "main-hand":
      return <path {...common} d="M16 4v16M12 8h8M13 26l3-6 3 6" />;
    case "off-hand":
      return <path {...common} d="M10 6h12l2 6v12c-4 3-12 3-16 0V12l2-6z" />;
    case "ranged":
      return <path {...common} d="M10 6c8 4 8 16 0 20M10 6v20M14 10h8M14 22h8" />;
  }
}

function BagGroup({
  title,
  items,
  selectedId,
  empty,
  onSelect,
}: {
  title: string;
  items: NonNullable<PlayState["bag"]>;
  selectedId?: string;
  empty: string;
  onSelect: (id: string) => void;
}) {
  return (
    <section className={`bag-group bag-carried`} aria-label={title}>
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
          </li>
        ))}
      </ul>
    </section>
  );
}
