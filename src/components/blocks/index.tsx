import { Fragment } from "react";
import type { Block } from "@/lib/storyblok/fetchStory";
import { editableAttrs } from "@/lib/storyblok/editable";
import { href, image, nested, paragraphs, text } from "@/lib/blok";
import { PageHead } from "@/components/blocks/PageHead";
import { Doc } from "@/components/blocks/Doc";
import { DocSection } from "@/components/blocks/DocSection";
import { CeoLetter } from "@/components/blocks/CeoLetter";
import { OffPricePlane } from "@/components/blocks/OffPricePlane";
import { ValuesGroup } from "@/components/blocks/ValuesGroup";
import { VALUE_COLORS, type ValueColor } from "@/components/blocks/ValueTile";
import { KpiGroup } from "@/components/blocks/KpiGroup";
import { TimelineGroup } from "@/components/blocks/TimelineGroup";
import { BrandsGroup } from "@/components/blocks/BrandsGroup";
import { StepsGroup } from "@/components/blocks/StepsGroup";
import { ResourcesFrame } from "@/components/blocks/ResourcesFrame";
import { LinkGroup } from "@/components/blocks/LinkGroup";
import { QaGroup } from "@/components/blocks/QaGroup";
import { FeedbackGroup } from "@/components/blocks/FeedbackGroup";
import { FinalBanner } from "@/components/blocks/FinalBanner";
import { AnswerText } from "@/components/blocks/AnswerText";
import { AnswerHeading } from "@/components/blocks/AnswerHeading";
import { AnswerList } from "@/components/blocks/AnswerList";
import { AnswerNote } from "@/components/blocks/AnswerNote";
import { AnswerFacts } from "@/components/blocks/AnswerFacts";
import { AnswerContacts } from "@/components/blocks/AnswerContacts";
import { AnswerPlace } from "@/components/blocks/AnswerPlace";
import { AnswerImage, isRatio } from "@/components/blocks/AnswerImage";
import { AnswerButton } from "@/components/blocks/AnswerButton";
import type { TocItem } from "@/components/blocks/TocNav";

/**
 * РЕЕСТР БЛОКОВ - единственное место, где знают все блоки сразу.
 *
 * Таблицы `DRAW*` говорят, какой компонент рисует каждый блок из Storyblok и как
 * поля блока становятся его свойствами. Сами компоненты о Storyblok ничего не
 * знают: они берут готовые свойства, поэтому их можно тестировать без CMS и
 * перенести без неё.
 *
 * Имя ключа = технический код компонента в Storyblok (storyblok/components.json).
 */

const pad = (n: number) => String(n).padStart(2, "0");

/** Сколько номеров занимает группа: «01–02» - это span 2 */
const span = (value: unknown) => {
  const n = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(n) && n > 1 ? n : 1;
};

/** «01» или «01–02», когда группа занимает несколько номеров подряд */
const range = (from: number, count: number) =>
  count > 1 ? `${pad(from)}–${pad(from + count - 1)}` : pad(from);

const sectionId = (index: number) => `section-${index + 1}`;

/** Цвет плитки из палитры; чего в ней нет - рисуется на Paper, а не пропадает */
const valueColor = (value: unknown): ValueColor => {
  const name = text(value);
  return name && name in VALUE_COLORS ? (name as ValueColor) : "paper";
};

/**
 * В Visual Editor блок оборачивается в элемент с атрибутами Bridge: клик по нему
 * открывает его поля. У опубликованной версии атрибутов нет, и тогда разметка
 * остаётся такой, какой её нарисовали, без лишних оболочек.
 */
function editable(blok: Block, node: React.ReactNode) {
  const attrs = editableAttrs(blok);
  return attrs ? <div {...attrs}>{node}</div> : node;
}

/** Оглавление строится из самих разделов: отдельно его никто не ведёт */
export function tocOf(doc: Block): TocItem[] {
  return nested(doc.sections).map((section, index) => ({
    id: sectionId(index),
    number: pad(index + 1),
    label: text(section.nav_label) ?? text(section.title) ?? "",
  }));
}

/**
 * Блоки внутри ответа аккордеона: набор из конструктора статьи макета (текст,
 * подзаголовок, список, врезка, факты, контакты, «как добраться», фото, кнопка).
 */
