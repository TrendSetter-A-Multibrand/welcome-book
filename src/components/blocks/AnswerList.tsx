import { Inline } from "@/components/ui/Inline";

/**
 * Список в ответе. Маркированный - с тире, нумерованный - с номерами моно Red
 * (как в статье из конструктора). Один пункт - одна строка поля.
 */
export function AnswerList({
  items,
  numbered,
}: {
  items: string[];
  numbered?: boolean;
}) {
  const Tag = numbered ? "ol" : "ul";
  return (
    <Tag className={`flex flex-col ${numbered ? "gap-3" : "gap-2"}`}>
      {items.map((item, index) => (
        <li key={index} className={`flex items-baseline ${numbered ? "gap-4" : "gap-2"}`}>
          <span
            aria-hidden="true"
            className={numbered ? "t-label w-7 shrink-0 text-red" : "shrink-0 text-text-2"}
          >
            {numbered ? String(index + 1).padStart(2, "0") : "—"}
          </span>
          <span className="t-body min-w-0 flex-1 text-sage">
            <Inline text={item} />
          </span>
        </li>
      ))}
    </Tag>
  );
}
