/**
 * Иконка из /public/icons, нарисованная маской: цвет берётся из `currentColor`,
 * поэтому одна и та же иконка стоит и на красной плитке (белая), и на мятной
 * (чёрная), и краснеет на hover вместе с текстом рядом.
 *
 * Файлы - ровно те SVG, что выгружены из Figma; здесь они только красятся.
 */
export function Icon({
  name,
  size,
  className = "",
}: {
  name: string;
  /** Сторона в пикселях; без неё размер задаёт className */
  size?: number;
  className?: string;
}) {
  const url = `url(/icons/${name}.svg)`;
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{
        width: size,
        height: size,
        maskImage: url,
        WebkitMaskImage: url,
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskSize: "100% 100%",
        WebkitMaskSize: "100% 100%",
      }}
    />
  );
}
