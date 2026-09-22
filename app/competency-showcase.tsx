"use client";

import { useRef } from "react";
import { COMPETENCY_ICON, competencyStyle } from "@/lib/competency-style";
import { useConnectorPaths, ConnectorOverlay } from "@/app/connector-lines";

type Competency = { title: string; subtitle: string };

// Snake layout, 4-column desktop only (md:): row 1 reads 1→4
// left-to-right, row 2 reads 8→5 (continuing down from 4, then
// right-to-left), row 3 reads 9→12 (continuing down from 8, then
// left-to-right again). Applied purely via CSS `order` — cards render
// in plain 1→12 DOM order otherwise, both for correct top-to-bottom
// reading order at the 2-col/3-col widths the grid collapses to below
// md (where this exact snake shape doesn't fit anyway), and so the
// connector lines — which just draw between wherever competency N and
// N+1 actually land, regardless of visual order — always connect the
// right neighbors without needing their own breakpoint logic.
const ORDER_MD = [
  "md:order-1",
  "md:order-2",
  "md:order-3",
  "md:order-4",
  "md:order-8",
  "md:order-7",
  "md:order-6",
  "md:order-5",
  "md:order-9",
  "md:order-10",
  "md:order-11",
  "md:order-12",
];

const ROTATIONS = ["-1.5deg", "1deg", "-0.75deg", "1.5deg"];

export function CompetencyShowcase({
  competencies,
}: {
  competencies: Competency[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const paths = useConnectorPaths(containerRef, cardRefs, competencies.length);

  return (
    <div ref={containerRef} className="relative">
      <ConnectorOverlay paths={paths} />

      <div className="relative grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
        {competencies.map((c, idx) => {
          const number = idx + 1;
          const palette = competencyStyle(number);
          const rotation = ROTATIONS[idx % ROTATIONS.length];
          return (
            <div
              key={idx}
              ref={(el) => {
                cardRefs.current[number - 1] = el;
              }}
              className={`relative pt-8 ${ORDER_MD[idx]}`}
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
