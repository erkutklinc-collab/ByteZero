"use client";

import { useRef, useEffect, useState, Children, type ReactNode } from "react";

export function FitItems({ children, gap = 24, className }: { children: ReactNode; gap?: number; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(Children.count(children));

  useEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    function update() {
      const itemHeight = measure!.offsetHeight;
      if (itemHeight === 0) return;
      const available = container!.clientHeight;
      const count = Math.floor((available + gap) / (itemHeight + gap));
      setVisibleCount(Math.max(1, count));
    }

    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, [children, gap]);

  const items = Children.toArray(children);

  return (
    <div ref={containerRef} className={className}>
      {/* Hidden measurer for a single item */}
      <div ref={measureRef} className="invisible absolute" aria-hidden>
        {items[0]}
      </div>
      {items.slice(0, visibleCount)}
    </div>
  );
}
