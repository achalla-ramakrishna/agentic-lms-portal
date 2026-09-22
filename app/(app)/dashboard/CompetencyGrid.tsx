"use client";

import Link from "next/link";
import { useRef } from "react";
import { COMPETENCY_ICON, competencyStyle } from "@/lib/competency-style";
import { useConnectorPaths, ConnectorOverlay } from "@/app/connector-lines";

type CompetencyCardData = {
  number: number;
  title: string;
  passed: number;
  total: number;
};

export function CompetencyGrid({
  competencies,
}: {
  competencies: CompetencyCardData[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const paths = useConnectorPaths(containerRef, cardRefs, competencies.length);

  return (
    <div ref={containerRef} className="relative">
      <ConnectorOverlay paths={paths} />

      <div className="relative grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3">
        {competencies.map((c) => {
          const palette = competencyStyle(c.number);
          const pct = c.total === 0 ? 0 : Math.round((c.passed / c.total) * 100);
          return (
            <Link
              key={c.number}
              ref={(el) => {
                cardRefs.current[c.number - 1] = el;
              }}
              href={`/competencies/${c.number}`}
              className="relative block pt-6"
            >
              <span className="absolute -top-1 left-1 font-mono text-xs font-bold text-fg-subtle">
                {String(c.number).padStart(2, "0")}
              </span>
              {/* White photo-frame mount, matching the landing page's card style */}
              <div className="relative rounded-[28px] bg-white p-2.5 pt-5 shadow-lg transition-shadow hover:shadow-xl">
                <span
                  className="absolute -top-1.5 left-4 h-3 w-3 rounded-full shadow-md ring-2 ring-white"
                  style={{ backgroundColor: palette.border }}
                  aria-hidden="true"
                />
                <span
                  className="absolute -top-2.5 -right-2.5 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white text-sm shadow-md"
                  style={{ borderColor: palette.border }}
                  aria-hidden="true"
                >
                  {COMPETENCY_ICON[c.number]}
                </span>
                <div
                  className="rounded-[20px] border-2 p-3 text-left"
                  style={{ backgroundColor: palette.bg, borderColor: palette.border }}
                >
                  <div className="text-sm font-bold" style={{ color: palette.text }}>
                    {c.title}
                  </div>
                  <div className="mt-1.5 text-xs font-semibold" style={{ color: palette.text }}>
                    {c.passed}/{c.total} passed
                  </div>
                  <div
                    className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full"
                    style={{ backgroundColor: `${palette.border}33` }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: palette.border }}
                    />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
