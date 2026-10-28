import { cookies } from "next/headers";
import { COOKIE, readIdentity } from "@/lib/access/session";
import { logPulse } from "@/lib/stats/log";

/**
 * Пульс со страницы онбординга раз в полминуты: сколько секунд человек провёл на
 * вкладке, докуда дочитал и какие разделы видел. Принимает только вошедшего по
 * паролю (у входа редактора id сессии нет). Всегда отвечает 204, чтобы страница
 * не гадала, записалось ли.
 */
export async function POST(request: Request) {
  const who = await readIdentity((await cookies()).get(COOKIE)?.value);
  if (who?.sid) {
    const body = (await request.json().catch(() => null)) as {
      seconds?: number;
      progress?: number;
      sections?: unknown;
    } | null;

    await logPulse(who.sid, {
      seconds: Number(body?.seconds),
      progress: Number(body?.progress),
      sections: Array.isArray(body?.sections) ? body.sections.map(String) : [],
    });
  }
  return new Response(null, { status: 204 });
}
