// @vitest-environment node
import { describe, expect, it } from "vitest";
import { activeCodes, expired } from "@/lib/access/managed";

const now = Date.parse("2026-10-27T12:00:00Z");
const blok = (fields: Record<string, unknown>) => ({
  _uid: "x",
  component: "access_code",
  audience: "office",
  login: "ivan",
  password: "secret",
  ...fields,
});

describe("expired", () => {
  it("пустой срок - без ограничения", () => {
    expect(expired("", now)).toBe(false);
    expect(expired(undefined, now)).toBe(false);
  });
  it("срок в будущем действует, в прошлом истёк", () => {
    expect(expired("2026-10-28 09:00", now)).toBe(false);
    expect(expired("2026-10-27 11:59", now)).toBe(true);
  });
  it("нечитаемый срок считается истёкшим", () => {
    expect(expired("когда-нибудь", now)).toBe(true);
  });
});

describe("activeCodes", () => {
  it("берёт включённые пароли с версией", () => {
    expect(activeCodes([blok({}), blok({ audience: "retail", password: " r " })], now)).toEqual([
      { audience: "office", password: "secret", login: "ivan" },
      { audience: "retail", password: "r", login: "ivan" },
    ]);
  });
  it("пропускает отключённые, истёкшие, без пароля или логина и с неизвестной версией", () => {
    const list = [
      blok({ disabled: true }),
      blok({ valid_until: "2026-01-01 00:00" }),
      blok({ password: "  " }),
      blok({ audience: "other" }),
      blok({ login: " " }),
    ];
    expect(activeCodes(list, now)).toEqual([]);
  });
});
