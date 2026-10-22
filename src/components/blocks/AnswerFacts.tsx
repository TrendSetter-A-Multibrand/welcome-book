import { Inline } from "@/components/ui/Inline";

export type Fact = { label: string; value: string };

/**
 * Список фактов: подпись-колонка моно-капсом и значение. Тонкие линии между
 * строками (не сверху и не снизу). В узкой колонке подпись встаёт над значением.
 * Только подтверждённые данные: адрес, часы, телефон.
 */
export function AnswerFacts({ items }: { items: Fact[] }) {
  return (
    <dl className="@container">
      {items.map((item, index) => (
        <div
          key={index}
          className={`flex flex-col gap-1 py-3 @min-[280px]:flex-row @min-[280px]:gap-3 ${
            index > 0 ? "border-t border-line" : "pt-0"
          }`}
        >
          <dt className="t-caption text-sage @min-[280px]:w-24 @min-[280px]:shrink-0">
            {item.label}
          </dt>
          <dd className="t-body min-w-0 flex-1 text-sage">
            <Inline text={item.value} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
