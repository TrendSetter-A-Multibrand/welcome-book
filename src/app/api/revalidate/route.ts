import { revalidateTag } from "next/cache";
import { ALL, storyTag } from "@/lib/storyblok/client";

/**
 * Storyblok calls this when a story is published or unpublished, and the page
 * that story feeds is dropped from the cache.
 *
 * The secret rides in the address because that is what Storyblok's webhook form
 * takes; it is the only thing standing between this route and anyone who can
 * guess it, so it belongs in the environment and nowhere else.
 */
export async function POST(request: Request) {
  const secret = process.env.STORYBLOK_REVALIDATE_SECRET;
  if (!secret) {
    return Response.json({ error: "no secret configured" }, { status: 500 });
  }

  const url = new URL(request.url);
  if (url.searchParams.get("secret") !== secret) {
    return Response.json({ error: "wrong secret" }, { status: 401 });
  }

  // A story says which one it was; anything else clears the lot rather than
  // guess, which is cheap next to serving yesterday's page.
  const body = (await request.json().catch(() => null)) as {
    full_slug?: string;
    action?: string;
  } | null;

  // "max" is stale-while-revalidate: the tag is marked old, the next visitor is
  // still served the cached page and the fresh one is fetched behind them. The
  // one-argument form, which expires it there and then, is deprecated in this
  // version - so an editor watching the live page may need one more reload.
  const slug = body?.full_slug;
  if (slug) revalidateTag(storyTag(slug), "max");
  else revalidateTag(ALL, "max");

  return Response.json({ revalidated: slug ?? ALL, action: body?.action });
}
