import type { Metadata } from "next";
import { B2BHeader } from "@/components/layout/B2BHeader";
import { readStats, type SessionRow } from "@/lib/stats/log";
import { statsEnabled } from "@/lib/stats/redis";

export const metadata: Metadata = { title: "Статистика входов" };
export const dynamic = "force-dynamic";

const moscow = new Intl.DateTimeFormat("ru-RU", {
  timeZone: "Europe/Moscow",
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const when = (at: number) => (at ? moscow.format(at) : "—");

/** 95 сек → «1 мин 35 с» */
const span = (seconds: number) => {
  if (seconds < 60) return `${seconds} с`;
  const minutes = Math.floor(seconds / 60);
  return minutes < 60
    ? `${minutes} мин ${seconds % 60} с`
    : `${Math.floor(minutes / 60)} ч ${minutes % 60} мин`;
};

const ROLE: Record<string, string> = { office: "Office", retail: "Retail", admin: "Админ" };

type Person = { login: string; visits: number; active: number; last: number; progress: number };

function byPerson(sessions: SessionRow[]): Person[] {
  const people = new Map<string, Person>();
  for (const s of sessions) {
    const key = s.login.toLowerCase();
    const p = people.get(key) ?? { login: s.login, visits: 0, active: 0, last: 0, progress: 0 };
    p.visits += 1;
    p.active += s.active;
    p.last = Math.max(p.last, s.last || s.start);
    p.progress = Math.max(p.progress, s.progress);
    people.set(key, p);
  }
  return [...people.values()].sort((a, b) => b.last - a.last);
}

const TH = "border border-line bg-paper px-3 py-2 text-left font-semibold";
const TD = "border border-line px-3 py-2 align-top";

/**
 * Статистика входов для админа: кто заходил, когда, сколько был на сайте и до
 * какого места дочитал. Данные из Redis (см. src/lib/stats).
 */
export default async function StatsPage() {
  const stats = statsEnabled() ? await readStats() : null;

  return (
    <>
      <B2BHeader label="Статистика" feedbackHref="#" signOut />
      <main className="gutter-x flex flex-col gap-8 py-8 md:py-12">
        <h1 className="t-h2">Статистика входов</h1>

        {!stats ? (
          <p className="t-body-l text-text-2">
            Журнал не подключён: нет хранилища (Upstash Redis). Подключите его в Vercel
            (Storage → Upstash for Redis) и сделайте redeploy.
          </p>
        ) : (
          <>
            <p className="text-[14px] text-text-2">
              Сессий в журнале: {stats.sessions.length}. Неудачных попыток входа за сутки:{" "}
              {stats.failsToday}. Время по Москве. «Время на сайте» — минуты, пока вкладка была
              открыта и видна.
            </p>

            <section className="flex flex-col gap-3">
              <h2 className="t-h3">По людям</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[14px]">
                  <thead>
                    <tr>
                      <th className={TH}>Логин</th>
                      <th className={TH}>Входов</th>
                      <th className={TH}>Время на сайте</th>
                      <th className={TH}>Дочитал до</th>
                      <th className={TH}>Был последний раз</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byPerson(stats.sessions).map((p) => (
                      <tr key={p.login}>
                        <td className={TD}>{p.login}</td>
                        <td className={TD}>{p.visits}</td>
                        <td className={TD}>{span(p.active)}</td>
                        <td className={TD}>{p.progress}%</td>
                        <td className={TD}>{when(p.last)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="t-h3">Все сессии</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[14px]">
                  <thead>
                    <tr>
                      <th className={TH}>Вход</th>
                      <th className={TH}>Логин</th>
                      <th className={TH}>Версия</th>
                      <th className={TH}>Время на сайте</th>
                      <th className={TH}>Дочитал до</th>
                      <th className={TH}>Разделы</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.sessions.map((s) => (
                      <tr key={s.sid}>
                        <td className={TD}>{when(s.start)}</td>
                        <td className={TD}>{s.login}</td>
                        <td className={TD}>{ROLE[s.role] ?? s.role}</td>
                        <td className={TD}>{span(s.active)}</td>
                        <td className={TD}>{s.progress}%</td>
                        <td className={TD}>{s.sections.join(", ") || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}
