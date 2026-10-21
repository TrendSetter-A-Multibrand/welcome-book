import { SubTitle } from "@/components/ui/SubTitle";
import { AccordionItem } from "@/components/ui/AccordionItem";

export type QaItem = { question: string; answer: string[] };

/** Группа вопросов-ответов: номер, заголовок и аккордеон. Нумерация пунктов своя. */
export function QaGroup({
  number,
  title,
  items,
}: {
  number: string;
  title: string;
  items: QaItem[];
}) {
  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <SubTitle number={number}>{title}</SubTitle>
      <div>
        {items.map((item, index) => (
          <AccordionItem
            key={item.question}
            number={String(index + 1).padStart(2, "0")}
            question={item.question}
            answer={item.answer}
          />
        ))}
      </div>
    </div>
  );
}
