import { isRole, type Role } from "@/lib/audiences";
import { storyblokFetch } from "@/lib/storyblok/client";
import type { Block } from "@/lib/storyblok/fetchStory";

/**
 * Пароли, которые админ ведёт в Storyblok: история `access`, блоки `access_code`
 * (кому, версия, логин, пароль, срок, «Отключить»). Читаются только на сервере токеном
 * сайта и в браузер не попадают.
 *
 * Список держим в памяти полминуты, чтобы не ходить в Storyblok на каждый запрос,
 * но и не ждать часового кэша контента: сменили пароль - через полминуты он
 * действует. Не отвечает Storyblok или истории нет - работают пароли из окружения.
 */
const SLUG = "access";
const TTL = 30_000;

export type ManagedCode = { audience: Role; password: string; login: string };

let cache: { at: number; codes: ManagedCode[] } | null = null;

/** «Действует до» в формате Storyblok `YYYY-MM-DD HH:mm` (UTC). Пусто - без срока; нечитаемое - истёк */
export function expired(value: unknown, now = Date.now()) {
  if (typeof value !== "string" || !value.trim()) return false;
  const until = Date.parse(`${value.trim().replace(" ", "T")}Z`);
  return !(until > now);
}

export function activeCodes(blocks: Block[], now = Date.now()): ManagedCode[] {
  return blocks.flatMap((block) => {
    const password = typeof block.password === "string" ? block.password.trim() : "";
    const audience = String(block.audience ?? "");
    if (!password || !isRole(audience)) return [];
    if (block.disabled === true || block.disabled === "true") return [];
    if (expired(block.valid_until, now)) return [];
    const login = typeof block.login === "string" ? block.login.trim() : "";
    // Вход без логина не бывает: запись без него не действует
    if (!login) return [];
    return [{ audience, password, login }];
  });
}

export async function managedCodes(): Promise<ManagedCode[]> {
  if (!process.env.STORYBLOK_TOKEN) return [];
  if (cache && Date.now() - cache.at < TTL) return cache.codes;

  try {
    const { story } = await storyblokFetch<{ story: { content: Block } }>(
      `stories/${SLUG}`,
      { fresh: true }
    );
    const codes = activeCodes((story.content.passwords as Block[] | undefined) ?? []);
    cache = { at: Date.now(), codes };
    return codes;
  } catch {
    // Не нашлось или Storyblok не ответил: остаёмся на прошлом списке, если он был
    if (cache) return cache.codes;
    cache = { at: Date.now() - TTL + 5_000, codes: [] };
    return [];
  }
}
