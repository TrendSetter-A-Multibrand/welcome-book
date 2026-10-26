import Image from "next/image";
import { Icon } from "@/components/ui/Icon";

/**
 * Письмо CEO: плашка Paper, красная кавычка по правому краю, цитата, ниже
 * смайл-маскот 56 с именем и ролью. Загруженное фото не показываем: вместо него
 * везде наш маскот (поле `photo` оставлено в схеме, чтобы не ломать контент).
 */
export function CeoLetter({
  quote,
  name,
  role,
}: {
  quote: string;
  name: string;
  role?: string;
  photo?: { src: string; alt: string };
}) {
  return (
    <figure className="flex flex-col gap-6 bg-paper p-6 md:gap-12 md:p-12">
      <Icon
        name="quote"
        className="h-[22.8px] w-8 self-end text-red @min-[640px]:h-[28.6px] @min-[640px]:w-10"
      />
      {/* По макету: 19px на мобайле, 22px на десктопе; абзацы цитаты - переносами строк */}
      <blockquote className="whitespace-pre-line text-[19px] leading-[1.2] font-medium tracking-[-0.01em] text-sage [overflow-wrap:anywhere] md:text-[22px] md:leading-[1.25] md:tracking-normal">
        {quote}
      </blockquote>

      <figcaption className="flex items-center gap-4">
        <Image
          src="/brand/mascot.svg"
          alt=""
          width={56}
          height={56}
          className="size-14 shrink-0"
        />
        <div className="flex flex-col gap-1">
          <span className="text-[17px] leading-[1.25] font-medium text-sage">
            {name}
          </span>
          {role ? (
            <span className="font-mono text-[11px] leading-[1.3] tracking-[0.04em] text-text-2 uppercase">
              {role}
            </span>
          ) : null}
        </div>
      </figcaption>
    </figure>
  );
}