const DRAW_ANSWER: Record<string, (blok: Block) => React.ReactNode> = {
  answer_text: (blok) => <AnswerText paragraphs={paragraphs(blok.text)} />,

  answer_heading: (blok) => <AnswerHeading text={text(blok.text) ?? ""} />,

  answer_list: (blok) => (
    <AnswerList
      numbered={text(blok.style) === "numbered"}
      items={lines(blok.items)}
    />
  ),

  answer_note: (blok) => (
    <AnswerNote label={text(blok.label) ?? "Справка"} text={text(blok.text) ?? ""} />
  ),

  answer_facts: (blok) => (
    <AnswerFacts
      items={nested(blok.items).map((item) => ({
        label: text(item.label) ?? "",
        value: text(item.value) ?? "",
      }))}
    />
  ),

  answer_contacts: (blok) => (
    <AnswerContacts
      items={nested(blok.items).map((item) => ({
        label: text(item.label) ?? "",
        lines: lines(item.lines),
      }))}
    />
  ),

  answer_place: (blok) => (
    <AnswerPlace
      label={text(blok.label) ?? "Как добраться"}
      place={text(blok.place) ?? ""}
      address={text(blok.address)}
      buttonLabel={text(blok.button_label) ?? "Построить маршрут"}
      buttonHref={href(blok.button_link)}
    />
  ),

  answer_image: (blok) => {
    const photo = image(blok.image);
    if (!photo) return null;
    return (
      <AnswerImage
        src={photo.src}
        alt={photo.alt}
        ratio={isRatio(text(blok.ratio)) ? (text(blok.ratio) as "4:3") : "4:3"}
        caption={text(blok.caption)}
      />
    );
  },

  answer_button: (blok) => (
    <AnswerButton label={text(blok.label) ?? ""} href={href(blok.link)} />
  ),
};

