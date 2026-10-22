import Image from "next/image";

/** Пропорции из макета: 4:3 - по умолчанию, 16:9 - на всю ширину, 1:1, 21:9 */
const RATIOS = {
  "4:3": "aspect-[4/3]",
  "16:9": "aspect-video",
  "1:1": "aspect-square",
  "21:9": "aspect-[21/9]",
} as const;

export type Ratio = keyof typeof RATIOS;
export const isRatio = (value: unknown): value is Ratio =>
  typeof value === "string" && value in RATIOS;

/** Фото в ответе с подписью Caption под ним. Без загруженного файла не рисуется. */
export function AnswerImage({
  src,
  alt,
  ratio,
  caption,
}: {
  src: string;
  alt: string;
  ratio: Ratio;
  caption?: string;
}) {
  return (
    <figure className="flex flex-col gap-2">
      <div className={`relative w-full overflow-hidden bg-paper ${RATIOS[ratio]}`}>
        <Image
          src={src}
          alt={alt || caption || ""}
          fill
          sizes="(min-width: 768px) 720px, 100vw"
          className="object-cover"
        />
      </div>
      {caption ? (
        <figcaption className="t-caption text-text-2">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
