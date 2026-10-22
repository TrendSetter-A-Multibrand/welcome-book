import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { renderBlocks } from "@/components/blocks";
import { crumbsOf } from "@/components/layout/OnboardingPage";
import { link } from "@/content/seed/blok";
import { createBuilder } from "@/content/seed/blok";

const b = createBuilder("t");

/** Рамка «Ресурсы» с одной группой вопросов: так вопрос попадает на страницу */
const withAnswer = (item: ReturnType<typeof b>) =>
  renderToStaticMarkup(
    <>
      {renderBlocks([
        b("doc", {
          sections: [
            b("doc_section", {
              nav_label: "Ресурсы",
              content: [
                b("resources_frame", {
                  groups: [b("qa_group", { title: "FAQ", items: [item] })],
                }),
              ],
            }),
          ],
        }),
      ])}
    </>
  );

describe("ответы аккордеона", () => {
  it("рисует абзацы с жирным и ссылкой", () => {
    const html = withAnswer(
      b("qa_item", {
        question: "Переговорные",
        answer: "Бронь в **Google Календаре**.\n\nСм. [правила](https://a.b/c).",
      })
    );
    expect(html).toContain("<strong");
    expect(html).toContain('href="https://a.b/c"');
    expect(html).toContain("aria-controls");
  });

  it("рисует все блоки конструктора по порядку", () => {
    const html = withAnswer(
      b("qa_item", {
        question: "Информация об офисе",
        blocks: [
          b("answer_facts", {
            items: [b("answer_fact", { label: "Адрес", value: "Москва, ТЦ «Авеню Север»" })],
          }),
          b("answer_list", { style: "numbered", items: "Первый шаг\nВторой шаг" }),
          b("answer_note", { text: "Важно знать" }),
          b("answer_contacts", {
            items: [b("answer_contact", { label: "HR", lines: "[hr@x.ru](mailto:hr@x.ru)" })],
          }),
          b("answer_place", { place: "ТЦ «Авеню Север»", button_link: link("https://yandex.ru/maps") }),
          b("answer_button", { label: "Форма", link: link("https://forms.gle/x") }),
        ],
      })
    );
    expect(html).toContain("Москва, ТЦ «Авеню Север»");
    expect(html).toContain("01");
    expect(html).toContain("[Справка]");
    expect(html).toContain("mailto:hr@x.ru");
    expect(html).toContain("[Как добраться]");
    expect(html).toContain("https://forms.gle/x");
  });

  it("кнопка и маршрут без адреса не рисуются", () => {
    const html = withAnswer(
      b("qa_item", {
        question: "Вопрос",
        blocks: [b("answer_button", { label: "Пустая", link: link() })],
      })
    );
    expect(html).not.toContain("Пустая");
  });

  it("фото без файла не рисуется, чужой блок не роняет страницу", () => {
    const html = withAnswer(
      b("qa_item", {
        question: "Вопрос",
        answer: "Текст",
        blocks: [b("answer_image", { caption: "Подпись" }), b("неизвестный")],
      })
    );
    expect(html).not.toContain("Подпись");
    expect(html).toContain("Текст");
  });
});

describe("хлебные крошки", () => {
  it("берёт уровни из блоков", () => {
    const page = b("page", {
      crumbs: [b("crumb", { label: "Онбординг", link: link("/") }), b("crumb", { label: "Office" })],
    });
    expect(crumbsOf(page)).toEqual([
      { label: "Онбординг", href: "/" },
      { label: "Office", href: "#" },
    ]);
  });

  it("у страницы, заведённой раньше, берёт старые поля", () => {
    expect(crumbsOf(b("page", { crumb_root: "Онбординг", crumb: "Retail" }))).toEqual([
      { label: "Онбординг" },
      { label: "Retail" },
    ]);
  });
});
