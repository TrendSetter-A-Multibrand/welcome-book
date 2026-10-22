import { Icon } from "@/components/ui/Icon";

/**
 * Шаг первого дня: плашка Paper, красный номер, иконка шага, заголовок H4.
 * Без галочек. На мобайле - строка от 72px, в широкой колонке - карточка 220px.
 */
export function StepTile({
  number,
  title,
  icon,
}: {
  number: string;
  title: string;
  icon?: string;
}) {
  return (
    <li className="flex min-h-[72px] items-center gap-4 bg-paper p-4 @min-[640px]:min-h-[220px] @min-[640px]:flex-col @min-[640px]:items-stretch @min-[640px]:justify-between @min-[640px]:gap-6 @min-[640px]:p-6">
      <div className="flex shrink-0 items-center gap-3 @min-[640px]:justify-between">
        <span className="t-num-h2 text-red">{number}</span>
        {icon ? (
          <Icon name={icon} className="size-6 @min-[640px]:size-10" />
        ) : null}
      </div>
      <p className="t-h4 min-w-0 flex-1 text-sage @min-[640px]:flex-none">{title}</p>
    </li>
  );
}
