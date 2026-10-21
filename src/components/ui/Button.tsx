import { isExternal } from "@/lib/blok";
import { Icon } from "@/components/ui/Icon";

/**
 * Кнопка-ссылка 56px (control/l). Primary - главное действие, Inverse - белая на
 * красной плоскости. Hover: оба становятся Sage. На мобайле кнопка в блоке - на
 * всю ширину. Иконка, если есть, - 20px после подписи.
 */
const VARIANTS = {
  primary: "bg-red text-white hover:bg-sage",
  inverse: "bg-white text-sage hover:bg-sage hover:text-white",
} as const;

export function Button({
  href,
  variant = "primary",
  icon,
  children,
}: {
  href: string;
  variant?: keyof typeof VARIANTS;
  icon?: string;
  children: React.ReactNode;
}) {
  const external = isExternal(href);
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`t-button inline-flex h-14 w-full items-center justify-center gap-3 px-8 transition-colors duration-200 md:w-auto ${VARIANTS[variant]}`}
    >
      <span>{children}</span>
      {icon ? <Icon name={icon} size={20} /> : null}
    </a>
  );
}
