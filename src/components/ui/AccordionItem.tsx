"use client";

import { useId, useState } from "react";
import { Icon } from "@/components/ui/Icon";

/**
 * Пункт аккордеона - один компонент на весь сайт: [номер моно Red] вопрос H4 и
 * знак +/−. Раскрытие плавное (300 ms, cubic-bezier(0.4, 0, 0.2, 1)), ответ Text-2
 * выровнен по вопросу. Hover - вопрос красный.
 *
 * Пока у вопроса нет ответа, раскрывать нечего: строка остаётся строкой, без
 * знака и кнопки, а не обещает то, чего нет.
 */
export function AccordionItem({
  number,
  question,
  answer,
}: {
  number: string;
  question: string;
  /** Готовый ответ: абзацы и блоки. Нет ответа - null, и пункт не раскрывается */
  answer: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const panel = useId();

  const head = (
    <>
      <span className="t-num-h4 shrink-0 text-red">{number}</span>
      <span className="t-h4 min-w-0 flex-1 text-left transition-colors group-hover:text-red">
        {question}
      </span>
    </>
  );

  if (!answer) {
    return (
      <div className="flex min-h-14 items-baseline gap-3 border-t border-line py-4 first:border-t-0 md:gap-4">
        {head}
      </div>
    );
  }

  return (
    <div className="border-t border-line first:border-t-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panel}
        onClick={() => setOpen((value) => !value)}
        className="group flex min-h-14 w-full cursor-pointer items-center justify-between gap-4 py-4 text-sage"
      >
        <span className="flex min-w-0 flex-1 items-baseline gap-3 md:gap-4">{head}</span>
        <Icon name={open ? "minus" : "plus"} size={24} />
      </button>

      <div
        id={panel}
        role="region"
        className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex max-w-[720px] flex-col gap-4 pb-6 pl-8 md:pl-[47px]">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
}
