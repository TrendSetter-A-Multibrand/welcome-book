import { SubTitle } from "@/components/ui/SubTitle";
import { BrandTile } from "@/components/blocks/BrandTile";

export type Brand = { name: string; logo?: { src: string; alt: string } };

/** «Наши бренды»: на мобайле лента со свайпом, в широкой колонке пять в ряд. */
export function BrandsGroup({ title, items }: { title: string; items: Brand[] }) {
  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <SubTitle>{title}</SubTitle>
      <ul className="lane -mx-4 flex snap-x gap-3 overflow-x-auto px-4 [scroll-padding-inline:16px] md:mx-0 md:px-0 @min-[760px]:grid @min-[760px]:grid-cols-5 @min-[760px]:gap-6 @min-[760px]:overflow-visible">
        {items.map((item) => (
          <BrandTile key={item.name} {...item} />
        ))}
      </ul>
    </div>
  );
}
