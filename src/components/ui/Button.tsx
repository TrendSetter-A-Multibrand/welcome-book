import { isExternal } from "@/lib/blok";
import { Icon } from "@/components/ui/Icon";

/**
 * Кнопка-ссылка. Primary - главное действие, Inverse - белая на красной плоскости,
 * Ghost - с рамкой, третье действие. Размеры: L 56px (по умолчанию) и M 44px.
 * Hover: Primary и Inverse становятся Sage, Ghost заливается Sage. На мобайле
 * кнопка в блоке - на всю ширину. Иконка, если есть, - 20px после подписи.
 *
 * Пока адрес не задан (`#`), это не кнопка, а надпись в той же плашке: ни
 * ссылки, ни hover, ни курсора-руки. Иначе посетитель нажимал бы на то, что
 * ничего не делает.
 */
const VARIANTS = {
  primary: "bg-red text-white",
  inverse: "bg-white text-sage",
  ghost: "border border-sage bg-transparent text-sage",
} as const;

const HOVER = {
  primary: "hover:bg-sage",
  inverse: "hover:bg-sage hover:text-white",
  ghost: "hover:bg-sage hover:text-white",
} as const;

const SIZES = {
  l: "h-14 px-8",
  m: "h-11 px-6",
} as const;

export function Button({
  href,
  variant = "primary",
  size = "l",
  icon,
  children,
}: {
  href: string;
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  icon?: string;
  children: React.ReactNode;
}) {
  const base = `t-button inline-flex w-full items-center justify-center gap-3 md:w-auto ${SIZES[size]} ${VARIANTS[variant]}`;

  const content = (
    <>
      <span>{children}</span>
      {icon ? <Icon name={icon} size={20} /> : null}
    </>
  );

  if (href === "#") return <span className={base}>{content}</span>;

  return (
    <a
      href={href}
      {...(isExternal(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`${base} ${HOVER[variant]} transition-colors duration-200`}
    >
      {content}
    </a>
  );
}
