import type { PlayState } from "@greenwood/contracts";
import { useEffect, useState } from "react";

type PrimerBook = NonNullable<PlayState["primer"]>;
type PrimerLeaf = PrimerBook["leaves"][number];
type PrimerNode = PrimerLeaf["nodes"][number];

const PRIMER_SPREAD = "/art/primer/primer-spread.png";
const PRIMER_PAGES: Record<string, string> = {
  ember: "/art/primer/primer-page-ember.png",
  thorn: "/art/primer/primer-page-thorn.png",
  veil: "/art/primer/primer-page-veil.png",
  stars: "/art/primer/primer-page-stars.png",
  stone: "/art/primer/primer-page-stone.png",
  steel: "/art/primer/primer-page-steel.png",
};

function primerPage(schoolId: string): string {
  return PRIMER_PAGES[schoolId] ?? "/art/primer/primer-page-ember.png";
}

export function PrimerStage({
  open,
  primer,
  onClose,
  onSend,
}: {
  open: boolean;
  primer?: PlayState["primer"];
  onClose: () => void;
  onSend: (command: string) => void;
}) {
  const leaves = primer?.leaves ?? [];
  const firstOpen = leaves.find((leaf) => leaf.open)?.schoolId ?? leaves[0]?.schoolId;
  const [schoolId, setSchoolId] = useState(firstOpen);
  const [selectedId, setSelectedId] = useState<string>();
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open || !primer) {
    return null;
  }
  const leaf = leaves.find((entry) => entry.schoolId === schoolId) ?? leaves[0];
  const selected =
    leaf?.nodes.find((node) => node.id === selectedId) ??
    leaf?.nodes.find((node) => node.distance === 0);
  return (
    <div className="primer-overlay" role="presentation" onClick={onClose}>
      <div
        className="primer-book"
        role="dialog"
        aria-labelledby="primer-heading"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <img className="primer-plate" src={PRIMER_SPREAD} alt="" />
        <button className="primer-close" type="button" onClick={onClose}>
          Close
        </button>
        {leaf ? (
          <div className={`primer-fit primer-outline-${leaf.outline}`}>
            <div className="primer-page primer-page-left">
              <div className="primer-ornament">
                <img className="primer-page-plate" src={primerPage(leaf.schoolId)} alt="" />
              </div>
              {leaf.open ? (
                <LeafPlate leaf={leaf} selectedId={selected?.id} onSelect={setSelectedId} />
              ) : null}
            </div>
            <div className="primer-page primer-page-right">
              <p className="primer-kicker" id="primer-heading">
                Field Primer
              </p>
              <h2 className="primer-school">{leaf.title}</h2>
              <p className="primer-mentor">{leaf.mentor}</p>
              <p className="small-copy">{primer.prompt}</p>
              <p className="primer-ink" aria-label={`${String(primer.ink)} ink unspent`}>
                <span>Unspent {primer.ink}</span>
                {primer.ink > 0
                  ? Array.from({ length: primer.ink }, (_, index) => (
                      <span key={index} className="primer-ink-pip" aria-hidden="true" />
                    ))
                  : null}
              </p>
              <div className="primer-pages" role="tablist" aria-label="School leaves">
                {leaves.map((entry) => (
                  <button
                    key={entry.schoolId}
                    className="primer-tab"
                    type="button"
                    role="tab"
                    aria-selected={entry.schoolId === leaf.schoolId}
                    onClick={() => {
                      setSchoolId(entry.schoolId);
                      setSelectedId(undefined);
                    }}
                  >
                    {entry.open ? entry.title : `${entry.title} shut`}
                  </button>
                ))}
              </div>
              {leaf.open ? (
                <VeinSpend
                  node={selected}
                  onSpend={selected ? () => onSend(`ink ${selected.name}`) : undefined}
                />
              ) : (
                <p className="primer-shut">
                  {leaf.mentor} has not given you this leaf. Finish that hearth&apos;s first lesson.
                </p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function LeafPlate({
  leaf,
  selectedId,
  onSelect,
}: {
  leaf: PrimerLeaf;
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const placed = placeNodes(leaf.nodes);
  const byId = new Map(placed.map((node) => [node.id, node]));
  return (
    <div className="primer-leaf" aria-label={`${leaf.title} leaf`}>
      <svg className="primer-veins" viewBox="0 0 100 100" aria-hidden="true">
        <LeafOutline outline={leaf.outline} />
        {placed.flatMap((node) =>
          node.parents.flatMap((parentId) => {
            const parent = byId.get(parentId);
            if (!parent) {
              return [];
            }
            return [
              <line
                key={`${parent.id}-${node.id}`}
                x1={parent.x}
                y1={parent.y}
                x2={node.x}
                y2={node.y}
              />,
            ];
          }),
        )}
      </svg>
      {placed.map((node) => (
        <button
          key={node.id}
          type="button"
          className={`primer-node primer-node-${node.status}${node.id === selectedId ? " is-selected" : ""}`}
          style={{ left: `${String(node.x)}%`, top: `${String(node.y)}%` }}
          aria-pressed={node.id === selectedId}
          aria-label={nodeLabel(node)}
          onClick={() => onSelect(node.id)}
        >
          <span className="primer-node-disc" aria-hidden="true" />
          <span
            className={
              node.ranks?.some((step) => step.held)
                ? "primer-node-name is-held"
                : "primer-node-name"
            }
          >
            {node.name}
          </span>
          <RankMarks ranks={node.ranks} />
          {node.legal ? <span className="primer-node-spend">1 ink</span> : null}
        </button>
      ))}
    </div>
  );
}

function VeinSpend({ node, onSpend }: { node?: PrimerNode; onSpend?: () => void }) {
  if (!node) {
    return (
      <section className="primer-detail" aria-label="Selected vein">
        <p className="small-copy">Choose a node on the leaf.</p>
      </section>
    );
  }
  const next = node.ranks?.find((step) => step.spend);
  return (
    <section className="primer-detail" aria-label="Selected vein">
      <h3 className={node.ranks?.some((step) => step.held) ? "is-held" : undefined}>{node.name}</h3>
      {node.description ? <p>{node.description}</p> : null}
      {next ? (
        <p className="primer-spend-line">Spend 1 ink for rank {next.mark}.</p>
      ) : (
        <p className="small-copy">{closedReason(node)}</p>
      )}
      {node.ranks && node.ranks.length > 0 ? (
        <ol className="primer-ladder">
          {node.ranks.map((step) => (
            <li
              key={step.rank}
              className={step.held ? "is-held" : step.spend ? "is-spend" : "is-later"}
            >
              <span className="primer-rank-head">
                <span className="primer-rank-mark">{step.mark}</span>
                <span>{step.held ? "Inked" : step.spend ? "Spend 1 ink" : "Preview"}</span>
              </span>
              {step.numbers ? <span className="primer-rank-numbers">{step.numbers}</span> : null}
            </li>
          ))}
        </ol>
      ) : node.numbers ? (
        <p className="small-copy">{node.numbers}</p>
      ) : null}
      {node.legal && onSpend ? (
        <button className="primer-spend" type="button" onClick={onSpend}>
          Spend 1 ink
        </button>
      ) : null}
    </section>
  );
}

function RankMarks({ ranks }: { ranks: PrimerNode["ranks"] }) {
  if (!ranks || ranks.length === 0) {
    return null;
  }
  return (
    <span className="primer-node-ranks" aria-hidden="true">
      {ranks.map((step) => (
        <span
          key={step.rank}
          className={step.held ? "is-held" : step.spend ? "is-spend" : "is-later"}
        >
          {step.mark}
        </span>
      ))}
    </span>
  );
}

function nodeLabel(node: PrimerNode): string {
  const next = node.ranks?.find((step) => step.spend);
  const held = node.ranks?.filter((step) => step.held).map((step) => step.mark) ?? [];
  const spent = held.length > 0 ? `inked ${held.join(" ")}` : node.status;
  return next ? `${node.name}, ${spent}, spend 1 ink for ${next.mark}` : `${node.name}, ${spent}`;
}

function closedReason(node: PrimerNode): string {
  if (node.status === "locked") {
    return "This vein is shut. Ink cannot reach it yet.";
  }
  if (node.status === "maxed") {
    return "Rank V is inked. This vein takes no more ink.";
  }
  return "No ink unspent.";
}

function placeNodes(nodes: readonly PrimerNode[]) {
  const maxDistance = Math.max(1, ...nodes.map((node) => node.distance));
  const rows = new Map<number, PrimerNode[]>();
  for (const node of nodes) {
    const row = rows.get(node.distance) ?? [];
    row.push(node);
    rows.set(node.distance, row);
  }
  return nodes.map((node) => {
    const row = rows.get(node.distance) ?? [node];
    const index = row.indexOf(node);
    return {
      ...node,
      x: 28 + ((index + 1) / (row.length + 1)) * 64,
      y: 86 - (node.distance / maxDistance) * 62,
    };
  });
}

function LeafOutline({ outline }: { outline: PrimerLeaf["outline"] }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.2,
  };
  if (outline === "compound") {
    return (
      <path
        {...common}
        d="M50 92 C48 70 30 60 18 48 C30 40 42 46 50 58 C58 46 70 40 82 48 C70 60 52 70 50 92"
      />
    );
  }
  if (outline === "ovate") {
    return <path {...common} d="M50 90 C28 70 22 40 50 12 C78 40 72 70 50 90" />;
  }
  if (outline === "palmate") {
    return (
      <path
        {...common}
        d="M50 90 L50 55 L28 28 M50 55 L50 18 M50 55 L72 28 M50 62 L22 58 M50 62 L78 58"
      />
    );
  }
  if (outline === "obovate") {
    return <path {...common} d="M50 92 C40 70 24 48 38 22 C50 12 62 22 76 48 C60 70 50 92 50 92" />;
  }
  if (outline === "linear") {
    return <path {...common} d="M50 92 C46 60 44 30 50 8 C56 30 54 60 50 92" />;
  }
  return (
    <path
      {...common}
      d="M50 92 C44 70 24 58 20 36 C32 28 44 40 50 16 C56 40 68 28 80 36 C76 58 56 70 50 92"
    />
  );
}
