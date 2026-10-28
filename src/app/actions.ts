"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import {
  COOKIE,
  MAX_AGE,
  createSession,
  matchCode,
  readIdentity,
} from "@/lib/access/session";
import { logFail, logLogin, logLogout } from "@/lib/stats/log";

export type LoginState = { failed: boolean; email: string };

/** Неудачные попытки с одного адреса: не больше 10 за 10 минут (в пределах одного инстанса) */
const attempts = new Map<string, number[]>();
const WINDOW = 10 * 60 * 1000;
const LIMIT = 10;

const pause = (ms: number) => new Promise((done) => setTimeout(done, ms));

/**
 * Вход: логин и пароль. Пароль решает, какую версию открыть - Office или Retail.
 * На любую ошибку (логин, пароль, лимит попыток) отвечаем одинаково, чтобы по
 * ответу нельзя было понять, что именно не подошло.
 */
export async function login(_: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");

  const from = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  const now = Date.now();
  const recent = (attempts.get(from) ?? []).filter((at) => now - at < WINDOW);

  if (recent.length >= LIMIT) {
    await pause(1000);
    return { failed: true, email };
  }

  const match = email && password ? await matchCode(email, password) : null;
  const sid = crypto.randomUUID();
  const value = match
    ? await createSession(match.audience, match.key, { login: match.login, sid })
    : null;

  if (!match || !value) {
    attempts.set(from, [...recent, now]);
    after(() => logFail(email));
    await pause(600);
    return { failed: true, email };
  }

  (await cookies()).set(COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
  after(() => logLogin(sid, match.login, match.audience));
  redirect(match.audience === "admin" ? "/stats" : `/${match.audience}`);
}

/** Выход: убирает cookie входа и возвращает на окно входа */
export async function logout() {
  const jar = await cookies();
  const who = await readIdentity(jar.get(COOKIE)?.value);
  jar.delete(COOKIE);
  if (who?.sid) after(() => logLogout(who.sid, who.login));
  redirect("/");
}
