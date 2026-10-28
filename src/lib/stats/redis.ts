/**
 * Redis по REST (Upstash через Vercel Marketplace), без клиентской библиотеки:
 * хватает одного fetch. Переменные приходят от интеграции: KV_REST_API_URL и
 * KV_REST_API_TOKEN (или UPSTASH_REDIS_REST_*). Не заданы - журнал выключен, и
 * сайт работает как обычно.
 */
type Command = (string | number)[];

const config = () => {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
};

export const statsEnabled = () => config() !== null;

/** Несколько команд одним запросом; ответы по порядку. null - журнал выключен или не ответил */
export async function redis(commands: Command[]): Promise<unknown[] | null> {
  const cfg = config();
  if (!cfg || !commands.length) return null;

  try {
    const response = await fetch(`${cfg.url}/pipeline`, {
      method: "POST",
      headers: { authorization: `Bearer ${cfg.token}`, "content-type": "application/json" },
      body: JSON.stringify(commands),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const answers = (await response.json()) as { result?: unknown; error?: string }[];
    return answers.map((answer) => (answer.error ? null : (answer.result ?? null)));
  } catch {
    return null;
  }
}
