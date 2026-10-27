/**
 * Заводит в Storyblok пароли доступа: блоки `access_page` и `access_code` и пустую
 * историю `access`. Если история уже есть, её пароли не трогаются.
 *
 * npm run storyblok:access
 */
import { readFile } from "node:fs/promises";
import { api } from "./mapi.mjs";

const all = JSON.parse(await readFile("storyblok/components.json", "utf8")) as {
  name: string;
}[];

const { components } = await api("/components");

// access_code первым: access_page ссылается на него в списке разрешённых блоков
for (const name of ["access_code", "access_page"]) {
  const wanted = all.find((component) => component.name === name);
  const already = components.find((c: { name: string }) => c.name === name);
  if (already) {
    await api(`/components/${already.id}`, {
      method: "PUT",
      body: JSON.stringify({ component: { ...wanted, id: already.id } }),
    });
    console.log(`обновлён  ${name}`);
  } else {
    await api("/components", { method: "POST", body: JSON.stringify({ component: wanted }) });
    console.log(`создан    ${name}`);
  }
}

const { stories } = await api("/stories?with_slug=access");
if (stories[0]) {
  console.log("история access уже есть, пароли не тронуты");
} else {
  await api("/stories", {
    method: "POST",
    body: JSON.stringify({
      story: {
        name: "Доступ (пароли)",
        slug: "access",
        content_type: "access_page",
        content: { component: "access_page", passwords: [] },
      },
      publish: 1,
    }),
  });
  console.log("создана   история access");
}
