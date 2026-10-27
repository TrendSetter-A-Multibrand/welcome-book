import type { Audience } from "@/lib/audiences";
import { managedCodes } from "@/lib/access/managed";

/**
 * Пароли доступа из окружения (Vercel / .env.local) - запасной вход, который
 * работает, даже если Storyblok недоступен. Основной список ведёт админ в
 * Storyblok (см. managed.ts).
 *
 *   ACCESS_OFFICE  - входы для версии Office, вид `логин:пароль`
 *   ACCESS_RETAIL  - входы для версии Retail
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

/** Вход: логин и пароль, нужны оба */
export type Code = { login: string; password: string };

/**
 * Все действующие входы версии: из окружения (запасной вход) и из Storyblok
 * (история `access`, их ведёт админ). В окружении вход пишется `логин:пароль`;
 * запись без логина не действует.
 */
export async function codesFor(audience: Audience): Promise<Code[]> {
  const managed = (await managedCodes())
    .filter((code) => code.audience === audience)
    .map(({ login, password }) => ({ login, password }));
  const fromEnv = split(process.env[ENV[audience]]).flatMap((entry) => {
    const at = entry.indexOf(":");
    const login = entry.slice(0, at).trim();
    const password = entry.slice(at + 1);
    return at > 0 && login && password ? [{ login, password }] : [];
  });
  return [...fromEnv, ...managed];
}
