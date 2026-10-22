import { Inline } from "@/components/ui/Inline";

export type Contact = { label: string; lines: string[] };

/**
 * Контакты: [подпись] моно-капсом и строки Body L, ссылки подчёркнуты, линии
 * между группами. Для «Если остались вопросы»: к кому и куда писать.
 */
export function AnswerContacts({ items }: { items: Contact[] }) {
  return (
    <div className="flex flex-col">
      {items.map((item, index) => (
        <div
          key={index}
          className={`flex flex-col gap-2 py-4 ${index > 0 ? "border-t border-line" : "pt-0"}`}
        >
          <p className="t-label text-sage">[{item.label}]</p>
          {item.lines.map((line, lineIndex) => (
            <p key={lineIndex} className="t-body-l text-sage">
              <Inline text={line} />
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}