/** Одна строка поля - один пункт */
const lines = (value: unknown) =>
  (text(value) ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

/**
 * Ответ на вопрос целиком: абзацы из поля «Ответ» и следом блоки по порядку.
 * Нет ни того, ни другого - null, и пункт аккордеона остаётся строкой без «+».
 */
function renderAnswer(item: Block): React.ReactNode {
  const intro = paragraphs(item.answer);
  const blocks = nested(item.blocks).filter((blok) => blok.component in DRAW_ANSWER);
  if (!intro.length && !blocks.length) return null;

  return (
    <>
      {intro.length ? <AnswerText paragraphs={intro} /> : null}
      {blocks.map((blok) => (
        <Fragment key={blok._uid}>{editable(blok, DRAW_ANSWER[blok.component](blok))}</Fragment>
      ))}
    </>
  );
}

/** Блоки внутри раздела документа */
const DRAW_CONTENT: Record<string, (blok: Block) => React.ReactNode> = {
  ceo_letter: (blok) => (
    <CeoLetter
      quote={text(blok.quote) ?? ""}
      name={text(blok.name) ?? ""}
      role={text(blok.role)}
      photo={image(blok.photo)}
    />
  ),

  off_price_plane: (blok) => (
    <OffPricePlane
      accent={text(blok.accent) ?? ""}
      lead={text(blok.lead) ?? ""}
      note={text(blok.note)}
      principles={nested(blok.principles).map((item) => ({
        title: text(item.title) ?? "",
        text: text(item.text) ?? "",
      }))}
    />
  ),

  values_group: (blok) => (
    <ValuesGroup
      title={text(blok.title) ?? ""}
      items={nested(blok.items).map((item) => ({
        title: text(item.title) ?? "",
        text: text(item.text),
        color: valueColor(item.color),
        icon: text(item.icon),
      }))}
    />
  ),

  kpi_group: (blok) => (
    <KpiGroup
      title={text(blok.title) ?? ""}
      items={nested(blok.items).map((item) => ({
        label: text(item.label) ?? "",
        value: text(item.value) ?? "",
        note: text(item.note),
      }))}
    />
  ),

  timeline_group: (blok) => (
    <TimelineGroup
      title={text(blok.title) ?? ""}
      items={nested(blok.items).map((item) => ({
        year: text(item.year) ?? "",
        text: text(item.text) ?? "",
      }))}
    />
  ),

  brands_group: (blok) => (
    <BrandsGroup
      title={text(blok.title) ?? ""}
      items={nested(blok.items).map((item) => ({
        name: text(item.name) ?? "",
        logo: image(item.logo),
      }))}
    />
  ),

  steps_group: (blok) => (
    <StepsGroup
      items={nested(blok.items).map((item) => ({
        title: text(item.title) ?? "",
        icon: text(item.icon),
      }))}
    />
  ),

  // Группы рамки нумеруются сквозь: одна группа может занять два номера
  // («01–02»), и следующая тогда начнётся с 03.
  resources_frame: (blok) => {
    let next = 1;
    return (
      <ResourcesFrame title={text(blok.title)}>
        {nested(blok.groups).map((group) => {
          const count = span(group.number_span);
          const number = range(next, count);
          next += count;

          switch (group.component) {
            case "link_group":
              return (
                <Fragment key={group._uid}>
                  {editable(
                    group,
                    <LinkGroup
                      number={number}
                      title={text(group.title) ?? ""}
                      links={nested(group.links).map((link) => ({
                        kind: text(link.kind) ?? "Сайт",
                        title: text(link.title) ?? "",
                        text: text(link.text),
                        action: text(link.action),
                        href: href(link.link),
                      }))}
                    />
                  )}
                </Fragment>
              );
            case "qa_group":
              return (
                <Fragment key={group._uid}>
                  {editable(
                    group,
                    <QaGroup
                      number={number}
                      title={text(group.title) ?? ""}
                      items={nested(group.items).map((item) => ({
                        question: text(item.question) ?? "",
                        answer: renderAnswer(item),
                      }))}
                    />
                  )}
                </Fragment>
              );
            case "feedback_group":
              return (
                <Fragment key={group._uid}>
                  {editable(
                    group,
                    <FeedbackGroup
                      number={number}
                      title={text(group.title) ?? ""}
                      text={text(group.text)}
                      muted={text(group.muted)}
                      buttonLabel={text(group.button_label) ?? "Форма обратной связи"}
                      buttonHref={href(group.button_link)}
                    />
                  )}
                </Fragment>
              );
            default:
              return null;
          }
        })}
      </ResourcesFrame>
    );
  },
};

/** Блоки верхнего уровня страницы (между шапкой и подвалом) */
const DRAW: Record<string, (blok: Block) => React.ReactNode> = {
  page_head: (blok) => (
    <PageHead
      tag={text(blok.tag)}
      greeting={text(blok.greeting)}
      before={text(blok.title_before)}
      highlight={text(blok.title_highlight)}
      after={text(blok.title_after)}
      intro={text(blok.intro)}
    />
  ),

  doc: (blok) => (
    <Doc toc={tocOf(blok)}>
      {nested(blok.sections).map((section, index) => (
        <Fragment key={section._uid}>
          {editable(
            section,
            <DocSection
              id={sectionId(index)}
              head={`[${pad(index + 1)} / ${text(section.nav_label) ?? text(section.title) ?? ""}]`}
              title={text(section.title)}
              lead={text(section.lead)}
            >
              {nested(section.content).map((item) => (
                <Fragment key={item._uid}>
                  {editable(item, DRAW_CONTENT[item.component]?.(item) ?? null)}
                </Fragment>
              ))}
            </DocSection>
          )}
        </Fragment>
      ))}
    </Doc>
  ),

  final_banner: (blok) => (
    <FinalBanner
      label={text(blok.label)}
      title={text(blok.title) ?? ""}
      text={text(blok.text)}
      buttonLabel={text(blok.button_label)}
      buttonHref={href(blok.button_link)}
    />
  ),
};

/**
 * Рисует блоки верхнего уровня по порядку. Блок, которого нет в таблице, молча
 * пропускается: пусть редактор, добавивший новый тип раньше кода, увидит страницу
 * без него, а не белый экран.
 */
export function renderBlocks(bloks: Block[]) {
  return bloks.map((blok) => (
    <Fragment key={blok._uid}>{editable(blok, DRAW[blok.component]?.(blok) ?? null)}</Fragment>
  ));
}
