import { ROLES, type Role } from "@/lib/audiences";
import { codesFor, type Code } from "@/lib/access/codes";

/**
 * Сессия входа - подписанная cookie, без базы данных:
 *
 *   base64url({ a: аудитория, k: отпечаток пароля, e: срок }) + "." + подпись
 *
 * Подпись - HMAC-SHA256 ключом ACCESS_SECRET, поэтому cookie нельзя подделать.
 * Отпечаток `k` - начало SHA-256 входа (логин+пароль): пока этот вход
 * есть в списке, сессия живёт; убрали или отключили - он закрывается сразу.
 * Аудитория "*" выдаётся только редактору Storyblok через /api/preview.
 *
 * Только Web Crypto: тот же код работает и в proxy, и в серверном действии.
 */
export const COOKIE = "wb_access";
export const MAX_AGE = 60 * 60 * 24 * 30;

/** `l` - логин и `s` - id сессии нужны журналу входов; у входа редактора их нет */
type Payload = { a: Role | "*"; k: string; e: number; l?: string; s?: string };

export type Identity = { role: Role | "*"; login?: string; sid?: string };

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

/** Отпечаток входа: логин (без регистра) вместе с паролем */
const entryKey = ({ login, password }: Code) =>
  fingerprint(`${login.trim().toLowerCase()}
${password}`);

/**
 * По логину и паролю - в какую версию они пускают. Нужны оба. Перебирает оба
 * списка целиком, не останавливаясь на первом совпадении.
 */
export async function matchCode(
  login: string,
  password: string
): Promise<{ audience: Role; key: string; login: string } | null> {
  let found: { audience: Role; key: string; login: string } | null = null;

  for (const audience of ROLES) {
    for (const code of await codesFor(audience)) {
      const passwordOk = sameText(await fingerprint(code.password), await fingerprint(password));
      const loginOk = sameText(code.login.trim().toLowerCase(), login.trim().toLowerCase());
      if (passwordOk && loginOk && login.trim() && password) {
        found = { audience, key: await entryKey(code), login: login.trim() };
      }
    }
  }
  return found;
}

/** Значение cookie для вошедшего; null, если ACCESS_SECRET не задан */
export async function createSession(
  audience: Role | "*",
  key: string,
  who: { login?: string; sid?: string } = {}
) {
  const payload: Payload = { a: audience, k: key, e: Date.now() + MAX_AGE * 1000 };
  if (who.login) payload.l = who.login;
  if (who.sid) payload.s = who.sid;
  const body = b64.encode(JSON.stringify(payload));
  const signature = await sign(body);
  return signature ? `${body}.${signature}` : null;
}

/** Кто вошёл по этой cookie, или null, если cookie негодная или вход отозван */
export async function readIdentity(value: string | undefined): Promise<Identity | null> {
  if (!value) return null;
  const [body, signature] = value.split(".");
  if (!body || !signature) return null;

  const expected = await sign(body);
  if (!expected || !sameText(expected, signature)) return null;

  try {
    const payload = JSON.parse(b64.decode(body)) as Payload;
    if (!(payload.e > Date.now())) return null;
    if (payload.a === "*") return { role: "*" };
    if (!ROLES.includes(payload.a)) return null;

    // Вход, по которому вошли, должен всё ещё быть в списке
    for (const code of await codesFor(payload.a)) {
      if (sameText(await entryKey(code), payload.k)) {
        return { role: payload.a, login: payload.l, sid: payload.s };
      }
    }
    return null;
  } catch {
    return null;
  }
}

/** Роль, которую открывает cookie, или null */
export async function readSession(value: string | undefined): Promise<Role | "*" | null> {
  return (await readIdentity(value))?.role ?? null;
}
