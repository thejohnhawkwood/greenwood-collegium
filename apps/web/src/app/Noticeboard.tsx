import type { PlayState } from "@greenwood/contracts";
import { useEffect } from "react";

export function Noticeboard({
  open,
  posts,
  onClose,
  onSend,
}: {
  open: boolean;
  posts: NonNullable<PlayState["noticeboard"]>["posts"];
  onClose: () => void;
  onSend: (command: string) => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="bag-overlay" role="presentation" onClick={onClose}>
      <div
        className="quest-dialog"
        role="dialog"
        aria-labelledby="noticeboard-heading"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="panel-heading">
          <h2 id="noticeboard-heading">Noticeboard</h2>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <p className="small-copy">
          {posts.length
            ? "Work still pinned here. Seek sends you to that person."
            : "The board is clear."}
        </p>
        <div className="quest-scroll">
          {posts.map((post) => (
            <article key={post.questId} className="quest-entry" data-status={post.status}>
              <h3 className="quest-title">{post.title}</h3>
              <p className="quest-progress">
                {post.status === "active" ? "In hand" : "Offered"}
                {post.who ? ` · ${post.who}` : ""}
                {` · ${post.place}`}
              </p>
              <p className="quest-now">{post.line}</p>
              {post.command ? (
                <button
                  type="button"
                  onClick={() => {
                    onSend(post.command!);
                    onClose();
                  }}
                >
                  {post.who ? `Go to ${post.who}` : `Go to ${post.place}`}
                </button>
              ) : (
                <p className="small-copy">Here</p>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
