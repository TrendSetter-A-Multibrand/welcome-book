/**
 * Подзаголовок внутри секции: красный моно-номер и заголовок H3 на одной
 * базовой линии. Номер необязателен: «Наши ценности» стоят без него.
 */
export function SubTitle({
  number,
  children,
}: {
  number?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline gap-3 md:gap-4">
      {number ? <span className="t-num-h3 shrink-0 text-red">{number}</span> : null}
      <h3 className="t-h3 min-w-0 flex-1 text-sage">{children}</h3>
    </div>
  );
}
