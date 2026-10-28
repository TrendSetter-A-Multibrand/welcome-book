// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSession, matchCode, readIdentity, readSession } from "@/lib/access/session";

const managed = vi.hoisted(() => ({
  list: [] as { audience: "office" | "retail" | "admin"; password: string; login?: string }[],
}));
vi.mock("@/lib/access/managed", () => ({ managedCodes: async () => managed.list }));

beforeEach(() => {
  process.env.ACCESS_SECRET = "test-secret";
  delete process.env.ACCESS_OFFICE;
  delete process.env.ACCESS_RETAIL;
  managed.list = [
    { audience: "office", password: "pw-ivan", login: "Ivan" },
    { audience: "retail", password: "pw-anna", login: "anna" },
  ];
});

describe("именной вход", () => {
  it("нужны и логин, и пароль; регистр логина не важен", async () => {
    expect((await matchCode(" ivan ", "pw-ivan"))?.audience).toBe("office");
    expect(await matchCode("petr", "pw-ivan")).toBeNull();
    expect(await matchCode("ivan", "wrong")).toBeNull();
  });

  it("пустой или чужой логин не пускает даже с верным паролем", async () => {
    expect(await matchCode("", "pw-anna")).toBeNull();
    expect(await matchCode("ivan", "pw-anna")).toBeNull();
    expect((await matchCode("ANNA", "pw-anna"))?.audience).toBe("retail");
  });

  it("запись из окружения без логина не действует, с логином - да", async () => {
    process.env.ACCESS_OFFICE = "голый-пароль, boss:pa:ss";
    expect(await matchCode("boss", "голый-пароль")).toBeNull();
    expect(await matchCode("", "голый-пароль")).toBeNull();
    expect((await matchCode("boss", "pa:ss"))?.audience).toBe("office");
  });

  it("админский вход открывает роль admin и несёт логин и id сессии", async () => {
    managed.list = [{ audience: "admin", password: "pw-boss", login: "boss" }];
    const match = (await matchCode("Boss", "pw-boss"))!;
    expect(match.audience).toBe("admin");
    const cookie = (await createSession(match.audience, match.key, {
      login: match.login,
      sid: "sid-1",
    }))!;
    expect(await readIdentity(cookie)).toEqual({ role: "admin", login: "Boss", sid: "sid-1" });
  });

  it("отключили именной вход - сессия закрыта", async () => {
    const match = (await matchCode("ivan", "pw-ivan"))!;
    const cookie = (await createSession(match.audience, match.key))!;
    expect(await readSession(cookie)).toBe("office");

    managed.list = [];
    expect(await readSession(cookie)).toBeNull();
  });

  it("смена логина закрывает старую сессию", async () => {
    const match = (await matchCode("ivan", "pw-ivan"))!;
    const cookie = (await createSession(match.audience, match.key))!;
    managed.list = [{ audience: "office", password: "pw-ivan", login: "petr" }];
    expect(await readSession(cookie)).toBeNull();
  });
});
