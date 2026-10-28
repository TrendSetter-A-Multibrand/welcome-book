// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { logLogin, logPulse, readStats } from "@/lib/stats/log";
import { statsEnabled } from "@/lib/stats/redis";

const env = { ...process.env };
let calls: (string | number)[][][] = [];

/** Подставной Redis: на каждую команду отвечает заранее заданным ответом по имени */
function fakeRedis(answer: (command: (string | number)[]) => unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init: { body: string }) => {
      const commands = JSON.parse(init.body) as (string | number)[][];
      calls.push(commands);
      return { ok: true, json: async () => commands.map((c) => ({ result: answer(c) })) };
    })
  );
}

beforeEach(() => {
  calls = [];
  process.env.KV_REST_API_URL = "https://redis.test";
  process.env.KV_REST_API_TOKEN = "t";
});

afterEach(() => {
  process.env = { ...env };
  vi.unstubAllGlobals();
});

describe("журнал выключен без хранилища", () => {
  it("ничего не отправляет и не падает", async () => {
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    fakeRedis(() => null);
    expect(statsEnabled()).toBe(false);
    await logLogin("sid", "ivan", "office");
    expect(calls).toEqual([]);
    expect(await readStats()).toBeNull();
  });
});

describe("logLogin", () => {
  it("заводит сессию и событие", async () => {
    fakeRedis(() => 1);
    await logLogin("sid1", "ivan", "office");
    const names = calls[0].map((c) => c[0]);
    expect(names).toEqual(["HSET", "EXPIRE", "ZADD", "LPUSH", "LTRIM"]);
    expect(calls[0][0]).toContain("ivan");
  });
});

describe("logPulse", () => {
  it("не заводит сессию, которой нет", async () => {
    fakeRedis(() => null);
    await logPulse("ghost", { seconds: 30, progress: 40, sections: ["Культура"] });
    expect(calls).toHaveLength(1);
  });

  it("прибавляет время (не больше минуты) и хранит наибольший процент", async () => {
    fakeRedis((c) => (c[0] === "HGET" ? "55" : 1));
    await logPulse("s", { seconds: 9999, progress: 40, sections: ["Культура"] });
    const write = calls[1];
    expect(write[0]).toEqual(expect.arrayContaining(["maxp", 55]));
    expect(write[1]).toEqual(["HINCRBY", "s:s", "active", 60]);
    expect(write[2].slice(0, 3)).toEqual(["SADD", "s:s:sec", "Культура"]);
  });
});

describe("readStats", () => {
  it("собирает сессии и считает неудачные попытки за сутки", async () => {
    const now = Date.now();
    fakeRedis((c) => {
      if (c[0] === "ZREVRANGE") return ["a"];
      if (c[0] === "HGETALL")
        return ["login", "ivan", "role", "office", "start", "1", "last", "2", "active", "95", "maxp", "70"];
      if (c[0] === "SMEMBERS") return ["Культура"];
      if (c[0] === "LRANGE")
        return [
          JSON.stringify({ t: "fail", login: "x", at: now - 1000 }),
          JSON.stringify({ t: "fail", login: "y", at: now - 3 * 24 * 3600 * 1000 }),
          JSON.stringify({ t: "login", login: "ivan", at: now }),
        ];
      return null;
    });
    const stats = await readStats();
    expect(stats?.failsToday).toBe(1);
    expect(stats?.sessions[0]).toMatchObject({
      sid: "a",
      login: "ivan",
      active: 95,
      progress: 70,
      sections: ["Культура"],
    });
  });
});
