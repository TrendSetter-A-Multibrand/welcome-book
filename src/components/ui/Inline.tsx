import { isExternal } from "@/lib/blok";
import { parseInline } from "@/lib/inline";

/** Строка с мини-разметкой: **жирный** и [ссылка](адрес). Ссылки подчёркнуты. */
export function Inline({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((node, index) => {
        if (node.type === "bold") {
          return (
            <strong key={index} className="font-medium text-sage">
              {node.text}
            </strong>
          );
        }
        if (node.type === "link") {
          return (
            <a
              key={index}
              href={node.href}
              {...(isExternal(node.href)
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="underline underline-offset-2 transition-colors hover:text-red"
            >
              {node.text}
            </a>
          );
        }
        return node.text;
      })}
    </>
  );
}
