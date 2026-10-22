import { describe, expect, it } from "vitest";
import { editableAttrs } from "@/lib/storyblok/editable";

const blok = (extra: Record<string, unknown>) => ({ _uid: "u", component: "x", ...extra });

describe("editableAttrs", () => {
  it("собирает атрибуты Bridge из комментария _editable", () => {
    const attrs = editableAttrs(
      blok({ _editable: '<!--#storyblok#{"name":"ceo_letter","space":"1","uid":"abc","id":"42"}-->' })
    );
    expect(attrs?.["data-blok-uid"]).toBe("42-abc");
    expect(JSON.parse(attrs!["data-blok-c"])).toMatchObject({ name: "ceo_letter", uid: "abc" });
  });

  it("у опубликованной версии атрибутов нет", () => {
    expect(editableAttrs(blok({}))).toBeUndefined();
  });

  it("битый комментарий не роняет страницу", () => {
    expect(editableAttrs(blok({ _editable: "<!--#storyblok#{не json-->" }))).toBeUndefined();
    expect(editableAttrs(blok({ _editable: "просто текст" }))).toBeUndefined();
  });
});
