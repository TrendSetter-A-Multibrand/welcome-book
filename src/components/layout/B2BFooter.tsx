import { Logo } from "@/components/layout/Logo";

/**
 * Подвал Sage: строка с © и логотип White во всю ширину. На десктопе логотип
 * обрезан снизу (суперграфика), на мобайле показан целиком.
 */
export function B2BFooter({ text }: { text: string }) {
  return (
    <footer className="bg-sage md:pt-6">
      <div className="gutter-x">
        <p className="t-caption border-t-0 py-6 text-line md:border-t md:border-text-2">
          {text}
        </p>
      </div>
      <div className="gutter-x">
        <div className="md:aspect-[1360/93.867] md:overflow-hidden">
          <Logo color="white" className="w-full" />
        </div>
      </div>
    </footer>
  );
}
