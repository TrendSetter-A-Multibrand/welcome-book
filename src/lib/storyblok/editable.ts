import type { Block } from "@/lib/storyblok/fetchStory";

/**
 * Атрибуты, по которым Storyblok Bridge находит блок на странице: клик по
 * элементу в Visual Editor открывает ровно его поле.
 *
 * Черновик приходит от API с полем `_editable`: комментарий вида
 * `<!--#storyblok#{"name":"...","uid":"..."}-->`. Из него и собираются атрибуты;
 * у опубликованной версии поля нет, и тогда атрибутов нет, а значит разметка
 * продакшена остаётся чистой.
 */
export function editableAttrs(
  blok: Block
): { "data-blok-c": string; "data-blok-uid": string } | undefined {
  const raw = blok._editable;
  if (typeof raw !== "string") return undefined;

  const match = raw.match(/<!--#storyblok#(.*)-->/s);
  if (!match) return undefined;

  try {
    const options = JSON.parse(match[1]) as { id: string | number; uid: string };
    return {
      "data-blok-c": JSON.stringify(options),
      "data-blok-uid": `${options.id}-${options.uid}`,
    };
  } catch {
    return undefined;
  }
}
