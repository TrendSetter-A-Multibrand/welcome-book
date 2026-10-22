import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { nested } from "@/lib/blok";
import { renderBlocks, tocOf } from "@/components/blocks";
import { officeContent } from "@/content/seed/office";
import { retailContent } from "@/content/seed/retail";

const html = (content: ReturnType<typeof officeContent>) =>
  renderToStaticMarkup(<>{renderBlocks(nested(content.body))}</>);

describe("оглавление", () => {
  it("строится из разделов по порядку", () => {
    const doc = nested(officeContent().body).find((b) => b.component === "doc")!;
    expect(tocOf(doc)).toEqual([
      { id: "section-1", number: "01", label: "Приветствие" },
      { id: "section-2", number: "02", label: "Культура" },
      { id: "section-3", number: "03", label: "Первый день" },
      { id: "section-4", number: "04", label: "Ресурсы" },
    ]);
  });
});

describe("страница Office", () => {
  const page = html(officeContent());

  it("нумерует разделы метками [01 / …]", () => {
    expect(page).toContain("[01 / Приветствие]");
    expect(page).toContain("[03 / Первый день]");
    expect(page).toContain("[04 / Ресурсы]");
  });

  it("первая группа ресурсов занимает два номера, дальше идёт 03", () => {
    expect(page).toContain("01–02");
    const numbers = [...page.matchAll(/t-num-h3 shrink-0 text-red">([^<]+)</g)].map((m) => m[1]);
    expect(numbers).toEqual(["01–02", "03", "04", "05"]);
  });

  it("содержит карту команды и девять вопросов FAQ", () => {
    expect(page).toContain("Карта команды");
    expect(page).toContain("Переговорные комнаты");
    expect(page).not.toContain("Обучающие материалы");
  });

  it("пункт без ответа не получает кнопку раскрытия", () => {
    // Кнопка раскрытия есть у переключателя разделов и у каждого вопроса с ответом.
    // «Пароли» без ответа: его текст лежит только в Storyblok, не в публичном seed.
    expect((page.match(/aria-expanded/g) ?? []).length).toBe(1 + 11);
    expect(page).not.toContain("Netcraze");
  });
});

describe("страница Retail", () => {
  const page = html(retailContent());

  it("нумерует группы подряд, без «01–02»", () => {
    const numbers = [...page.matchAll(/t-num-h3 shrink-0 text-red">([^<]+)</g)].map((m) => m[1]);
    expect(numbers).toEqual(["01", "02", "03", "04", "05"]);
  });

  it("отличается от Office шагами и ресурсами", () => {
    expect(page).toContain("Экскурсия по магазину и служебным зонам");
    expect(page).toContain("Обучающие материалы");
    expect(page).not.toContain("Карта команды");
    expect(page).not.toContain("Экскурсия по офису");
  });
});

describe("лишнее в содержимом", () => {
  it("неизвестный блок пропускается, а не роняет страницу", () => {
    const out = renderToStaticMarkup(
      <>{renderBlocks([{ _uid: "x", component: "unknown_blok" }])}</>
    );
    expect(out).toBe("");
  });
});

describe("скрытые блоки", () => {
  const hide = (content: ReturnType<typeof officeContent>, component: string) => {
    const doc = nested(content.body).find((b) => b.component === "doc")!;
    for (const section of doc.sections as Array<Record<string, unknown>>) {
      for (const item of section.content as Array<Record<string, unknown>>) {
        if (item.component === component) item.hidden = true;
      }
    }
    return content;
  };

  it("скрытые «Ценности» исчезают, а раздел «Культура» остаётся", () => {
    const page = html(hide(officeContent(), "values_group"));
    expect(page).not.toContain("Наши ценности");
    expect(page).toContain("[02 / Культура]");
    expect(page).toContain("О нас в цифрах");
  });

  it("скрытый раздел уходит из оглавления, номера сдвигаются", () => {
    const content = officeContent();
    const doc = nested(content.body).find((b) => b.component === "doc")!;
    (doc.sections as Array<Record<string, unknown>>)[2].hidden = true;
    const toc = tocOf(doc as never);
    expect(toc.map((item) => item.label)).toEqual(["Приветствие", "Культура", "Ресурсы"]);
    expect(toc[2].number).toBe("03");
  });
});