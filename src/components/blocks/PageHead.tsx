/**
 * Шапка страницы онбординга: [метка] · заголовок с жёлтым маркером на ключевых
 * словах · вводный текст. Маркер «прорисовывается» слева направо при загрузке.
 *
 * Слова маркера - отдельное поле, а не rich text: редактор не может сломать
 * дизайн лишним форматированием, а маркер всегда один и всегда на главной мысли.
 */
export function PageHead({
  tag,
  greeting,
  before,
  highlight,
  after,
  intro,
}: {
  tag?: string;
  greeting?: string;
  before?: string;
  highlight?: string;
  after?: string;
  intro?: string;
}) {
  return (
    <section className="gutter-x flex flex-col gap-4 pb-6 pt-8 md:pb-12 md:pt-16">
      {tag || greeting ? (
        <p className="t-caption flex gap-4">
          {tag ? <span className="text-red">[{tag}]</span> : null}
          {greeting ? <span className="text-text-2">{greeting}</span> : null}
        </p>
      ) : null}

      <div className="flex flex-col gap-4 md:gap-6 toc:grid toc:grid-cols-12">
        <h1 className="t-h1 toc:col-span-7">
          {before ? <>{before} </> : null}
          {highlight ? (
            <span className="marker-draw px-2 [box-decoration-break:clone]">
              {highlight}
            </span>
          ) : null}
          {after ? <> {after}</> : null}
        </h1>
        {intro ? (
          <p className="t-body-l text-text-2 toc:col-span-4 toc:col-start-9">
            {intro}
          </p>
        ) : null}
      </div>
    </section>
  );
}
