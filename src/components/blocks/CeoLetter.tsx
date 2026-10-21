import Image from "next/image";
import { Icon } from "@/components/ui/Icon";

/**
 * Письмо CEO: плашка Paper, красная кавычка, цитата. В широкой колонке цитата
 * слева, справа квадратное фото 300 с именем и ролью под ним; на мобайле фото
 * 56 стоит рядом с именем.
 */
export function CeoLetter({
  quote,
  name,
  role,
  photo,
}: {
  quote: string;
  name: string;
  role?: string;
  photo?: { src: string; alt: string };
}) {
  return (
    <figure className="flex flex-col gap-6 bg-paper p-6 md:p-12 @min-[640px]:flex-row @min-[640px]:gap-12">
      <div className="flex min-w-0 flex-1 flex-col gap-6 @min-[640px]:justify-between">
        <Icon
          name="quote"
          className="h-[22.8px] w-8 text-red @min-[640px]:h-[28.6px] @min-[640px]:w-10"
        />
        {/* Размер цитаты подбирается под колонку (в макете H3…H1): 40px влезает,
            только когда под текст остаётся ~450px, иначе длинные слова вылезают. */}
        <blockquote className="t-h3 text-sage [overflow-wrap:anywhere] @min-[880px]:t-h2">
          {quote}
        </blockquote>
      </div>

      <figcaption className="flex items-center gap-4 @min-[640px]:flex-col @min-[640px]:items-start">
        <div className="relative flex size-14 shrink-0 items-center justify-center bg-line @min-[640px]:size-[300px]">
          {photo ? (
            <Image
              src={photo.src}
              alt={photo.alt || name}
              fill
              sizes="(min-width: 640px) 300px, 56px"
              className="object-cover"
            />
          ) : (
            <span className="t-caption hidden text-text-2 @min-[640px]:inline">Фото CEO</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <span className="t-h4 text-sage">{name}</span>
          {role ? <span className="t-caption text-text-2">{role}</span> : null}
        </div>
      </figcaption>
    </figure>
  );
}
