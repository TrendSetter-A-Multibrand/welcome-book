import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { text } from "@/lib/blok";
import { COOKIE, readSession } from "@/lib/access/session";
import { getStory } from "@/lib/storyblok/getStory";
import { loginContent } from "@/content/seed/login";
import { B2BHeader } from "@/components/layout/B2BHeader";
import { LoginForm, type LoginTexts } from "@/components/login/LoginForm";

/** Тексты окна входа: из Storyblok (история `login`), чего редактор не заполнил - из seed */
async function loadContent() {
  const story = await getStory("login");
  const fallback = loginContent();
  const pick = (name: string) =>
    text(story?.content[name]) ?? (fallback[name] as string);
  return { pick };
}

export async function generateMetadata(): Promise<Metadata> {
  const { pick } = await loadContent();
  return { title: pick("meta_title") };
}

/**
 * Окно входа. Пароль решает, какую версию открыть: Office или Retail. Уже
 * вошедшего сразу отправляем в его версию.
 */
export default async function Home() {
  const session = await readSession((await cookies()).get(COOKIE)?.value);
  if (session && session !== "*") redirect(session === "admin" ? "/stats" : `/${session}`);

  const { pick } = await loadContent();
  const texts: LoginTexts = {
    eyebrow: pick("eyebrow"),
    title: pick("title"),
    titleError: pick("title_error"),
    lead: pick("lead"),
    emailLabel: pick("email_label"),
    emailPlaceholder: pick("email_placeholder"),
    passwordLabel: pick("password_label"),
    passwordPlaceholder: pick("password_placeholder"),
    button: pick("button"),
    hint: pick("hint"),
    errorHint: pick("error_hint"),
  };

  return (
    <>
      <B2BHeader label={pick("header_label")} feedbackHref="#" />
      <main className="gutter-x flex min-h-[calc(100vh-64px)] flex-col items-center justify-center py-12 md:min-h-[calc(100vh-80px)] md:py-24">
        <LoginForm texts={texts} />
      </main>
    </>
  );
}
