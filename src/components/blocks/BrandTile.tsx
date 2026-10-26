import Image from "next/image";

/** Официальные логотипы из макета: подставляются, пока редактор не загрузил свой файл */
const BRAND_LOGOS: Record<string, string> = {
  "h&m": "/brand/logos/hm.svg",
  mothercare: "/brand/logos/mothercare.svg",
  "lee cooper": "/brand/logos/lee-cooper.svg",
  "asos design": "/brand/logos/asos.svg",
  asos: "/brand/logos/asos.svg",
  timberland: "/brand/logos/timberland.svg",
};

/**
 * Плитка бренда: логотип на Paper, снизу плашка Sage с названием, рамка цвета
 * плашки. Не ссылка - без стрелки и hover. Пока логотип не загружен, на его
 * месте подпись-заглушка: официальные файлы брендов кладёт редактор.
 */
export function BrandTile({
  name,
  logo,
}: {
  name: string;
  logo?: { src: string; alt: string };
}) {
  const fallback = BRAND_LOGOS[name.trim().toLowerCase()];
  const picture = logo ?? (fallback ? { src: fallback, alt: name } : undefined);
  return (
    <li className="flex w-40 shrink-0 snap-start flex-col border border-sage bg-white @min-[760px]:w-auto">
      <div className="relative flex h-[158px] items-center justify-center bg-paper p-8">
        {picture ? (
          <Image
            src={picture.src}
            alt={picture.alt || name}
            fill
            sizes="160px"
            className="object-contain p-8"
          />
        ) : (
          <span className="t-caption text-center text-text-2">Логотип {name}</span>
        )}
      </div>
      <div className="t-label bg-sage px-3 py-3 text-white md:px-4">{name}</div>
    </li>
  );
}
