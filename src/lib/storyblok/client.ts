/**
 * Everything the site needs to reach Storyblok: which host answers, which token
 * to send, and how long an answer may be kept.
 *
 * Read at call time rather than at import, so a missing token is an error from
 * the request that wanted it instead of a crash while the server boots.
 */

/** Every region but the first is the same name with its code in it. */
const HOSTS: Record<string, string> = {
  eu: "api.storyblok.com",
  us: "api-us.storyblok.com",
  ap: "api-ap.storyblok.com",
  ca: "api-ca.storyblok.com",
};

/**
 * The webhook is what actually refreshes a story, so this is only the floor
 * under it: an hour after the last read, a page checks for itself whether it is
 * still current. Without it a webhook that never arrived would leave the page
 * stale until the next deploy.
 */
const MAX_AGE = 3600;

/** Everything read from Storyblok wears this, so one call can clear the lot. */
export const ALL = "storyblok";

/** And its own, so publishing one story leaves the rest of the cache alone. */
export const storyTag = (slug: string) => `storyblok:${slug}`;

/**
 * Storyblok counts requests per second and refuses the ones over the line. A
 * build renders every page at once across as many workers as the machine has
 * cores, so the line is crossed there rather than in front of a reader - and a
 * refused request would fail the whole build. Waited out and asked again, twice.
 */
const RETRIES = 3;

const wait = (ms: number) => new Promise((done) => setTimeout(done, ms));

export class StoryblokError extends Error {
  constructor(
    readonly status: number,
    readonly path: string,
    body: string
  ) {
    super(`Storyblok ${status} on ${path}: ${body.slice(0, 200)}`);
  }
}

type Query = Record<string, string | number | undefined>;

/**
 * `draft` asks for what the editor is looking at rather than what visitors see,
 * and such an answer is never cached - it would be one editor's unsaved view
 * served to everybody.
 *
 * `fresh` is for the one question a build must not answer from cache: which
 * pages exist. Vercel keeps the fetch cache between deployments, so a story
 * added since the last build would otherwise be missing from the list and the
 * page it feeds would never be prerendered.
 */
export async function storyblokFetch<T>(
  path: string,
  { query = {}, tags = [], draft = false, fresh = false }: {
    query?: Query;
    tags?: string[];
    draft?: boolean;
    fresh?: boolean;
  } = {}
): Promise<T> {
  const token = process.env.STORYBLOK_TOKEN;
  if (!token) throw new Error("STORYBLOK_TOKEN не задан");

  const region = process.env.STORYBLOK_REGION ?? "eu";
  const host = HOSTS[region];
  if (!host) throw new Error(`STORYBLOK_REGION=${region} - такого региона нет`);

  const url = new URL(`https://${host}/v2/cdn/${path}`);
  url.searchParams.set("token", token);
  url.searchParams.set("version", draft ? "draft" : "published");
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const options = {
    ...(draft || fresh
      ? { cache: "no-store" as const }
      : {
          cache: "force-cache" as const,
          next: { revalidate: MAX_AGE, tags: [ALL, ...tags] },
        }),
  };

  for (let attempt = 1; ; attempt++) {
    const response = await fetch(url, options);

    if (response.status === 429 && attempt < RETRIES) {
      await wait(attempt * 1000);
      continue;
    }

    if (!response.ok) {
      throw new StoryblokError(response.status, path, await response.text());
    }

    return response.json() as Promise<T>;
  }
}

/** What the list endpoint gives at most in one answer, whatever is asked of it. */
const PER_PAGE = 100;

/**
 * A ceiling on the walk rather than `while (true)`: five thousand stories would
 * mean the answers had stopped telling us when they ran out, and stopping is
 * better than looping.
 */
const MAX_PAGES = 50;

/**
 * Every story of a kind, however many pages that takes.
 *
 * The list endpoint hands out a hundred at a time and says nothing about what
 * is left, so a single page looks like a complete answer. A space grown past a
 * hundred articles would quietly lose the hundred-and-first from every row on
 * the site, from the sitemap and from the prerendered paths - with no error
 * anywhere to say so. The page that comes back short is the last one, and that
 * is what ends the walk.
 */
export async function storyblokFetchAll<T>(
  path: string,
  {
    query = {},
    ...rest
  }: {
    query?: Query;
    tags?: string[];
    draft?: boolean;
    fresh?: boolean;
  } = {}
): Promise<T[]> {
  const all: T[] = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const { stories } = await storyblokFetch<{ stories: T[] }>(path, {
      ...rest,
      query: { ...query, per_page: PER_PAGE, page },
    });

    all.push(...stories);
    if (stories.length < PER_PAGE) break;
  }

  return all;
}
