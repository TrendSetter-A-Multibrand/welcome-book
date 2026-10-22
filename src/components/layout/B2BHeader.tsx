import { Logo } from "@/components/layout/Logo";
import { LinkArrow } from "@/components/ui/LinkArrow";

/**
 * Шапка онбординга: логотип Red и «Onboarding · Office». Справа «Обратная связь»
 * - только на десктопе. 80px, на мобайле 64px; линия снизу.
 */
export function B2BHeader({
  label,
  feedbackHref,
}: {
  label: string;
  feedbackHref: string;
}) {
  return (
    <header className="gutter-x flex h-16 items-center justify-between border-b border-line bg-white md:h-20">
      <div className="flex items-center gap-4">
        <Logo color="red" className="w-[120px] md:w-[176px]" />
        <p className="t-caption text-text-2">{label}</p>
      </div>
      {/* Без адреса ссылки нет: пустая «Обратная связь» вела бы в никуда */}
      {feedbackHref !== "#" ? (
        <div className="hidden md:block">
          <LinkArrow href={feedbackHref}>Обратная связь</LinkArrow>
        </div>
      ) : null}
    </header>
  );
}
