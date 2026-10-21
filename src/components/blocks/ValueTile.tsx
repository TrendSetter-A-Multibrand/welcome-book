import { Icon } from "@/components/ui/Icon";

/**
 * Плитка ценности: плоская плашка палитры, сверху номер (моно, размер H2) и
 * иконка, снизу заголовок H3 и текст. Цвет текста: белый на Red/Blue/Sage, Sage
 * на Mint/Yellow/Paper - его выбирает палитра, а не редактор.
 */
export const VALUE_COLORS = {
  red: "bg-red text-white",
  blue: "bg-blue text-white",
  mint: "bg-mint text-sage",
  yellow: "bg-yellow text-sage",
  sage: "bg-sage text-white",
  paper: "bg-paper text-sage",
} as const;

export type ValueColor = keyof typeof VALUE_COLORS;

export function ValueTile({
  number,
  title,
  text,
  color,
  icon,
}: {
  number: string;
  title: string;
  text?: string;
  color: ValueColor;
  icon?: string;
}) {
  return (
    <li
      className={`flex h-[280px] w-[280px] shrink-0 snap-start flex-col justify-between p-8 md:h-[300px] @min-[640px]:w-auto ${VALUE_COLORS[color]}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="t-num-h2 text-[40px]">{number}</span>
        {icon ? <Icon name={`v-${icon}`} size={40} /> : null}
      </div>
      <div className="flex flex-col gap-2">
        <h4 className="t-h3">{title}</h4>
        {text ? <p className="t-body">{text}</p> : null}
      </div>
    </li>
  );
}
