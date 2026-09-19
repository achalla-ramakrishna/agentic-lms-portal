"use client";

import { useEffect, useRef, useState } from "react";
import { COMPETENCY_ICON, competencyStyle } from "@/lib/competency-style";

type Competency = { title: string; subtitle: string };

// Snake layout: row 1 reads 1→4 left-to-right, row 2 reads 8→5
// (continuing down from 4, then right-to-left), row 3 reads 9→12
// (continuing down from 8, then left-to-right again) — matches the
// reference numbering flow.
const SNAKE_ORDER = [0, 1, 2, 3, 7, 6, 5, 4, 8, 9, 10, 11];

const ROTATIONS = ["-1.5deg", "1deg", "-0.75deg", "1.5deg"];

type Rect = { x: number; y: number; width: number; height: number };

// Connector path between two cards, computed from their real rendered
// positions (not hardcoded percentages) so it stays correct across the
// grid's responsive column count and each card's rotation/reflow.
function connectorPath(a: Rect, b: Rect): string {
  const sameRow =
    Math.abs(a.y + a.height / 2 - (b.y + b.height / 2)) <
    Math.min(a.height, b.height) / 2;

  if (sameRow) {
    const [left, right] = a.x <= b.x ? [a, b] : [b, a];
    const start = { x: left.x + left.width, y: left.y + left.height / 2 };
    const end = { x: right.x, y: right.y + right.height / 2 };
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  }

  const [top, bottom] = a.y <= b.y ? [a, b] : [b, a];
  const start = { x: top.x + top.width / 2, y: top.y + top.height };
  const end = { x: bottom.x + bottom.width / 2, y: bottom.y };
  const midY = (start.y + end.y) / 2;
  return `M ${start.x} ${start.y} C ${start.x} ${midY}, ${end.x} ${midY}, ${end.x} ${end.y}`;
}

export function CompetencyShowcase({
  competencies,
}: {
  competencies: Competency[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [paths, setPaths] = useState<string[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const recompute = () => {
      const containerRect = container.getBoundingClientRect();
      const toRect = (el: HTMLDivElement): Rect => {
        const r = el.getBoundingClientRect();
        return { x: r.left - containerRect.left, y: r.top - containerRect.top, width: r.width, height: r.height };
      };

      const next: string[] = [];
      for (let number = 1; number < 12; number++) {
        const a = cardRefs.current[number - 1];
        const b = cardRefs.current[number];
        if (!a || !b) continue;
        next.push(connectorPath(toRect(a), toRect(b)));
      }
      setPaths(next);
    };

    recompute();
    const observer = new ResizeObserver(recompute);
    observer.observe(container);
    window.addEventListener("resize", recompute);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", recompute);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        aria-hidden="true"
      >
        {paths.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeDasharray="5 5"
            className="text-fg-subtle"
          />
        ))}
      </svg>

      <div className="relative grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
        {SNAKE_ORDER.map((idx, position) => {
          const c = competencies[idx];
          const number = idx + 1;
          const palette = competencyStyle(number);
          const rotation = ROTATIONS[position % ROTATIONS.length];
          return (
            <div
              key={idx}
              ref={(el) => {
                cardRefs.current[number - 1] = el;
              }}
              className="relative pt-8"
              style={{ transform: `rotate(${rotation})` }}
            >
              <span className="absolute -top-1 left-2 font-mono text-sm font-bold text-fg-subtle">
                {String(number).padStart(2, "0")}
              </span>
              {/* White photo-frame mount, like a pinned card on a corkboard */}
              <div className="relative rounded-[36px] bg-white p-3.5 pt-6 shadow-xl">
                <span
                  className="absolute -top-1.5 left-5 h-3.5 w-3.5 rounded-full shadow-md ring-2 ring-white"
                  style={{ backgroundColor: palette.border }}
                  aria-hidden="true"
                />
                <span
                  className="absolute -top-3 -right-3 flex h-9 w-9 items-center justify-center rounded-full border-2 bg-white text-base shadow-md"
                  style={{ borderColor: palette.border }}
                  aria-hidden="true"
                >
                  {COMPETENCY_ICON[number]}
                </span>
                <div
                  className="rounded-[24px] border-2 p-4 text-left"
                  style={{ backgroundColor: palette.bg, borderColor: palette.border }}
                >
                  <h3 className="text-sm font-bold" style={{ color: palette.text }}>
                    {c.title}
                  </h3>
                  <p className="mt-1 text-xs leading-snug" style={{ color: palette.text }}>
                    {c.subtitle}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
