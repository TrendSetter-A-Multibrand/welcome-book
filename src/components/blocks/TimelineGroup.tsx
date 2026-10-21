import { SubTitle } from "@/components/ui/SubTitle";
import { Timeline, type Milestone } from "@/components/blocks/Timeline";

/** «Как мы росли»: подзаголовок и таймлайн. */
export function TimelineGroup({
  title,
  items,
}: {
  title: string;
  items: Milestone[];
}) {
  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <SubTitle>{title}</SubTitle>
      <Timeline items={items} />
    </div>
  );
}
