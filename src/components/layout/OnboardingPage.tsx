import type { Block } from "@/lib/storyblok/fetchStory";
import { href, nested, text } from "@/lib/blok";
import { renderBlocks } from "@/components/blocks";
import { B2BHeader } from "@/components/layout/B2BHeader";
import { B2BFooter } from "@/components/layout/B2BFooter";
import { Crumbs } from "@/components/layout/Crumbs";

/**
 * Страница онбординга целиком: шапка, крошки, блоки тела по порядку и подвал.
 * Шапка, крошки и подвал берут тексты из полей самой страницы; тело - из блоков,
 * в том порядке, в каком их расставил редактор.
 */
export function OnboardingPage({ content }: { content: Block }) {
  const label = text(content.header_label) ?? "Onboarding";

  return (
    // Макет нарисован на 1440: шире страница остаётся по центру, а не растягивается.
    <div className="mx-auto max-w-[1440px]">
      <B2BHeader label={label} feedbackHref={href(content.feedback_link)} />
      <Crumbs
        root={text(content.crumb_root) ?? "Онбординг"}
        current={text(content.crumb) ?? ""}
      />
      <main>{renderBlocks(nested(content.body))}</main>
      <B2BFooter text={text(content.footer_text) ?? `© TRENDSETTER · ${label}`} />
    </div>
  );
}
