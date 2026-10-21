import Image from "next/image";

/**
 * Логотип TRENDSETTER. Red - основной на светлом, White - на Sage и Red.
 * Файлы из Figma без изменений; пропорции 273.333 : 20.272 держит сам файл.
 */
export function Logo({
  color,
  className = "",
}: {
  color: "red" | "white";
  className?: string;
}) {
  return (
    <Image
      src={`/brand/logo-${color}.svg`}
      alt="TRENDSETTER"
      width={273}
      height={20}
      unoptimized
      className={`h-auto ${className}`}
    />
  );
}
