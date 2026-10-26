import type { Block } from "@/lib/storyblok/fetchStory";
import { href, nested, text } from "@/lib/blok";
import { renderBlocks } from "@/components/blocks";
import { B2BHeader } from "@/components/layout/B2BHeader";
import { Crumbs, type Crumb } from "@/components/layout/Crumbs";

/**
 * Уровни крошек: из блоков `crumbs`; пока их нет - из двух старых полей страницы
 * («Онбординг» и текущая), чтобы страницы, заведённые раньше, не потеряли крошки.
 */
export function crumbsOf(content: Block): Crumb[] {
  const levels = nested(content.crumbs).map((crumb) => ({
    label: text(crumb.label) ?? "",
    href: href(crumb.link),
  }));
  if (levels.some((level) => level.label)) return levels.filter((level) => level.label);

  const root = text(content.crumb_root) ?? "Онбординг";
  const current = text(content.crumb);
  return current ? [{ label: root }, { label: current }] : [{ label: root }];
}

/**
 * Страница онбординга целиком: шапка, крошки и блоки тела по порядку.
 * Шапка и крошки берут тексты из полей самой страницы; тело - из блоков,
 * в том порядке, в каком их расставил редактор.
 */
export function OnboardingPage({ content }: { content: Block }) {
  const label = text(content.header_label) ?? "Onboarding";

  return (
    // Страница тянется на весь экран: поля по краям остаются 40px (16px на телефоне),
    // колонки сетки растут вместе с окном. Ограничение в 1440 снято по просьбе дизайнера.
    <div className="w-full">
      <B2BHeader label={label} feedbackHref={href(content.feedback_link)} />
      <Crumbs items={crumbsOf(content)} />
      <main>{renderBlocks(nested(content.body))}</main>
    </div>
  );
}
