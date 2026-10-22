import { Logo } from "@/components/layout/Logo";

/**
 * Подвал Sage: строка с © и логотип White во всю ширину. Логотип показан целиком
 * и с воздухом под ним: в макете он обрезан по нижнему краю, но на странице это
 * выглядело как прижатое к краю экрана.
 */
export function B2BFooter({ text }: { text: string }) {
  return (
    <footer className="bg-sage pb-6 md:pb-10 md:pt-6">
      <div className="gutter-x">
        <p className="t-caption border-t-0 py-6 text-line md:border-t md:border-text-2">
          {text}
        </p>
      </div>
      <div className="gutter-x">
        <Logo color="white" className="w-full" />
      </div>
    </footer>
  );
}
