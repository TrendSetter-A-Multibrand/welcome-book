"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE, MAX_AGE, createSession, matchCode } from "@/lib/access/session";

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

  const match = email && password ? await matchCode(password) : null;
  const value = match ? await createSession(match.audience, match.key) : null;

  if (!match || !value) {
    attempts.set(from, [...recent, now]);
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
  redirect(`/${match.audience}`);
}
