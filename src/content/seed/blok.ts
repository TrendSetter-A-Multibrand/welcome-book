import type { Block } from "@/lib/storyblok/fetchStory";

/**
 * Сборщик блоков для seed-контента. Seed - это то, что лежит в Storyblok, только
 * написанное в коде: та же форма блока, те же имена полей. Поэтому сайт без токена
 * рисуется тем же кодом, что и сайт с токеном, а `storyblok:seed` заливает ровно
 * эти данные в пространство.
 *
 * `_uid` у блока должен быть свой и стабильный между сборками, иначе у React меняются
 * ключи, а у Storyblok - идентичность блока при повторной заливке.
 */
export function createBuilder(prefix: string) {
  let counter = 0;
  return function blok(
    component: string,
    fields: Record<string, unknown> = {}
  ): Block {
    counter += 1;
    return { _uid: `${prefix}-${String(counter).padStart(3, "0")}`, component, ...fields };
  };
}

export type Builder = ReturnType<typeof createBuilder>;

/** Ссылка в формате поля Storyblok: пока адрес не известен, она пустая и рисуется как «#» */
export const link = (url = "") => ({ fieldtype: "multilink", linktype: "url", url, cached_url: url });
