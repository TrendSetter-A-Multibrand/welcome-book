/**
 * Красная плоскость «кто мы»: моно-акцент капсом, лид, три принципа в белых
 * рамках и примечание. Появляется при прокрутке (подъём 24px, 600 ms).
 * Колонка ≥ 640: акцент 2fr / лид 3fr, принципы три в ряд.
 */
export type Principle = { title: string; text: string };

export function OffPricePlane({
  accent,
  lead,
  principles,
  note,
}: {
  accent: string;
  lead: string;
  principles: Principle[];
  note?: string;
}) {
  return (
    <div className="rise-in flex flex-col gap-8 bg-red p-6 text-white md:gap-12 md:p-12">
      <div className="flex flex-col gap-4 @min-[640px]:grid @min-[640px]:grid-cols-[2fr_3fr] @min-[640px]:gap-12">
        <p className="t-accent">{accent}</p>
        <p className="t-body-l">{lead}</p>
      </div>

      {principles.length ? (
        <ul className="flex flex-col gap-3 @min-[640px]:grid @min-[640px]:grid-cols-3 @min-[640px]:gap-6">
          {principles.map((principle, index) => (
            <li
              key={principle.title}
              className="flex flex-col gap-2 border border-white p-4 md:p-6"
            >
              <span className="t-caption">{String(index + 1).padStart(2, "0")}</span>
              <span className="t-h4">{principle.title}</span>
              <span className="t-body">{principle.text}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {note ? <p className="t-body-s">{note}</p> : null}
    </div>
  );
}
