/**
 * Заливает в пространство Storyblok страницы Office и Retail из seed-контента
 * (src/content/seed) и публикует их. Запускать после storyblok:push, потому что
 * блоки должны уже существовать.
 *
 * Страницы ищутся по пути, поэтому скрипт можно запускать повторно: он обновит то,
 * что уже есть, и перезапишет правки редакторов в этих двух историях. Для живого
 * пространства это опасно - повторный запуск нужен только на пустом пространстве
 * или осознанно.
 *
 * npm run storyblok:seed
 */
import { putStory } from "./mapi.mjs";
import { officeContent } from "../src/content/seed/office.ts";
import { retailContent } from "../src/content/seed/retail.ts";

const pages = [
  { slug: "office", name: "Office", content: officeContent() },
  { slug: "retail", name: "Retail", content: retailContent() },
];

for (const page of pages) {
  const result = await putStory(page.slug, page.name, page.content);
  console.log(`${result}  ${page.slug}`);
}
