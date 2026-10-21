# TRENDSETTER Welcome Book

Сайт-онбординг для новых сотрудников: культура, первый день, ресурсы и FAQ. Две
версии - **Office** (`/office`) и **Retail** (`/retail`) - на одних и тех же
компонентах, разный только контент.

Дизайн: Figma «TRENDSETTER WEB 2.0», страница «05 Онбординг 19.10».
Стек: Next.js 16 (App Router) · TypeScript · Tailwind 4 · Storyblok · Vercel.

## Запуск

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # vitest
npm run lint
npm run build
```

Без токена Storyblok сайт не падает: страницы берутся из локального seed-контента
(`src/content/seed`). Чтобы работать с настоящим CMS, скопируйте `.env.example` в
`.env.local` и впишите значения (репозиторий публичный - токены только там и в
Environment Variables на Vercel).

## Как устроено

```
src/
  app/
    page.tsx               # временный выбор Office / Retail
    [audience]/page.tsx    # /office, /retail - тонкая страница
    api/preview            # вход из редактора Storyblok (draft mode)
    api/revalidate         # вебхук Storyblok: сбросить кеш при публикации
  components/
    blocks/                # один файл = один блок Storyblok; index.tsx - реестр
    ui/                    # примитивы дизайн-системы
    layout/                # шапка, подвал, крошки, страница целиком
  content/seed/            # контент Office и Retail в форме блоков Storyblok
  lib/storyblok/           # клиент, fetchStory, getStory (CMS или seed)
storyblok/components.json  # схема блоков для пространства
scripts/                   # storyblok:push, storyblok:seed
```

Правила - в `ARCHITECTURE.md` соседнего репозитория `trendsetter-website`: те же
(один блок - один файл, страницы тонкие, секреты только в env).

## Контент в Storyblok

1. Заведите пространство, пропишите `STORYBLOK_*` в `.env.local`.
2. `npm run storyblok:push` - создаст блоки из `storyblok/components.json`.
3. `npm run storyblok:seed` - зальёт страницы `office` и `retail` из seed.
   Запускать на пустом пространстве: повторный запуск перезапишет правки редакторов.
4. Settings → Visual Editor: адрес `https://<домен>/api/preview?secret=<STORYBLOK_PREVIEW_SECRET>&to=`.
5. Settings → Webhooks: `https://<домен>/api/revalidate?secret=<STORYBLOK_REVALIDATE_SECRET>`
   на события публикации и снятия с публикации.

Что считается само, редактор не ведёт: номера разделов `[01 / …]`, оглавление,
сквозная нумерация групп в «Ресурсах» (у группы можно занять два номера, `01–02`).

## Добавить блок

1. Компонент в `src/components/blocks/` (получает готовые свойства, о CMS не знает).
2. Схема в `storyblok/components.json`, имя компонента = технический код блока.
3. Строка в таблице `DRAW` в `src/components/blocks/index.tsx`.
4. `npm run storyblok:push`.
