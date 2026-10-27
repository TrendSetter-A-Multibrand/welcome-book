"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { login, type LoginState } from "@/app/actions";
import { Icon } from "@/components/ui/Icon";

export type LoginTexts = {
  eyebrow: string;
  title: string;
  titleError: string;
  lead: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  button: string;
  hint: string;
  errorHint: string;
};

const FIELD =
  "h-14 w-full border bg-white pr-3 pl-4 text-[16px] leading-normal text-sage outline-none placeholder:text-text-2 focus:border-red focus:shadow-[inset_0_0_0_1px_var(--color-red)]";

const LABEL = "t-caption text-sage";

/**
 * Форма входа по макету «Password gate»: почта, пароль с кнопкой «показать»,
 * «Войти» и подсказка. Ошибка меняет заголовок на «Хм, не подошло.», красит поля
 * и подсказку. Тексты приходят из Storyblok (история `login`).
 */
export function LoginForm({ texts }: { texts: LoginTexts }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {
    failed: false,
    email: "",
  });
  const [shown, setShown] = useState(false);
  const email = useRef<HTMLInputElement>(null);

  // Автофокус только на десктопе: на телефоне он поднимает клавиатуру при входе
  useEffect(() => {
    if (window.matchMedia("(min-width: 48rem)").matches) email.current?.focus();
  }, []);

  const border = state.failed ? "border-red" : "border-sage";

  return (
    <form action={action} className="flex w-full flex-col gap-4 md:w-[553px] md:gap-6">
      <p className="t-caption text-text-2">{texts.eyebrow}</p>
      <h1 className="t-h1">{state.failed ? texts.titleError : texts.title}</h1>
      <p className="t-body-l">{texts.lead}</p>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className={LABEL}>
          {texts.emailLabel}
        </label>
        <input
          ref={email}
          id="email"
          name="email"
          type="text"
          autoComplete="username"
          required
          defaultValue={state.email}
          placeholder={texts.emailPlaceholder}
          aria-invalid={state.failed}
          className={`${FIELD} ${border}`}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className={LABEL}>
          {texts.passwordLabel}
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={shown ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder={texts.passwordPlaceholder}
            aria-invalid={state.failed}
            className={`${FIELD} pr-14 ${border}`}
          />
          <button
            type="button"
            onClick={() => setShown((value) => !value)}
            aria-label={shown ? "Скрыть пароль" : "Показать пароль"}
            aria-pressed={shown}
            className={`absolute top-1.5 right-1.5 flex size-11 items-center justify-center ${
              shown ? "text-red" : "text-sage"
            }`}
          >
            <Icon name="eye" size={24} />
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="t-button h-14 w-full bg-red px-8 text-white transition-colors duration-200 hover:bg-sage disabled:opacity-70"
      >
        {texts.button}
      </button>

      <p
        role={state.failed ? "alert" : undefined}
        className={`t-body-s ${state.failed ? "text-red" : "text-text-2"}`}
      >
        {state.failed ? texts.errorHint : texts.hint}
      </p>
    </form>
  );
}
