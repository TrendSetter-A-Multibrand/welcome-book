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
    // Кнопок раскрытия две: переключатель разделов и «Рабочий график» - единственный
    // вопрос, на который в макете есть ответ.
    expect((page.match(/aria-expanded/g) ?? []).length).toBe(2);
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
