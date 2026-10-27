// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSession, matchCode, readSession } from "@/lib/access/session";

const managed = vi.hoisted(() => ({
  list: [] as { audience: "office" | "retail"; password: string; login?: string }[],
}));
vi.mock("@/lib/access/managed", () => ({ managedCodes: async () => managed.list }));

beforeEach(() => {
  process.env.ACCESS_SECRET = "test-secret";
  delete process.env.ACCESS_OFFICE;
  delete process.env.ACCESS_RETAIL;
  managed.list = [
    { audience: "office", password: "pw-ivan", login: "Ivan" },
    { audience: "retail", password: "shared" },
  ];
});

describe("именной вход", () => {
  it("нужны и логин, и пароль; регистр логина не важен", async () => {
    expect((await matchCode(" ivan ", "pw-ivan"))?.audience).toBe("office");
    expect(await matchCode("petr", "pw-ivan")).toBeNull();
    expect(await matchCode("ivan", "wrong")).toBeNull();
  });

  it("общий пароль без логина пускает с любым логином", async () => {
    expect((await matchCode("кто-угодно", "shared"))?.audience).toBe("retail");
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
