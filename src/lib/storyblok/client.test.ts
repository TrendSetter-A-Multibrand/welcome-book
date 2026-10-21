import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ALL,
  StoryblokError,
  storyblokFetch,
  storyblokFetchAll,
  storyTag,
} from "@/lib/storyblok/client";

const answer = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

describe("storyblokFetch", () => {
  const env = { ...process.env };

  beforeEach(() => {
    process.env.STORYBLOK_TOKEN = "секрет";
    process.env.STORYBLOK_REGION = "eu";
    vi.useFakeTimers();
  });

  afterEach(() => {
    process.env = { ...env };
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  /** Читается в момент запроса, а не при импорте - иначе сервер падал бы на старте */
  it("без токена говорит, чего не хватает", async () => {
    delete process.env.STORYBLOK_TOKEN;
    await expect(storyblokFetch("stories")).rejects.toThrow("STORYBLOK_TOKEN");
  });

  it("на незнакомом регионе называет его", async () => {
    process.env.STORYBLOK_REGION = "mars";
    await expect(storyblokFetch("stories")).rejects.toThrow("mars");
  });

  it("просит опубликованное и вешает оба тега", async () => {
    const fetcher = vi.fn().mockResolvedValue(answer({ ok: true }));
    vi.stubGlobal("fetch", fetcher);

    await storyblokFetch("stories/home", { tags: [storyTag("home")] });

    const [url, options] = fetcher.mock.calls[0];
    expect(String(url)).toContain("https://api.storyblok.com/v2/cdn/stories/home");
    expect(String(url)).toContain("version=published");
    expect(options.cache).toBe("force-cache");
    expect(options.next.tags).toEqual([ALL, "storyblok:home"]);
  });

  it("черновик не кеширует вовсе", async () => {
    const fetcher = vi.fn().mockResolvedValue(answer({ ok: true }));
    vi.stubGlobal("fetch", fetcher);

    await storyblokFetch("stories/home", { draft: true });

    const [url, options] = fetcher.mock.calls[0];
    expect(String(url)).toContain("version=draft");
    expect(options.cache).toBe("no-store");
    expect(options.next).toBeUndefined();
  });

  /**
   * Из-за этого падала сборка: 26 воркеров разом упираются в лимит Storyblok,
   * и один отказ ронял весь деплой.
   */
  it("пережидает отказ за частые запросы и спрашивает снова", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(answer({ error: "rate limit" }, 429))
      .mockResolvedValueOnce(answer({ story: { id: 1 } }));
    vi.stubGlobal("fetch", fetcher);

    const pending = storyblokFetch<{ story: { id: number } }>("stories/home");
    await vi.advanceTimersByTimeAsync(1000);

    expect(await pending).toEqual({ story: { id: 1 } });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("сдаётся после трёх попыток, а не бесконечно", async () => {
    const fetcher = vi.fn().mockResolvedValue(answer({ error: "rate" }, 429));
    vi.stubGlobal("fetch", fetcher);

    const pending = storyblokFetch("stories/home");
    const caught = expect(pending).rejects.toBeInstanceOf(StoryblokError);
    await vi.advanceTimersByTimeAsync(5000);
    await caught;

    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  it("на 404 отдаёт ошибку с кодом, чтобы её можно было отличить", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(answer({}, 404)));

    await expect(storyblokFetch("stories/nope")).rejects.toMatchObject({
      status: 404,
    });
  });
});

/**
 * Ради чего это вообще есть: одна страница выглядит как полный ответ. Список
 * обрывается на сотне без ошибки и без признака, что он оборван, - и сотая с
 * лишним новость просто исчезает и из ряда, и из карты сайта, и из списка
 * страниц, которые сборка отрисовывает заранее.
 *
 * Тело Response читается один раз, поэтому каждый ответ собирается заново.
 */
describe("storyblokFetchAll", () => {
  const env = { ...process.env };

  beforeEach(() => {
    process.env.STORYBLOK_TOKEN = "секрет";
    process.env.STORYBLOK_REGION = "eu";
  });

  afterEach(() => {
    process.env = { ...env };
    vi.unstubAllGlobals();
  });

  const page = (count: number, from = 0) =>
    answer({
      stories: Array.from({ length: count }, (_, i) => ({ id: from + i })),
    });

  it("список длиннее сотни дочитывает до конца", async () => {
    const fetcher = vi
      .fn()
      .mockImplementationOnce(() => page(100))
      .mockImplementationOnce(() => page(30, 100));
    vi.stubGlobal("fetch", fetcher);

    const stories = await storyblokFetchAll<{ id: number }>("stories", {
      query: { content_type: "article" },
    });

    expect(stories).toHaveLength(130);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(String(fetcher.mock.calls[0][0])).toContain("per_page=100");
    expect(String(fetcher.mock.calls[0][0])).toContain("page=1");
    expect(String(fetcher.mock.calls[1][0])).toContain("page=2");
  });

  it("на короткой странице второй раз не спрашивает", async () => {
    const fetcher = vi.fn().mockImplementation(() => page(4));
    vi.stubGlobal("fetch", fetcher);

    expect(await storyblokFetchAll("stories")).toHaveLength(4);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("ровно сотня - идёт за второй страницей и останавливается на пустой", async () => {
    const fetcher = vi
      .fn()
      .mockImplementationOnce(() => page(100))
      .mockImplementationOnce(() => answer({ stories: [] }));
    vi.stubGlobal("fetch", fetcher);

    expect(await storyblokFetchAll("stories")).toHaveLength(100);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("упирается в предел страниц, а не крутится вечно", async () => {
    const fetcher = vi.fn().mockImplementation(() => page(100));
    vi.stubGlobal("fetch", fetcher);

    const stories = await storyblokFetchAll("stories");

    expect(fetcher).toHaveBeenCalledTimes(50);
    expect(stories).toHaveLength(5000);
  });
});
