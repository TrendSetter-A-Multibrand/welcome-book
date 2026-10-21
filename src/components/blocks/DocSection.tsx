import { SectionHead } from "@/components/ui/SectionHead";

/**
 * Раздел документа: [01 / Приветствие], необязательные заголовок H2 и лид и
 * содержимое. Якорь `id` - то, на что указывает оглавление; отступ сверху
 * оставляет раздел под липкой строкой переключателя.
 */
export function DocSection({
  id,
  head,
  title,
  lead,
  children,
}: {
  id: string;
  head: string;
  title?: string;
  lead?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-label={title ?? head}
      className="flex scroll-mt-20 flex-col gap-6 md:gap-8 toc:scroll-mt-6"
    >
      <SectionHead title={head} />
      {title ? <h2 className="t-h2 text-sage">{title}</h2> : null}
      {lead ? <p className="t-body-l text-text-2">{lead}</p> : null}
      {children}
    </section>
  );
}
