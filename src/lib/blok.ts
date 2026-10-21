import type { Block } from "@/lib/storyblok/fetchStory";

/**
 * Читалки полей блока. Редактор может оставить поле пустым, стереть или не
 * дойти до него вовсе, поэтому каждое поле читается как «что-то или ничего», а
 * не как значение, которое точно есть.
 */

/** Непустая строка или undefined */
export const text = (value: unknown) =>
  typeof value === "string" && value.trim() ? value : undefined;

/** Вложенные блоки поля, что бы редактор туда ни положил */
export const nested = (value: unknown) => (value as Block[] | undefined) ?? [];

/**
 * Пустое поле-картинка всё равно приходит объектом, поэтому о том, выбрано ли
 * что-то, говорит имя файла.
 */
export const image = (value: unknown) => {
  const asset = value as { filename?: string; alt?: string } | undefined;
  return asset?.filename ? { src: asset.filename, alt: asset.alt ?? "" } : undefined;
};

type Link = { linktype?: string; url?: string; cached_url?: string };

/**
 * Поле-ссылка Storyblok. Внутренняя ссылка приходит путём истории, внешняя -
 * адресом; пустая - "#", чтобы кнопка без адреса оставалась кнопкой на месте, а
 * не пропадала.
 */
export function href(value: unknown): string {
  const link = value as Link | string | undefined;
  const raw = typeof link === "string" ? link : link?.url || link?.cached_url;
  if (!raw) return "#";
  if (/^([a-z]+:|#|\/)/i.test(raw)) return raw;
  return `/${raw}`;
}

/** Ссылка ведёт за пределы сайта */
export const isExternal = (to: string) => /^https?:\/\//i.test(to);

/** Пустая строка в поле начинает новый абзац - так и написано редактору */
export const paragraphs = (value: unknown) =>
  (text(value) ?? "")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
