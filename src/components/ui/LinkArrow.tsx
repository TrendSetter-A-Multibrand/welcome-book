import { isExternal } from "@/lib/blok";
import { Icon } from "@/components/ui/Icon";

/**
 * Текстовая ссылка со стрелкой, моно-капсом (Label). Hover - красный, стрелка
 * сдвигается на 4px.
 */
export function LinkArrow({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const external = isExternal(href);
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group t-label inline-flex items-center gap-2 text-sage transition-colors hover:text-red"
    >
      <span>{children}</span>
      <Icon
        name="arrow"
        size={16}
        className="transition-transform duration-200 group-hover:translate-x-1"
      />
    </a>
  );
}
