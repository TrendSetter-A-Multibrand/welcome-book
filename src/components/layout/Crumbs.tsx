import { isExternal } from "@/lib/blok";

export type Crumb = { label: string; href?: string };

/**
 * Хлебные крошки над заголовком: «Онбординг / Office». Ссылки подчёркнуты, текущая
 * (последняя) - Text-2 и без ссылки. Уровень без адреса - просто текст. На мобайле
 * одна строка со свайпом, нажимаемая часть ссылки 44px; на десктопе отступ 16
 * сверху и снизу.
 */
export function Crumbs({ items }: { items: Crumb[] }) {
  if (!items.length) return null;

  return (
    <nav aria-label="Хлебные крошки" className="gutter-x">
      <ol className="t-caption lane flex items-center gap-2 overflow-x-auto whitespace-nowrap py-1 md:py-4">
        {items.map((item, index) => {
          const current = index === items.length - 1;
          const linked = !current && item.href && item.href !== "#";

          return (
            <li key={`${index}-${item.label}`} className="flex shrink-0 items-center gap-2">
              {linked ? (
                <a
                  href={item.href}
                  {...(isExternal(item.href!) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="inline-flex min-h-11 items-center text-sage underline underline-offset-2 transition-colors hover:text-red md:min-h-0"
                >
                  {item.label}
                </a>
              ) : (
                <span
                  aria-current={current ? "page" : undefined}
                  className={`inline-flex min-h-11 items-center md:min-h-0 ${
                    current ? "text-text-2" : "text-sage"
                  }`}
                >
                  {item.label}
                </span>
              )}
              {!current ? (
                <span aria-hidden="true" className="text-sage">
                  /
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
