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
 * Welcome Book · Retail. Тексты - из макета Figma («Онбординг · Retail»).
 * От Office отличаются шаги первого дня и раздел «Ресурсы»: нет карты команды,
 * есть «Обучающие материалы», другой FAQ. Ответов в макете нет - их допишут
 * в Storyblok.
 */
export function retailContent(): Block {
  const b = createBuilder("retail");

  const firstDay = b("doc_section", {
    nav_label: "Первый день",
    title: "Твоя точка старта",
    lead: "Без жёсткого тайминга — спокойный маршрут первого дня, чтобы познакомиться с компанией, людьми и рабочей средой.",
    content: [
      b("steps_group", {
        items: [
          b("step_tile", { title: "Оформление документов", icon: "doc" }),
          b("step_tile", { title: "Знакомство с руководителем и командой", icon: "team" }),
          b("step_tile", { title: "Экскурсия по магазину и служебным зонам", icon: "store" }),
          b("step_tile", {
            title: "Знакомство с ассортиментом и стандартами сервиса",
            icon: "shirt",
          }),
          b("step_tile", { title: "Обучение кассе и основным рабочим процессам", icon: "card" }),
          b("step_tile", {
            title: "Первая практика в торговом зале с наставником",
            icon: "spark",
          }),
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
          b("link_group", { title: "Сайт и соцсети", links: socialLinks(b) }),
          b("qa_group", {
            title: "Обучающие материалы",
            items: ["Активности магазина", "О наших брендах"].map((question) =>
              b("qa_item", { question })
            ),
          }),
          businessQa(b),
          b("qa_group", {
            title: "FAQ",
            items: [
              "График работы",
              "Дресс-код",
              "Информация о торговом центре",
              "Скидки сотрудникам",
              "Если остались вопросы",
            ].map((question) => b("qa_item", { question })),
          }),
          feedbackGroup(b),
        ],
      }),
    ],
  });

  return {
    ...b("page", {
      header_label: "Onboarding · Retail",
      crumb_root: "Онбординг",
      crumb: "Retail",
      footer_text: "© 2026 TRENDSETTER · Onboarding · Retail",
      feedback_link: link(LINKS.feedbackForm),
      meta_title: "Welcome Book · Retail",
      meta_description:
        "Онбординг для сотрудников магазинов TRENDSETTER: культура, первый день, ресурсы и ответы на вопросы.",
      body: [
        pageHead(b),
        b("doc", { sections: [greetingSection(b), cultureSection(b), firstDay, resources] }),
        finalBanner(b),
      ],
    }),
  };
}

export function retailStory(): Story {
  return {
    id: 0,
    uuid: "seed-retail",
    name: "Retail",
    slug: "retail",
    full_slug: "retail",
    content: retailContent(),
    published_at: null,
  };
}
