import type { Audience } from "@/lib/audiences";

/**
 * Пароли доступа. Лежат только в окружении (Vercel / .env.local), в Storyblok и
 * в репозиторий не попадают: контент CMS читается публичным токеном.
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

export const codesFor = (audience: Audience) => split(process.env[ENV[audience]]);

/**
 * Разрешённые домены почты (`ACCESS_EMAIL_DOMAINS="trendsettercrew.com"`).
 * Не задано - подходит любой адрес правильной формы.
 */
export function emailAllowed(email: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;

  const domains = split(process.env.ACCESS_EMAIL_DOMAINS).map((d) =>
    d.toLowerCase().replace(/^@/, "")
  );
  if (!domains.length) return true;
  return domains.includes(email.split("@").pop()!.toLowerCase());
}
