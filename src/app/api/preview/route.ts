import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Вход из редактора Storyblok: он открывает сайт по этому адресу, браузер
 * получает cookie, включающую draft mode, и дальше каждая история читается так,
 * как она пишется, а не как опубликована.
 *
 * Тот, у кого есть секрет, читает неопубликованное - в этом весь смысл и весь
 * риск, поэтому секрет - длинная случайная строка в окружении, а не то, что
 * кладут в ссылку, которая уходит из редактора.
 */
export async function GET(request: Request) {
  const secret = process.env.STORYBLOK_PREVIEW_SECRET;
  if (!secret) {
    return Response.json({ error: "no secret configured" }, { status: 500 });
  }

  const url = new URL(request.url);
  if (url.searchParams.get("secret") !== secret) {
    return Response.json({ error: "wrong secret" }, { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();

  // Редактор дописывает к адресу путь истории, а сразу за ним свои параметры
  // (_storyblok, _storyblok_tk и др.), по которым Bridge на странице понимает,
  // что он внутри редактора. Они попали в запрос к этому роуту, а нужны странице
  // назначения, поэтому их переносим дальше; секрет и `to` - нет.
  const asked = url.searchParams.get("to") ?? "/";
  const to = asked.replace(/^\/?home\/?$/, "/");

  const forwarded = new URLSearchParams(url.searchParams);
  forwarded.delete("secret");
  forwarded.delete("to");
  const query = forwarded.toString();

  // Только свой путь, а не любой адрес: открытый редирект позволил бы
  // использовать ссылку, чтобы отправлять людей куда угодно.
  const path = to.startsWith("/") && !to.startsWith("//") ? to : "/";
  redirect(query ? `${path}${path.includes("?") ? "&" : "?"}${query}` : path);
}
