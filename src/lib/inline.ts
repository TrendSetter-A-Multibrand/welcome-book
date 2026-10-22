/**
 * Мини-разметка внутри абзацев ответов: **жирный** и [текст](адрес).
 *
 * Редактору нужны ссылки и выделение внутри строки («бронировать в Google
 * Календаре»), но не нужен свободный HTML, которым можно сломать дизайн. Поэтому
 * текст разбирается в узлы сам и рисуется компонентом: ничего, кроме этих двух
 * конструкций, не получит никакого смысла.
 */
export type InlineNode =
  | { type: "text"; text: string }
  | { type: "bold"; text: string }
  | { type: "link"; text: string; href: string };

const TOKEN = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Куда ссылке разрешено вести: на свои разделы, почту, телефон и http(s) */
const SAFE = /^(https?:\/\/|mailto:|tel:|\/|#)/i;

export function parseInline(source: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  let last = 0;

  for (const match of source.matchAll(TOKEN)) {
    const at = match.index ?? 0;
    if (at > last) nodes.push({ type: "text", text: source.slice(last, at) });

    if (match[1] !== undefined) {
      nodes.push({ type: "bold", text: match[1] });
    } else if (SAFE.test(match[3])) {
      nodes.push({ type: "link", text: match[2], href: match[3] });
    } else {
      // Небезопасный адрес (javascript: и подобные) остаётся просто словами
      nodes.push({ type: "text", text: match[2] });
    }
    last = at + match[0].length;
  }

  if (last < source.length) nodes.push({ type: "text", text: source.slice(last) });
  return nodes;
}
