import { SubTitle } from "@/components/ui/SubTitle";
import { Button } from "@/components/ui/Button";

/** «Окно обратной связи»: текст, пояснение и красная кнопка на форму. */
export function FeedbackGroup({
  number,
  title,
  text,
  muted,
  buttonLabel,
  buttonHref,
}: {
  number: string;
  title: string;
  text?: string;
  muted?: string;
  buttonLabel: string;
  buttonHref: string;
}) {
  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <SubTitle number={number}>{title}</SubTitle>
      <div className="flex flex-col items-start gap-4">
        {text ? <p className="t-body-l text-sage">{text}</p> : null}
        {muted ? <p className="t-body text-text-2">{muted}</p> : null}
        <Button href={buttonHref} icon="button-arrow">
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}
