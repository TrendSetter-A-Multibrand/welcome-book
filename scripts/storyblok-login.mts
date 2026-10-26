/**
 * Заводит в Storyblok окно входа: блок `login_page` и историю `login` с текстами
 * из seed. Остальные блоки и страницы не трогает. Если история уже есть, её тексты
 * не перезаписываются - их правят редакторы.
 *
 * npm run storyblok:login
 */
import { readFile } from "node:fs/promises";
import { api } from "./mapi.mjs";
import { loginContent } from "../src/content/seed/login.ts";

const wanted = JSON.parse(await readFile("storyblok/components.json", "utf8")).find(
  (component: { name: string }) => component.name === "login_page"
);

const { components } = await api("/components");
const already = components.find((c: { name: string }) => c.name === "login_page");
if (already) {
  await api(`/components/${already.id}`, {
    method: "PUT",
    body: JSON.stringify({ component: { ...wanted, id: already.id } }),
  });
  console.log("обновлён  login_page");
} else {
  await api("/components", { method: "POST", body: JSON.stringify({ component: wanted }) });
  console.log("создан    login_page");
}

const { stories } = await api("/stories?with_slug=login");
if (stories[0]) {
  console.log("история login уже есть, тексты не тронуты");
} else {
  await api("/stories", {
    method: "POST",
    body: JSON.stringify({
      story: {
        name: "Вход",
        slug: "login",
        content_type: "login_page",
        content: loginContent(),
        // Visual Editor открывает окно входа по главной
        path: "/",
      },
      publish: 1,
    }),
  });
  console.log("создана   история login");
}
