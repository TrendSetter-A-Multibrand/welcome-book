import type { Story } from "@/lib/storyblok/fetchStory";
import { officeStory } from "./office.ts";
import { retailStory } from "./retail.ts";
import { loginStory } from "./login.ts";

/** История из seed-контента по пути или null, если такой нет */
export function seedStory(slug: string): Story | null {
  if (slug === "office") return officeStory();
  if (slug === "retail") return retailStory();
  if (slug === "login") return loginStory();
  return null;
}
