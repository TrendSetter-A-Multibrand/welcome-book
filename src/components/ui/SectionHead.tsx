/**
 * Заголовок секции: [МЕТКА] моно-капсом и линия Sage до края. Линия заголовка -
 * единственная линия секции (правило R16 макета).
 */
export function SectionHead({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 md:gap-6">
      <p className="t-label shrink-0 text-sage">{title}</p>
      <div aria-hidden="true" className="h-px min-w-4 flex-1 bg-sage" />
    </div>
  );
}
