import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

/**
 * The way in from Storyblok's editor: it opens the site through this address,
 * the browser is handed the cookie that turns draft mode on, and from then on
 * every story is read as it is being written rather than as it was published.
 *
 * Anyone holding the secret can read unpublished work, which is the whole point
 * and also the whole risk - it is a long random string in the environment, not
 * something to put in a link that leaves the editor.
 */
export async function GET(request: Request) {
  const secret = process.env.STORYBLOK_PREVIEW_SECRET;
  if (!secret) {
    return Response.json({ error: "no secret configured" }, { status: 500 });
  }

  const url = new URL(request.url);
  if (url.searchParams.get("secret") !== secret) {
    return Response.json({ error: "wrong secret" }, { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();

  // The editor appends the story's own path, and the home story's path is
  // "home", which is not an address on the site - its address is the root. Every
  // other story's path is already the site's own, and the locale in front of it
  // is added by the proxy.
  const asked = url.searchParams.get("to") ?? "/";
  const to = asked.replace(/^\/?home\/?$/, "/");

  // Only a path of our own, never wherever the address happens to point: an open
  // redirect here would let the link be used to send people anywhere.
  redirect(to.startsWith("/") && !to.startsWith("//") ? to : "/");
}
