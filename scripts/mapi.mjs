/**
 * The management side of Storyblok, shared by the scripts that push schemas and
 * seed stories. Reading the space is the site's own business and lives in
 * src/lib/storyblok; this is only for changing it, and only from a developer's
 * machine - it wants the personal token, which never goes to Vercel.
 */
const HOSTS = {
  eu: "mapi.storyblok.com",
  us: "api-us.storyblok.com",
  ap: "api-ap.storyblok.com",
  ca: "api-ca.storyblok.com",
};

const space = process.env.STORYBLOK_SPACE_ID;
const token = process.env.STORYBLOK_PERSONAL_TOKEN;
const host = HOSTS[process.env.STORYBLOK_REGION ?? "eu"];

if (!space || !token) {
  console.error("Нужны STORYBLOK_SPACE_ID и STORYBLOK_PERSONAL_TOKEN");
  process.exit(1);
}

const wait = (ms) => new Promise((done) => setTimeout(done, ms));

/**
 * Storyblok answers six requests a second and refuses the seventh, so the calls
 * are spaced out and a refusal is waited out once rather than losing the run
 * half way through - which would leave the space half changed.
 */
export async function api(path, init = {}, second = false) {
  await wait(250);

  const response = await fetch(`https://${host}/v1/spaces/${space}${path}`, {
    ...init,
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  const text = await response.text();

  if (response.status === 429 && !second) {
    await wait(2000);
    return api(path, init, true);
  }
  if (!response.ok) {
    throw new Error(
      `${init.method ?? "GET"} ${path} -> ${response.status}\n${text.slice(0, 400)}`
    );
  }
  return text ? JSON.parse(text) : null;
}

/** Every block in a story needs an id of its own. */
export const block = (component, fields) => ({
  _uid: crypto.randomUUID(),
  component,
  ...fields,
});

/**
 * A folder for stories to sit in, so that their paths read the way the site's do
 * - company/about rather than company-about.
 */
export async function folder(slug, name) {
  const { stories } = await api(`/stories?with_slug=${slug}`);
  if (stories[0]) return stories[0].id;

  const { story } = await api("/stories", {
    method: "POST",
    body: JSON.stringify({ story: { name, slug, is_folder: true } }),
  });
  return story.id;
}

/**
 * Writes a story at a path, published, whether or not it is already there.
 * Matching by path rather than by id keeps the scripts re-runnable.
 *
 * `slug` is the last part of the path and `parent` the folder it sits in, which
 * is how Storyblok holds it; `path` is the whole thing, which is how the site
 * asks for it.
 */
export async function putStory(slug, name, content, parent = 0, path = slug) {
  const { stories } = await api(`/stories?with_slug=${path}`);
  const existing = stories[0];

  if (existing) {
    await api(`/stories/${existing.id}`, {
      method: "PUT",
      body: JSON.stringify({
        story: { name, slug, content, parent_id: parent },
        publish: 1,
      }),
    });
    return "обновлена";
  }

  await api("/stories", {
    method: "POST",
    body: JSON.stringify({
      story: { name, slug, content_type: "page", content, parent_id: parent },
      publish: 1,
    }),
  });
  return "создана";
}
