import { SubTitle } from "@/components/ui/SubTitle";
import { KpiTile } from "@/components/blocks/KpiTile";

export type Kpi = { label: string; value: string; note?: string };

/** «О нас в цифрах»: 2×2 на мобайле, четыре в ряд в широкой колонке. */
export function KpiGroup({ title, items }: { title: string; items: Kpi[] }) {
  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <SubTitle>{title}</SubTitle>
      <ul className="grid grid-cols-2 gap-3 @min-[760px]:grid-cols-4 @min-[760px]:gap-6">
        {items.map((item) => (
          <KpiTile key={item.label} {...item} />
        ))}
      </ul>
    </div>
  );
}
