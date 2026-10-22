import { describe, expect, it } from "vitest";
import { parseInline } from "@/lib/inline";

describe("parseInline", () => {
  it("оставляет обычный текст целым", () => {
    expect(parseInline("просто текст")).toEqual([{ type: "text", text: "просто текст" }]);
  });

  it("находит жирный и ссылку посреди строки", () => {
    expect(parseInline("Бронь в **Google Календаре**, см. [правила](https://a.b/c).")).toEqual([
      { type: "text", text: "Бронь в " },
      { type: "bold", text: "Google Календаре" },
      { type: "text", text: ", см. " },
      { type: "link", text: "правила", href: "https://a.b/c" },
      { type: "text", text: "." },
    ]);
  });

  it("разрешает почту, телефон, свой путь и якорь", () => {
    for (const href of ["mailto:hr@x.ru", "tel:+7000", "/office", "#section-2"]) {
      expect(parseInline(`[t](${href})`)).toEqual([{ type: "link", text: "t", href }]);
    }
  });

  it("не делает ссылкой javascript: и прочее чужое", () => {
    expect(parseInline("[клик](javascript:alert(1))")).toEqual([
      { type: "text", text: "клик" },
      { type: "text", text: ")" },
    ]);
    expect(parseInline("[x](data:text/html,hi)")).toEqual([{ type: "text", text: "x" }]);
  });

  it("незакрытую разметку не трогает", () => {
    expect(parseInline("**не закрыто и [не ссылка]")).toEqual([
      { type: "text", text: "**не закрыто и [не ссылка]" },
    ]);
  });
});
