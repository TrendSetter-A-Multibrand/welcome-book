import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { AUDIENCES, isAudience } from "@/lib/audiences";
import { text } from "@/lib/blok";
import { getStory } from "@/lib/storyblok/getStory";
import { OnboardingPage } from "@/components/layout/OnboardingPage";
import { LiveStory } from "@/components/layout/LiveStory";

type Props = { params: Promise<{ audience: string }> };

/** Адреса, которые есть на сайте: ничего сверх списка аудиторий не отдаём */
export const dynamicParams = false;

export function generateStaticParams() {
  return AUDIENCES.map((audience) => ({ audience }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { audience } = await params;
  if (!isAudience(audience)) return {};

  const story = await getStory(audience);
  if (!story) return {};

  return {
    title: text(story.content.meta_title) ?? text(story.content.header_label),
    description: text(story.content.meta_description),
  };
}

/**
 * Страница тонкая: берёт историю и отдаёт её рисовальщику. Вёрстки и логики здесь
 * нет - они в components.
 */
export default async function AudiencePage({ params }: Props) {
  const { audience } = await params;
  if (!isAudience(audience)) notFound();

  const story = await getStory(audience);
  if (!story) notFound();

  // В Visual Editor страница слушает редактор (Bridge); у посетителей - нет
  const { isEnabled: editing } = await draftMode();
  if (editing) return <LiveStory storyId={story.id} content={story.content} />;

  return <OnboardingPage content={story.content} />;
}
