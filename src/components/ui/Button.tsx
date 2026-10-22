import { isExternal } from "@/lib/blok";
import { Icon } from "@/components/ui/Icon";

/**
 * Кнопка 56px (control/l). Primary - главное действие, Inverse - белая на красной
 * плоскости. Hover: оба становятся Sage. На мобайле кнопка в блоке - на всю
 * ширину. Иконка, если есть, - 20px после подписи.
 *
 * Пока адрес не задан (`#`), это не кнопка, а надпись в той же плашке: ни
 * ссылки, ни hover, ни курсора-руки. Иначе посетитель нажимал бы на то, что
 * ничего не делает.
 */
const VARIANTS = {
  primary: "bg-red text-white",
  inverse: "bg-white text-sage",
} as const;

const HOVER = {
  primary: "hover:bg-sage",
  inverse: "hover:bg-sage hover:text-white",
} as const;

const BASE =
  "t-button inline-flex h-14 w-full items-center justify-center gap-3 px-8 md:w-auto";

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
  const content = (
    <>
      <span>{children}</span>
      {icon ? <Icon name={icon} size={20} /> : null}
    </>
  );

  if (href === "#") {
    return <span className={`${BASE} ${VARIANTS[variant]}`}>{content}</span>;
  }

  return (
    <a
      href={href}
      {...(isExternal(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`${BASE} ${VARIANTS[variant]} ${HOVER[variant]} transition-colors duration-200`}
    >
      {content}
    </a>
  );
}
