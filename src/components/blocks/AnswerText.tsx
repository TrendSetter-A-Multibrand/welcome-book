import { Inline } from "@/components/ui/Inline";

/** Абзацы ответа: текст Text-2, пустая строка в поле - новый абзац. */
export function AnswerText({ paragraphs }: { paragraphs: string[] }) {
  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="t-body text-text-2">
          <Inline text={paragraph} />
        </p>
      ))}
    </>
  );
}
