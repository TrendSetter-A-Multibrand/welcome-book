import { Inline } from "@/components/ui/Inline";

/** Врезка на Paper: определение, совет или деталь, которую можно пропустить. */
export function AnswerNote({ label, text }: { label: string; text: string }) {
  return (
    <aside className="flex flex-col gap-2 bg-paper p-6 text-sage">
      <p className="t-label">[{label}]</p>
      <p className="t-body">
        <Inline text={text} />
      </p>
    </aside>
  );
}
