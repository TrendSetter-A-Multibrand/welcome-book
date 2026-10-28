import { NextResponse, type NextRequest } from "next/server";
import { isAudience } from "@/lib/audiences";
import { COOKIE, readSession } from "@/lib/access/session";

/**
 * Закрывает /office, /retail и /stats (админ): без входа посетителя возвращает на форму пароля.
 * Вошедший по паролю Office не видит Retail и наоборот - его перекидывает в свою
 * версию. Работает перед кэшем страниц, поэтому закрыты и статические страницы.
 */
export async function proxy(request: NextRequest) {
  const audience = request.nextUrl.pathname.split("/")[1];
  const session = await readSession(request.cookies.get(COOKIE)?.value);

  // Статистика - только админу
  if (audience === "stats") {
    if (session === "admin") return NextResponse.next();
    return NextResponse.redirect(new URL(session && session !== "*" ? `/${session}` : "/", request.url));
  }

  if (!isAudience(audience)) return NextResponse.next();
  if (session === "*" || session === "admin" || session === audience) return NextResponse.next();

  const target = session ?? "";
  return NextResponse.redirect(new URL(`/${target}`, request.url));
}

export const config = { matcher: ["/office/:path*", "/retail/:path*", "/stats"] };
