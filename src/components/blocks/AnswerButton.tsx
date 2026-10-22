import { Button } from "@/components/ui/Button";

/** Кнопка-ссылка в ответе (рамка, 44px): форма, документ, внешний сервис. */
export function AnswerButton({ label, href }: { label: string; href: string }) {
  // Без адреса кнопка в ответе только вводит в заблуждение: не рисуем
  if (href === "#") return null;
  return (
    <div>
      <Button href={href} variant="ghost" size="m" icon="arrow-ne">
        {label}
      </Button>
    </div>
  );
}
