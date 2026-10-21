import { fetchStory, type Story } from "@/lib/storyblok/fetchStory";
import { seedStory } from "@/content/seed";

/**
 * Страница для сайта: из Storyblok, а пока токена нет - из seed-контента.
 *
 * Токен задан - слово за CMS, и история, которой в ней нет, это 404, а не тихая
 * подстановка seed: иначе ошибка в настройке пространства выглядела бы как
 * работающий сайт со старым текстом.
 */
export async function getStory(slug: string): Promise<Story | null> {
  if (!process.env.STORYBLOK_TOKEN) return seedStory(slug);
  return fetchStory(slug);
}
