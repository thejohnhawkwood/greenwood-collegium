import { authOpeningSchema } from "@greenwood/contracts";
import { useEffect, useRef, useState } from "react";
import { nextOpeningScroll, openingScrollPaused } from "./opening-story.js";

export function OpeningStory({ onEnter }: { onEnter: () => void }) {
  const [narration, setNarration] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const programmed = useRef(0);
  const paused = useRef(false);

  useEffect(() => {
    let cancelled = false;
    void fetch("/auth/opening")
      .then(async (response) => {
        const parsed = authOpeningSchema.safeParse(await response.json());
        if (!response.ok || !parsed.success) {
          throw new Error("unavailable");
        }
        if (!cancelled) {
          setNarration(parsed.data.narration);
          setImage(parsed.data.image);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("The opening could not be loaded. Check your connection and try again.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!narration) {
      return;
    }
    const timer = window.setInterval(() => {
      const node = scroller.current;
      if (!node) {
        return;
      }
      const next = nextOpeningScroll(
        node.scrollTop,
        node.scrollHeight,
        node.clientHeight,
        paused.current,
      );
      programmed.current = next;
      if (!paused.current) {
        node.scrollTop = next;
      }
    }, 40);
    return () => window.clearInterval(timer);
  }, [narration]);

  return (
    <section className="opening-story" aria-labelledby="opening-heading">
      <h2 id="opening-heading">The Greenwood Collegium</h2>
      {image ? (
        <img className="opening-plate" src={image} alt="Students arriving under the oak lanterns" />
      ) : null}
      <div
        className="opening-scroll"
        ref={scroller}
        tabIndex={0}
        role="region"
        aria-label="Opening story. Scroll to reread."
        onScroll={(event) => {
          if (openingScrollPaused(programmed.current, event.currentTarget.scrollTop)) {
            paused.current = true;
          }
        }}
      >
        <p>{narration || "The lanterns are lighting."}</p>
      </div>
      {error ? (
        <p className="auth-error" role="alert">
          {error}
        </p>
      ) : null}
      <button type="button" onClick={onEnter} disabled={!narration}>
        Enter
      </button>
    </section>
  );
}
