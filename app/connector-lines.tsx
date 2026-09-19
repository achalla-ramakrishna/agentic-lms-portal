"use client";

import { useEffect, useState, type RefObject } from "react";

type Rect = { x: number; y: number; width: number; height: number };

// Connector path between two cards, computed from their real rendered
// positions (not hardcoded percentages) so it stays correct across a
// grid's responsive column count and each card's rotation/reflow.
// Cards on the same visual row get a straight edge-to-edge line; cards
// on different rows (a grid wrap or a snake-order row change) get a
// curved path between their facing top/bottom edges.
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

// Measures cardRefs[0..count-2] against cardRefs[1..count-1] (consecutive
// pairs) relative to containerRef, recomputing on resize so the paths
// stay correct as the grid reflows to a different column count.
export function useConnectorPaths(
  containerRef: RefObject<HTMLDivElement | null>,
  cardRefs: RefObject<(HTMLElement | null)[]>,
  count: number,
) {
  const [paths, setPaths] = useState<string[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const recompute = () => {
      const containerRect = container.getBoundingClientRect();
      const toRect = (el: HTMLElement): Rect => {
        const r = el.getBoundingClientRect();
        return {
          x: r.left - containerRect.left,
          y: r.top - containerRect.top,
          width: r.width,
          height: r.height,
        };
      };

      const refs = cardRefs.current;
      const next: string[] = [];
      if (refs) {
        for (let i = 1; i < count; i++) {
          const a = refs[i - 1];
          const b = refs[i];
          if (!a || !b) continue;
          next.push(connectorPath(toRect(a), toRect(b)));
        }
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
  }, [containerRef, cardRefs, count]);

  return paths;
}

export function ConnectorOverlay({ paths }: { paths: string[] }) {
  return (
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
  );
}
