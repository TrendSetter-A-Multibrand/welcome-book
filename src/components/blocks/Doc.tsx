import { TocSidebar, TocSwitcher, type TocItem } from "@/components/blocks/TocNav";

/** Якорь, на который указывает «Содержание»: один на весь документ. */
export const DOC_ID = "doc";

/**
 * Тело документа: оглавление и разделы. На широком экране оглавление - липкая
 * колонка слева (колонки 1-3 сетки из 12), разделы - колонки 5-12; на узком
 * оглавление становится переключателем, который липнет к верху.
 *
 * Разделы рисуются контейнерным запросом: плитки перестраиваются по ширине
 * колонки с текстом, а не окна.
 */
export function Doc({
  toc,
  children,
}: {
  toc: TocItem[];
  children: React.ReactNode;
}) {
  return (
    <div id={DOC_ID}>
      <TocSwitcher items={toc} docId={DOC_ID} />

      <div className="gutter-x flex flex-col pt-8 toc:grid toc:grid-cols-12 toc:gap-x-6">
        <aside className="hidden toc:col-span-3 toc:block">
          <div className="sticky top-6">
            <TocSidebar items={toc} docId={DOC_ID} />
          </div>
        </aside>

        <div className="@container flex flex-col gap-16 md:gap-32 toc:col-span-8 toc:col-start-5">
          {children}
        </div>
      </div>
    </div>
  );
}
