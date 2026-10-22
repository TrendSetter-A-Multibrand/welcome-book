import { describe, expect, it } from "vitest";
import { href, image, isExternal, nested, paragraphs, text } from "@/lib/blok";

describe("text", () => {
  it("пустую и пробельную строку считает отсутствием", () => {
    expect(text("")).toBeUndefined();
    expect(text("   ")).toBeUndefined();
    expect(text(undefined)).toBeUndefined();
    expect(text("Привет")).toBe("Привет");
  });
});

describe("image", () => {
  it("пустой объект-ассет - это не картинка", () => {
    expect(image({ filename: "" })).toBeUndefined();
    expect(image(undefined)).toBeUndefined();
  });

  it("берёт имя файла и подпись", () => {
    expect(image({ filename: "https://a.storyblok.com/f/1/x.png", alt: "CEO" })).toEqual({
      src: "https://a.storyblok.com/f/1/x.png",
      alt: "CEO",
    });
  });
});

describe("href", () => {
  it("пустую ссылку заменяет на #", () => {
    expect(href(undefined)).toBe("#");
    expect(href({ url: "", cached_url: "" })).toBe("#");
  });

  it("внешний адрес оставляет как есть", () => {
    expect(href({ url: "https://example.com/a" })).toBe("https://example.com/a");
  });

  it("путь истории превращает в путь сайта", () => {
    expect(href({ cached_url: "office/feedback" })).toBe("/office/feedback");
  });

  it("якорь не трогает", () => {
    expect(href({ url: "#s2" })).toBe("#s2");
  });
});

describe("isExternal", () => {
  it("узнаёт только http(s)", () => {
    expect(isExternal("https://a.b")).toBe(true);
    expect(isExternal("/office")).toBe(false);
    expect(isExternal("#")).toBe(false);
  });
});

describe("paragraphs", () => {
  it("делит по пустой строке и выбрасывает пустое", () => {
    expect(paragraphs("раз\n\n  два \n\n\n три")).toEqual(["раз", "два", "три"]);
    expect(paragraphs(undefined)).toEqual([]);
  });
});

describe("nested", () => {
  const blok = (hidden?: unknown) => ({ _uid: "u", component: "x", hidden });

  it("отбрасывает скрытые блоки, остальные оставляет по порядку", () => {
    const list = [blok(false), blok(true), blok("true"), blok(undefined), blok("")];
    expect(nested(list)).toHaveLength(3);
  });

  it("пустое и чужое поле даёт пустой список", () => {
    expect(nested(undefined)).toEqual([]);
  });
});