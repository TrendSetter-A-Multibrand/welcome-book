/**
 * Хлебные крошки над заголовком: «Онбординг / Office». Текущая - Text-2 и без
 * ссылки. Отступ 16 сверху и снизу.
 */
export function Crumbs({ root, current }: { root: string; current: string }) {
  return (
    <nav aria-label="Хлебные крошки" className="gutter-x">
      <ol className="t-caption flex items-center gap-2 py-4">
        <li className="text-sage">{root}</li>
        <li aria-hidden="true" className="text-sage">
          /
        </li>
        <li aria-current="page" className="text-text-2">
          {current}
        </li>
      </ol>
    </nav>
  );
}
