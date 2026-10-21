import { draftMode } from "next/headers";
import {
  storyblokFetch,
  StoryblokError,
  storyTag,
} from "@/lib/storyblok/client";

/**
 * Блок, каким его оставил редактор. У каждого блока есть имя его типа и свой id;
 * остальное - дело самого блока, поэтому форму знает тот, кто его рисует.
 */
export type Block = {
  _uid: string;
  component: string;
  [field: string]: unknown;
};

export type Story<T = Block> = {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  full_slug: string;
  content: T;
  published_at: string | null;
};

/**
 * Одна история по пути. Возвращает null, если по этому пути ничего нет, чтобы
 * страница сама вызвала notFound(), а не ловила исключение.
 *
 * Какая версия вернётся, решает не эта функция: при включённом draft mode - то
 * есть при заходе из редактора через /api/preview - читается то, что пишется
 * сейчас, иначе то, что опубликовано.
 */
export async function fetchStory<T = Block>(
  slug: string
): Promise<Story<T> | null> {
  const { isEnabled: draft } = await draftMode();

  try {
    const { story } = await storyblokFetch<{ story: Story<T> }>(
      `stories/${slug}`,
      { draft, tags: [storyTag(slug)] }
    );
    return story;
  } catch (error) {
    if (error instanceof StoryblokError && error.status === 404) return null;
    throw error;
  }
}
