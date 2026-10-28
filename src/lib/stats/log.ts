import { redis } from "@/lib/stats/redis";

/**
 * Журнал входов. Хранится в Redis:
 *   log            - последние 5000 событий (вход, неудачная попытка, выход)
 *   sessions       - сессии по времени входа (sorted set)
 *   s:<sid>        - сессия: логин, версия, вход, последний пульс, активные секунды, дочитал до %
 *   s:<sid>:sec    - просмотренные разделы
 *
 * Пишем без ожидания и без падений: сбой журнала не должен мешать войти.
 * Адреса и устройства не сохраняем, только логин и действия.
 */
const KEEP = 60 * 60 * 24 * 180;
const LOG_LIMIT = 5000;

export type LogEvent = {
  t: "login" | "fail" | "logout";
  login: string;
  role?: string;
  at: number;
  sid?: string;
};

const event = (e: LogEvent): (string | number)[][] => [
  ["LPUSH", "log", JSON.stringify(e)],
  ["LTRIM", "log", 0, LOG_LIMIT - 1],
];

export async function logLogin(sid: string, login: string, role: string) {
  const at = Date.now();
  await redis([
    ["HSET", `s:${sid}`, "login", login, "role", role, "start", at, "last", at, "active", 0, "maxp", 0],
    ["EXPIRE", `s:${sid}`, KEEP],
    ["ZADD", "sessions", at, sid],
    ...event({ t: "login", login, role, at, sid }),
  ]);
}

export async function logFail(login: string) {
  await redis(event({ t: "fail", login: login.slice(0, 80), at: Date.now() }));
}

export async function logLogout(sid: string | undefined, login: string | undefined) {
  await redis(event({ t: "logout", login: login ?? "", at: Date.now(), sid }));
}

/** Пульс со страницы: прибавляет активное время и отмечает, докуда дочитал и какие разделы видел */
export async function logPulse(
  sid: string,
  pulse: { seconds: number; progress: number; sections: string[] }
) {
  const seconds = Math.min(Math.max(Math.round(pulse.seconds) || 0, 0), 60);
  const progress = Math.min(Math.max(Math.round(pulse.progress) || 0, 0), 100);
  const sections = pulse.sections.slice(0, 20).map((name) => String(name).slice(0, 80));

  const known = await redis([["HGET", `s:${sid}`, "maxp"]]);
  if (!known || known[0] === null) return; // такой сессии нет: не заводим призраков

  const best = Math.max(progress, Number(known[0]) || 0);
  await redis([
    ["HSET", `s:${sid}`, "last", Date.now(), "maxp", best],
    ["HINCRBY", `s:${sid}`, "active", seconds],
    ...(sections.length ? [["SADD", `s:${sid}:sec`, ...sections], ["EXPIRE", `s:${sid}:sec`, KEEP]] : []),
  ]);
}

export type SessionRow = {
  sid: string;
  login: string;
  role: string;
  start: number;
  last: number;
  active: number;
  progress: number;
  sections: string[];
};

/** Последние сессии (новые сверху) и число неудачных попыток за сутки */
export async function readStats(limit = 300) {
  const ids = await redis([["ZREVRANGE", "sessions", 0, limit - 1]]);
  if (!ids) return null;
  const list = (ids[0] as string[] | null) ?? [];

  const rows =
    (list.length
      ? await redis(
          list.flatMap((sid) => [
            ["HGETALL", `s:${sid}`],
            ["SMEMBERS", `s:${sid}:sec`],
          ])
        )
      : []) ?? [];

  const sessions: SessionRow[] = [];
  list.forEach((sid, i) => {
    const flat = (rows[i * 2] as string[] | null) ?? [];
    const h: Record<string, string> = {};
    for (let k = 0; k < flat.length; k += 2) h[flat[k]] = flat[k + 1];
    if (!h.login) return;
    sessions.push({
      sid,
      login: h.login,
      role: h.role ?? "",
      start: Number(h.start) || 0,
      last: Number(h.last) || 0,
      active: Number(h.active) || 0,
      progress: Number(h.maxp) || 0,
      sections: (rows[i * 2 + 1] as string[] | null) ?? [],
    });
  });

  const events = await redis([["LRANGE", "log", 0, LOG_LIMIT - 1]]);
  const since = Date.now() - 24 * 60 * 60 * 1000;
  const failsToday = ((events?.[0] as string[] | null) ?? [])
    .map((raw) => {
      try {
        return JSON.parse(raw) as LogEvent;
      } catch {
        return null;
      }
    })
    .filter((e): e is LogEvent => e !== null && e.t === "fail" && e.at >= since).length;

  return { sessions, failsToday };
}
