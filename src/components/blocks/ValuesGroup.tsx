import { SubTitle } from "@/components/ui/SubTitle";
import { ValueTile, type ValueColor } from "@/components/blocks/ValueTile";

export type Value = {
  title: string;
  text?: string;
  color: ValueColor;
  icon?: string;
  number?: string;
};

/**
 * «Наши ценности»: на мобайле лента со свайпом (плитки 280), в широкой колонке
 * сетка 2-3 в ряд.
 */
export function ValuesGroup({ title, items }: { title: string; items: Value[] }) {
  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <SubTitle>{title}</SubTitle>
      <ul className="lane -mx-4 flex snap-x gap-3 overflow-x-auto px-4 [scroll-padding-inline:16px] md:mx-0 md:px-0 @min-[640px]:grid @min-[640px]:grid-cols-2 @min-[640px]:gap-6 @min-[640px]:overflow-visible @min-[800px]:grid-cols-3">
        {items.map((item, index) => (
          <ValueTile
            key={item.title}
            {...item}
            number={item.number ?? String(index + 1).padStart(2, "0")}
          />
        ))}
      </ul>
    </div>
  );
}
