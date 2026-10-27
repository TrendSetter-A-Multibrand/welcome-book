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
    lead: "Введи логин и пароль, которые прислал HR, — и мы откроем твою версию онбординга.",
    email_label: "Логин",
    email_placeholder: "Введи логин",
    password_label: "Пароль",
    password_placeholder: "Введи пароль",
    button: "Войти",
    hint: "Логин и пароль для офиса и для магазинов разные — они сами откроют нужную версию.",
    error_hint: "Логин или пароль не верный. Проверь раскладку и попробуй ещё раз.",
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
