import { SubTitle } from "@/components/ui/SubTitle";
import { ResourceLink } from "@/components/blocks/ResourceLink";

export type ResourceLinkItem = {
  kind: string;
  title: string;
  text?: string;
  action?: string;
  href: string;
};

/** Группа ссылок в «Ресурсах»: номер, заголовок и строки-ссылки. */
export function LinkGroup({
  number,
  title,
  links,
}: {
  number: string;
  title: string;
  links: ResourceLinkItem[];
}) {
  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <SubTitle number={number}>{title}</SubTitle>
      <ul>
        {links.map((link) => (
          <ResourceLink key={`${link.kind}-${link.title}`} {...link} />
        ))}
      </ul>
    </div>
  );
}
