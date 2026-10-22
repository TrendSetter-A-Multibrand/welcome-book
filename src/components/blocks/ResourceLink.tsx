import { isExternal } from "@/lib/blok";
import { Icon } from "@/components/ui/Icon";

/**
 * Строка ссылки в «Ресурсах»: тип [Сайт]/[Соцсеть] Text-2, заголовок H4 с
 * пояснением Body S и стрелка ↗ (с подписью на десктопе). Тонкие линии между
 * строками. Hover - красный, стрелка сдвигается на 2px; нажатие - Paper.
 *
 * Пока адрес не задан (`#`), строка остаётся строкой, но без стрелки, hover и
 * ссылки: заглушка не должна выглядеть рабочей.
 */
export function ResourceLink({
  kind,
  title,
  text,
  action,
  href,
}: {
  kind: string;
  title: string;
  text?: string;
  action?: string;
  href: string;
}) {
  const live = href !== "#";

  const body = (
    <>
      <span className="t-caption text-text-2 @min-[640px]:w-28 @min-[640px]:shrink-0">
        [{kind}]
      </span>

      <span className="flex min-w-0 flex-1 items-center gap-4">
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="t-h4">{title}</span>
          {text ? <span className="t-body-s max-w-[560px] text-text-2">{text}</span> : null}
        </span>
        {live ? (
          <span className="flex shrink-0 items-center gap-2">
            {action ? <span className="t-caption hidden md:inline">{action}</span> : null}
            <Icon
              name="arrow-ne"
              size={24}
              className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </span>
        ) : null}
      </span>
    </>
  );

  const layout =
    "flex flex-col gap-1 py-4 text-sage md:py-6 @min-[640px]:flex-row @min-[640px]:items-start @min-[640px]:gap-6";

  return (
    <li className="border-t border-line first:border-t-0">
      {live ? (
        <a
          href={href}
          {...(isExternal(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className={`group ${layout} transition-colors hover:text-red active:bg-paper`}
        >
          {body}
        </a>
      ) : (
        <div className={layout}>{body}</div>
      )}
    </li>
  );
}
