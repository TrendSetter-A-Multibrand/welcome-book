import { logout } from "@/app/actions";
import { Logo } from "@/components/layout/Logo";
import { Icon } from "@/components/ui/Icon";
import { isExternal } from "@/lib/blok";

/**
 * Шапка онбординга: логотип Red и «Onboarding · Office». Справа на десктопе
 * текстом «Обратная связь» и «Выйти», на мобайле - красная кнопка выхода. 80px, на мобайле 64px; линия снизу.
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
      <div className="flex items-center gap-10">
        {/* На десктопе «Обратная связь» и «Выйти» - простой текст; на мобайле - только красная кнопка выхода */}
        {feedbackHref !== "#" ? (
          <a
            href={feedbackHref}
            {...(isExternal(feedbackHref)
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="t-label hidden text-sage transition-colors hover:text-red md:block"
          >
            Обратная связь
          </a>
        ) : null}
        {signOut ? (
          <form action={logout}>
            <button
              type="submit"
              aria-label="Выйти"
              className="t-label flex size-12 cursor-pointer items-center justify-center bg-red text-white transition-colors duration-200 hover:bg-sage md:size-auto md:bg-transparent md:text-sage md:hover:bg-transparent md:hover:text-red"
            >
              <Icon name="logout" size={24} className="md:hidden" />
              <span className="hidden md:inline">Выйти</span>
            </button>
          </form>
        ) : null}
      </div>
    </header>
  );
}
