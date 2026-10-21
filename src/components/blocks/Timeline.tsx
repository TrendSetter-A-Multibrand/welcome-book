"use client";

import { useEffect, useRef, useState } from "react";

export type Milestone = { year: string; text: string };

/**
 * Таймлайн «Как мы росли». Линия 2px Paper заполняется красным по мере
 * чтения; пройденная веха - красный квадрат на линии; текущий текст - Sage,
 * будущие - Text-2. В колонке ≥ 760 слева липкий счётчик года (смена - подъём
 * 450 ms), на мобайле год стоит над каждой вехой.
 *
 * «Пройденной» веха считается, когда её маркер поднялся выше середины экрана.
 */
export function Timeline({ items }: { items: Milestone[] }) {
  const listRef = useRef<HTMLDivElement>(null);
  const markers = useRef<(HTMLSpanElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [fill, setFill] = useState(0);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.5;

      let passed = 0;
      markers.current.forEach((marker, index) => {
        if (marker && marker.getBoundingClientRect().top <= line) passed = index;
      });

      const box = list.getBoundingClientRect();
      setActive(passed);
      setFill(Math.min(Math.max(line - box.top, 0), box.height));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [items.length]);

  if (!items.length) return null;

  return (
    <div className="@min-[760px]:grid @min-[760px]:grid-cols-[322px_1fr] @min-[760px]:gap-6">
      <div className="hidden @min-[760px]:block" aria-hidden="true">
        <div className="sticky top-[calc(50vh-48px)]">
          <p key={active} className="year-in t-display text-red">
            {items[active]?.year}
          </p>
        </div>
      </div>

      <div ref={listRef} className="relative">
        <div aria-hidden="true" className="absolute inset-y-0 left-0 w-0.5 bg-paper" />
        <div
          aria-hidden="true"
          className="absolute left-0 top-0 w-0.5 bg-red"
          style={{ height: fill }}
        />

        <ol className="flex flex-col gap-12 @min-[760px]:gap-24">
          {items.map((item, index) => {
            const reached = index <= active;
            return (
              <li
                key={item.year}
                className="relative flex flex-col gap-2 pl-8 @min-[760px]:pl-12"
              >
                <span
                  ref={(element) => {
                    markers.current[index] = element;
                  }}
                  aria-hidden="true"
                  className={`absolute -left-[5px] top-3 size-3 @min-[760px]:top-1 ${
                    reached ? "bg-red" : "bg-line"
                  }`}
                />
                <p
                  className={`t-h1 @min-[760px]:t-label ${
                    reached ? "text-red @min-[760px]:text-text-2" : "text-muted"
                  }`}
                >
                  {item.year}
                </p>
                <p
                  className={`t-body-l @min-[760px]:t-h3 ${
                    reached ? "text-sage" : "text-text-2"
                  }`}
                >
                  {item.text}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
