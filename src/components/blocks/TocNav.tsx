"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";

export type TocItem = { id: string; number: string; label: string };

/**
 * Какой раздел сейчас читают и сколько документа пройдено.
 *
 * Текущим считается последний раздел, верх которого поднялся выше 30% экрана
 * (scroll spy). Прогресс - доля пройденного пути от верха документа до его
 * низа, в процентах.
 */
function useReading(items: TocItem[], docId: string) {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  // Список приходит новым массивом на каждый рендер, поэтому следим за его
  // содержимым, а не за ссылкой: иначе подписка на прокрутку пересоздавалась бы
  // при каждом шаге прогресса.
  const key = items.map((item) => item.id).join("|");

  useEffect(() => {
    const ids = key.split("|");
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.3;

      let current = 0;
      ids.forEach((id, index) => {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= line) current = index;
      });
      setActive(current);

      const doc = document.getElementById(docId);
      if (doc) {
        const box = doc.getBoundingClientRect();
        const path = box.height - window.innerHeight * 0.5;
        const walked = window.innerHeight * 0.5 - box.top;
        setProgress(path > 0 ? Math.min(Math.max(walked / path, 0), 1) * 100 : 0);
      }
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
  }, [key, docId]);

  return { active, progress };
}

/**
 * Боковое оглавление (≥ 1000px): колонки 1-3, липнет; текущий раздел красный и
 * Medium; под списком полоса прогресса чтения 2px.
 */
export function TocSidebar({ items, docId }: { items: TocItem[]; docId: string }) {
  const { active, progress } = useReading(items, docId);

  return (
    <nav aria-label="Содержание" className="flex flex-col gap-3">
      <p className="t-caption text-text-2">Содержание</p>
      <ul>
        {items.map((item, index) => {
          const current = index === active;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={current ? "location" : undefined}
                className={`flex min-h-11 items-center gap-3 transition-colors hover:text-red ${
                  current ? "text-red" : "text-sage"
                }`}
              >
                <span className={`t-caption shrink-0 ${current ? "" : "text-text-2"}`}>
                  {item.number}
                </span>
                <span className={current ? "t-h4" : "t-body-l"}>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
      <div aria-hidden="true" className="mt-3 h-0.5 bg-paper">
        <div className="h-0.5 bg-red" style={{ width: `${progress}%` }} />
      </div>
    </nav>
  );
}

/**
 * Переключатель разделов (телефоны и узкие окна): липкая строка 56px под шапкой
 * «02 Культура · Разделы ⌄». Прогресс чтения - на её нижней линии. Открытый
 * список ложится поверх контента; Esc и клик мимо закрывают его.
 */
export function TocSwitcher({ items, docId }: { items: TocItem[]; docId: string }) {
  const { active, progress } = useReading(items, docId);
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const now = items[active];

  return (
    <div className="sticky top-0 z-30 bg-white toc:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="toc-list"
        onClick={() => setOpen((value) => !value)}
        className="gutter-x flex h-14 w-full cursor-pointer items-center justify-between gap-4 border-b border-line text-left"
      >
        <span className="flex min-w-0 flex-1 items-baseline gap-3">
          <span className="t-caption text-red">{now?.number}</span>
          <span className="t-h4 truncate text-sage">{now?.label}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1">
          <span className="t-caption text-text-2">Разделы</span>
          <Icon
            name="chevron"
            size={20}
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      <div
        aria-hidden="true"
        className="absolute left-0 top-[55px] h-0.5 bg-red"
        style={{ width: `${progress}%` }}
      />

      {open ? (
        <>
          <button
            type="button"
            aria-label="Закрыть оглавление"
            onClick={close}
            className="fixed inset-0 -z-10 cursor-default bg-transparent"
          />
          <ul
            id="toc-list"
            className="gutter-x absolute inset-x-0 top-14 border-b border-sage bg-white"
          >
            {items.map((item, index) => (
              <li key={item.id} className="border-t border-line first:border-t-0">
                <a
                  href={`#${item.id}`}
                  onClick={close}
                  aria-current={index === active ? "location" : undefined}
                  className={`flex min-h-14 items-center gap-3 ${
                    index === active ? "text-red" : "text-sage"
                  }`}
                >
                  <span
                    className={`t-caption shrink-0 ${index === active ? "" : "text-text-2"}`}
                  >
                    {item.number}
                  </span>
                  <span className="t-body">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
