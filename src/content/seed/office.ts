import type { Block, Story } from "@/lib/storyblok/fetchStory";
import { createBuilder, link } from "./blok.ts";
import {
  businessQa,
  cultureSection,
  feedbackGroup,
  finalBanner,
  greetingSection,
  LINKS,
  pageHead,
  socialLinks,
} from "./sections.ts";

/**
 * Welcome Book · Office. Тексты - из макета Figma («Онбординг · Office»).
 * Ответы в FAQ у макета есть только у «Рабочего графика»: остальные пункты
 * пока без ответа, их допишут в Storyblok (пункт без ответа не раскрывается).
 */
export function officeContent(): Block {
  const b = createBuilder("office");

  const firstDay = b("doc_section", {
    nav_label: "Первый день",
    title: "Твоя точка старта",
    lead: "Без жёсткого тайминга — спокойный маршрут первого дня, чтобы познакомиться с компанией, людьми и рабочей средой.",
    content: [
      b("steps_group", {
        items: [
          b("step_tile", { title: "Оформление документов", icon: "doc" }),
          b("step_tile", {
            title: "Настройка рабочих инструментов и получение доступов",
            icon: "clipboard",
          }),
          b("step_tile", { title: "Установочная встреча с руководителем", icon: "target" }),
          b("step_tile", { title: "Знакомство с командой", icon: "team" }),
          b("step_tile", { title: "Экскурсия по офису", icon: "office" }),
          b("step_tile", { title: "Обед с коллегами", icon: "lunch" }),
        ],
      }),
    ],
  });

  const resources = b("doc_section", {
    nav_label: "Ресурсы",
    content: [
      b("resources_frame", {
        title: "Всё нужное — здесь",
        groups: [
          b("link_group", {
            title: "Карта команды, сайт и соцсети",
            number_span: 2,
            links: [
              b("resource_link", {
                kind: "Сайт",
                title: "Карта команды",
                text: "Здесь — структура команды: кто за что отвечает, как связаны функции и к кому обращаться по конкретным вопросам.",
                action: "Открыть карту команды",
                link: link(LINKS.teamMap),
              }),
              ...socialLinks(b),
            ],
          }),
          businessQa(b),
          b("qa_group", {
            title: "FAQ",
            items: [
              b("qa_item", {
                question: "Рабочий график",
                answer:
                  "Начало рабочего дня почти у всех сотрудников гибкое. Обычно сотрудники начинают работать с 8:00 до 10:00 и заканчивают с 17:00 до 19:00. Рабочее время — 8 часов плюс 1 час на обед. У каждой команды свои правила и обязательные часы присутствия в офисе, поэтому время начала рабочего дня согласуй с руководителем.",
              }),
              ...[
                "Формат работы",
                "Твоё рабочее место",
                "Дресс-код",
                "Информация об офисе",
                "Переговорные комнаты",
                "Пароли",
                "Скидки сотрудникам",
                "Если остались вопросы",
              ].map((question) => b("qa_item", { question })),
            ],
          }),
          feedbackGroup(b),
        ],
      }),
    ],
  });

  return {
    ...b("page", {
      header_label: "Onboarding · Office",
      crumbs: [b("crumb", { label: "Онбординг" }), b("crumb", { label: "Office" })],
      footer_text: "© 2026 TRENDSETTER · Onboarding · Office",
      feedback_link: link(LINKS.feedbackForm),
      meta_title: "Welcome Book · Office",
      meta_description:
        "Онбординг для сотрудников офиса TRENDSETTER: культура, первый день, ресурсы и ответы на вопросы.",
      body: [
        pageHead(b),
        b("doc", { sections: [greetingSection(b), cultureSection(b), firstDay, resources] }),
        finalBanner(b),
      ],
    }),
  };
}

export function officeStory(): Story {
  return {
    id: 0,
    uuid: "seed-office",
    name: "Office",
    slug: "office",
    full_slug: "office",
    content: officeContent(),
    published_at: null,
  };
}
