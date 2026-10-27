import { logout } from "@/app/actions";
import { Logo } from "@/components/layout/Logo";
import { LinkArrow } from "@/components/ui/LinkArrow";

/**
 * Шапка онбординга: логотип Red и «Onboarding · Office». Справа «Обратная связь»
 * (только на десктопе) и «Выйти». 80px, на мобайле 64px; линия снизу.
 */
export function B2BHeader({
  label,
  feedbackHref,
  signOut = false,
}: {
  label: string;
  feedbackHref: string;
  /** Кнопка «Выйти»: только там, где человек вошёл по паролю */
  signOut?: boolean;
}) {
  return (
    <header className="gutter-x flex h-16 items-center justify-between border-b border-line bg-white md:h-20">
      <div className="flex items-center gap-4">
        <Logo color="red" className="w-[120px] md:w-[176px]" />
        <p className="t-caption text-text-2">{label}</p>
      </div>
      {/* Без адреса ссылки нет: пустая «Обратная связь» вела бы в никуда */}
      <div className="flex items-center gap-8">
        {feedbackHref !== "#" ? (
          <div className="hidden md:block">
            <LinkArrow href={feedbackHref}>Обратная связь</LinkArrow>
          </div>
        ) : null}
        {signOut ? (
          <form action={logout}>
            <button
              type="submit"
              className="t-caption cursor-pointer text-sage underline-offset-4 transition-colors duration-200 hover:text-red hover:underline"
            >
              Выйти
            </button>
          </form>
        ) : null}
      </div>
    </header>
  );
}
