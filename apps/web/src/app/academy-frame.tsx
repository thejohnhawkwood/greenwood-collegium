import type { ReactNode } from "react";

export const FRAME_BOUGH_LEFT = "/frame/bough-left.jpg";
export const FRAME_BOUGH_RIGHT = "/frame/bough-right.jpg";
export const FRAME_ARRIVAL = "/frame/arrival-students.png";

export const LEFT_LANTERNS = [
  { left: "18.1%", top: "10.9%", delay: "0s" },
  { left: "29.9%", top: "36.8%", delay: "0.85s" },
  { left: "28.0%", top: "77.8%", delay: "1.55s" },
] as const;

export const RIGHT_LANTERNS = [
  { left: "80.7%", top: "14.8%", delay: "0.35s" },
  { left: "76.6%", top: "48.8%", delay: "1.05s" },
  { left: "85.7%", top: "88.2%", delay: "1.75s" },
] as const;

export const ARRIVAL_LANTERN = { left: "54.2%", top: "73.4%", delay: "0.4s" } as const;

export function AcademyFrame({ children }: { children: ReactNode }) {
  return (
    <div className="academy-shell">
      <div className="academy-art" aria-hidden="true">
        <Bough className="academy-bough-left" src={FRAME_BOUGH_LEFT} lanterns={LEFT_LANTERNS} />
        <Bough className="academy-bough-right" src={FRAME_BOUGH_RIGHT} lanterns={RIGHT_LANTERNS} />
        <div className="academy-arrival">
          <div className="academy-arrival-paint">
            <img src={FRAME_ARRIVAL} alt="" />
            <LanternGlow {...ARRIVAL_LANTERN} />
          </div>
        </div>
      </div>
      <div className="academy-well">{children}</div>
    </div>
  );
}

function Bough({
  className,
  src,
  lanterns,
}: {
  className: string;
  src: string;
  lanterns: readonly { left: string; top: string; delay: string }[];
}) {
  return (
    <div className={`academy-bough ${className}`}>
      <div className="academy-bough-paint">
        <img src={src} alt="" />
        {lanterns.map((lantern) => (
          <LanternGlow key={`${lantern.left}-${lantern.top}`} {...lantern} />
        ))}
      </div>
    </div>
  );
}

function LanternGlow({ left, top, delay }: { left: string; top: string; delay: string }) {
  return <span className="academy-lantern" style={{ left, top, animationDelay: delay }} />;
}
