import { AUDIENCES, type Audience } from "@/lib/audiences";
import { codesFor } from "@/lib/access/codes";

/**
 * Сессия входа - подписанная cookie, без базы данных:
 *
 *   base64url({ a: аудитория, k: отпечаток пароля, e: срок }) + "." + подпись
 *
 * Подпись - HMAC-SHA256 ключом ACCESS_SECRET, поэтому cookie нельзя подделать.
 * Отпечаток `k` - начало SHA-256 пароля, по которому вошли: пока этот пароль есть
 * в окружении, сессия живёт; убрали пароль - вход по нему закрывается сразу.
 * Аудитория "*" выдаётся только редактору Storyblok через /api/preview.
 *
 * Только Web Crypto: тот же код работает и в proxy, и в серверном действии.
 */
export const COOKIE = "wb_access";
export const MAX_AGE = 60 * 60 * 24 * 30;

type Payload = { a: Audience | "*"; k: string; e: number };

const encoder = new TextEncoder();

const toHex = (bytes: ArrayBuffer) =>
  [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");

const b64 = {
  encode: (text: string) =>
    btoa(String.fromCharCode(...encoder.encode(text)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, ""),
  decode: (value: string) => {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
    return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
  },
};

/** Сравнение за одно и то же время, как бы рано строки ни разошлись */
export function sameText(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function fingerprint(code: string) {
  return toHex(await crypto.subtle.digest("SHA-256", encoder.encode(code))).slice(0, 16);
}

async function sign(body: string) {
  const secret = process.env.ACCESS_SECRET;
  if (!secret) return null;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return toHex(await crypto.subtle.sign("HMAC", key, encoder.encode(body)));
}

/**
 * По паролю - в какую версию он пускает. Перебирает оба списка целиком, не
 * останавливаясь на первом совпадении.
 */
export async function matchCode(
  password: string
): Promise<{ audience: Audience; key: string } | null> {
  const given = await fingerprint(password);
  let found: { audience: Audience; key: string } | null = null;

  for (const audience of AUDIENCES) {
    for (const code of await codesFor(audience)) {
      if (sameText(await fingerprint(code), given)) found = { audience, key: given };
    }
  }
  return found;
}

/** Значение cookie для вошедшего; null, если ACCESS_SECRET не задан */
export async function createSession(audience: Audience | "*", key: string) {
  const body = b64.encode(
    JSON.stringify({ a: audience, k: key, e: Date.now() + MAX_AGE * 1000 } satisfies Payload)
  );
  const signature = await sign(body);
  return signature ? `${body}.${signature}` : null;
}

/** Аудитория, которую открывает cookie, или null, если cookie негодная */
export async function readSession(value: string | undefined): Promise<Audience | "*" | null> {
  if (!value) return null;
  const [body, signature] = value.split(".");
  if (!body || !signature) return null;

  const expected = await sign(body);
  if (!expected || !sameText(expected, signature)) return null;

  try {
    const payload = JSON.parse(b64.decode(body)) as Payload;
    if (!(payload.e > Date.now())) return null;
    if (payload.a === "*") return "*";
    if (!AUDIENCES.includes(payload.a)) return null;

    // Пароль, по которому вошли, должен всё ещё быть в списке
    for (const code of await codesFor(payload.a)) {
      if (sameText(await fingerprint(code), payload.k)) return payload.a;
    }
    return null;
  } catch {
    return null;
  }
}
