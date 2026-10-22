import { Button } from "@/components/ui/Button";

/**
 * «Как добраться» на Paper: [метка], место H3, адрес и кнопка с рамкой. Для
 * «Информации об офисе» и «Информации о торговом центре».
 */
export function AnswerPlace({
  label,
  place,
  address,
  buttonLabel,
  buttonHref,
}: {
  label: string;
  place: string;
  address?: string;
  buttonLabel?: string;
  buttonHref: string;
}) {
  return (
    <div className="flex flex-col items-start gap-4 bg-paper p-6 text-sage">
      <p className="t-label">[{label}]</p>
      <p className="t-h3">{place}</p>
      {address ? <p className="t-body">{address}</p> : null}
      {buttonLabel && buttonHref !== "#" ? (
        <Button href={buttonHref} variant="ghost" size="m" icon="arrow-ne">
          {buttonLabel}
        </Button>
      ) : null}
    </div>
  );
}
