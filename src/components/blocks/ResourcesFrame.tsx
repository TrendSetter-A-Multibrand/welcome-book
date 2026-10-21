/**
 * Рамка раздела «Ресурсы»: 1px Sage, внутри заголовок H2 и группы. Группы
 * приходят готовыми узлами: нумерацию, которая сквозная по всей рамке, считает
 * реестр блоков.
 */
export function ResourcesFrame({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-12 border border-sage px-4 py-6 md:gap-16 md:p-12">
      {title ? <h3 className="t-h2 text-sage">{title}</h3> : null}
      {children}
    </div>
  );
}
