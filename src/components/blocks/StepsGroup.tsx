import { StepTile } from "@/components/blocks/StepTile";

export type Step = { title: string; icon?: string; number?: string };

/** Шаги первого дня: список строк на мобайле, 2-3 карточки в ряд в широкой колонке. */
export function StepsGroup({ items }: { items: Step[] }) {
  return (
    <ol className="flex flex-col gap-3 @min-[640px]:grid @min-[640px]:grid-cols-2 @min-[640px]:gap-6 @min-[800px]:grid-cols-3">
      {items.map((item, index) => (
        <StepTile
          key={item.title}
          {...item}
          number={item.number ?? String(index + 1).padStart(2, "0")}
        />
      ))}
    </ol>
  );
}
