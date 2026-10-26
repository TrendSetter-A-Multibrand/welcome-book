import type { Story } from "@/lib/storyblok/fetchStory";
import { createBuilder } from "./blok.ts";

/** Тексты окна входа. В Storyblok это история `login`; пока токена нет - отсюда */
export function loginContent() {
  const b = createBuilder("login");
  return b("login_page", {
    header_label: "Onboarding",
    eyebrow: "[Onboarding]",
    title: "Привет!",
    title_error: "Хм, не подошло.",
    lead: "Введи пароль, который прислал HR, — и мы откроем твою версию онбординга.",
    email_label: "Корпоративная почта",
    email_placeholder: "Введи адрес электронной почты",
    password_label: "Пароль",
    password_placeholder: "Введи пароль",
    button: "Войти",
    hint: "Пароль для офиса и для магазинов разный — он сам откроет нужную версию.",
    error_hint: "Пароль/Адрес электронной почты не верный. Проверь раскладку и попробуй ещё раз.",
    meta_title: "Вход",
  });
}

export function loginStory(): Story {
  return {
    id: 0,
    uuid: "seed-login",
    name: "Вход",
    slug: "login",
    full_slug: "login",
    content: loginContent(),
    published_at: null,
  };
}
