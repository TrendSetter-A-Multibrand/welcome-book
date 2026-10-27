import type { Audience } from "@/lib/audiences";
import { managedCodes } from "@/lib/access/managed";

/**
 * Пароли доступа из окружения (Vercel / .env.local) - запасной вход, который
 * работает, даже если Storyblok недоступен. Основной список ведёт админ в
 * Storyblok (см. managed.ts).
 *
 *   ACCESS_OFFICE  - пароли для версии Office
 *   ACCESS_RETAIL  - пароли для версии Retail
 *
 * В переменной может быть несколько паролей через запятую или с новой строки.
 * Так рассылается «свой пароль каждому» или «новый пароль каждую неделю»: новый
 * пароль дописывается, а старый убирается - и сессии, выданные по старому,
 * перестают работать.
 */
const ENV: Record<Audience, string> = {
  office: "ACCESS_OFFICE",
  retail: "ACCESS_RETAIL",
};

const split = (raw: string | undefined) =>
  (raw ?? "")
    .split(/[,\n]/)
    .map((code) => code.trim())
    .filter(Boolean);

/** Вход: пароль и, если админ задал, логин. Без логина подходит любой логин (общий пароль) */
export type Code = { password: string; login?: string };

/**
 * Все действующие входы версии: пароли из окружения (запасной вход, общие) и из
 * Storyblok (история `access`, их ведёт админ).
 */
export async function codesFor(audience: Audience): Promise<Code[]> {
  const managed = (await managedCodes())
    .filter((code) => code.audience === audience)
    .map(({ password, login }) => ({ password, login }));
  return [...split(process.env[ENV[audience]]).map((password) => ({ password })), ...managed];
}
