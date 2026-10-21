/**
 * Для кого страница. Каждая аудитория - своя история в Storyblok с тем же именем
 * (`office`, `retail`) и свой адрес на сайте. Список задан в коде: новая страница
 * - это новая история в CMS плюс строка здесь.
 */
export const AUDIENCES = ["office", "retail"] as const;

export type Audience = (typeof AUDIENCES)[number];

export const isAudience = (value: string): value is Audience =>
  (AUDIENCES as readonly string[]).includes(value);
