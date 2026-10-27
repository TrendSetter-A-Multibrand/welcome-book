// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createSession, matchCode, readSession } from "@/lib/access/session";

const env = { ...process.env };

beforeEach(() => {
  process.env.ACCESS_SECRET = "test-secret";
  process.env.ACCESS_OFFICE = "office-one, office-two";
  process.env.ACCESS_RETAIL = "retail-one";
});

afterEach(() => {
  process.env = { ...env };
});

describe("matchCode", () => {
  it("по паролю определяет версию", async () => {
    expect((await matchCode("office-two"))?.audience).toBe("office");
    expect((await matchCode("retail-one"))?.audience).toBe("retail");
  });

  it("чужой и пустой пароль не подходит", async () => {
    expect(await matchCode("nope")).toBeNull();
    expect(await matchCode("")).toBeNull();
  });
});

describe("сессия", () => {
  it("выданная cookie читается и открывает свою версию", async () => {
    const match = (await matchCode("retail-one"))!;
    const cookie = await createSession(match.audience, match.key);
    expect(await readSession(cookie!)).toBe("retail");
  });

  it("подделанная подпись не принимается", async () => {
    const match = (await matchCode("office-one"))!;
    const cookie = (await createSession(match.audience, match.key))!;
    const [body] = cookie.split(".");
    expect(await readSession(`${body}.deadbeef`)).toBeNull();
  });

  it("убрали пароль из списка - сессия по нему закрыта, по другому - жива", async () => {
    const one = (await matchCode("office-one"))!;
    const two = (await matchCode("office-two"))!;
    const cookieOne = (await createSession(one.audience, one.key))!;
    const cookieTwo = (await createSession(two.audience, two.key))!;

    process.env.ACCESS_OFFICE = "office-two";
    expect(await readSession(cookieOne)).toBeNull();
    expect(await readSession(cookieTwo)).toBe("office");
  });

  it("без ACCESS_SECRET войти нельзя", async () => {
    delete process.env.ACCESS_SECRET;
    expect(await createSession("office", "k")).toBeNull();
    expect(await readSession("a.b")).toBeNull();
  });

  it("сессия редактора открывает обе версии", async () => {
    expect(await readSession((await createSession("*", "preview"))!)).toBe("*");
  });
});
