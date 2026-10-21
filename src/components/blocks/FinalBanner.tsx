import Image from "next/image";
import { Button } from "@/components/ui/Button";

/**
 * Финальный баннер: красная плоскость, [метка], заголовок Display, лид, белая
 * кнопка и маскот справа, повёрнутый на 12° и обрезанный краем. Маскот - вектор
 * из Figma без изменений, не перекрашивать.
 */
export function FinalBanner({
  label,
  title,
  text,
  buttonLabel,
  buttonHref,
}: {
  label?: string;
  title: string;
  text?: string;
  buttonLabel: string;
  buttonHref: string;
}) {
  return (
    <section className="relative mt-32 flex flex-col gap-2 overflow-hidden bg-red pt-16 md:py-32">
      <div className="gutter-x relative z-10 flex flex-col gap-6 md:max-w-[calc(791px+80px)]">
        {label ? <p className="t-label text-white">[{label}]</p> : null}
        <h2 className="t-display text-white">{title}</h2>
        {text ? <p className="t-body-l max-w-[560px] text-white">{text}</p> : null}
        <div>
          <Button href={buttonHref} variant="inverse">
            {buttonLabel}
          </Button>
        </div>
      </div>

      {/* Мобайл: маскот под текстом, обрезан нижним краем; десктоп: справа по центру */}
      <div
        aria-hidden="true"
        className="flex h-[131px] justify-end overflow-hidden md:pointer-events-none md:absolute md:right-[-30px] md:top-1/2 md:h-auto md:-translate-y-[calc(50%-81px)] md:overflow-visible"
      >
        <div className="flex size-[252px] shrink-0 items-center justify-center md:size-[522px]">
          <Image
            src="/brand/mascot.svg"
            alt=""
            width={440}
            height={440}
            unoptimized
            className="size-[213px] rotate-12 md:size-[440px]"
          />
        </div>
      </div>
    </section>
  );
}
