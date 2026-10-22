import { Fragment } from "react";
import type { Block } from "@/lib/storyblok/fetchStory";
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
import type { TocItem } from "@/components/blocks/TocNav";

/**
 * РЕЕСТР БЛОКОВ - единственное место, где знают все блоки сразу.
 *
 * Таблица `DRAW` говорит, какой компонент рисует каждый блок из Storyblok и как
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

/** Кнопка без адреса не должна молчать: она ведёт к первому разделу */
const START_HERE = (to: string) => (to === "#" ? `#${sectionId(0)}` : to);

/** Цвет плитки из палитры; чего в ней нет - рисуется на Paper, а не пропадает */
const valueColor = (value: unknown): ValueColor => {
  const name = text(value);
  return name && name in VALUE_COLORS ? (name as ValueColor) : "paper";
};

/** Оглавление строится из самих разделов: отдельно его никто не ведёт */
export function tocOf(doc: Block): TocItem[] {
  return nested(doc.sections).map((section, index) => ({
    id: sectionId(index),
    number: pad(index + 1),
    label: text(section.nav_label) ?? text(section.title) ?? "",
  }));
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
                <LinkGroup
                  key={group._uid}
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
              );
            case "qa_group":
              return (
                <QaGroup
                  key={group._uid}
                  number={number}
                  title={text(group.title) ?? ""}
                  items={nested(group.items).map((item) => ({
                    question: text(item.question) ?? "",
                    answer: paragraphs(item.answer),
                  }))}
                />
              );
            case "feedback_group":
              return (
                <FeedbackGroup
                  key={group._uid}
                  number={number}
                  title={text(group.title) ?? ""}
                  text={text(group.text)}
                  muted={text(group.muted)}
                  buttonLabel={text(group.button_label) ?? "Форма обратной связи"}
                  buttonHref={href(group.button_link)}
                />
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
        <DocSection
          key={section._uid}
          id={sectionId(index)}
          head={`[${pad(index + 1)} / ${text(section.nav_label) ?? text(section.title) ?? ""}]`}
          title={text(section.title)}
          lead={text(section.lead)}
        >
          {nested(section.content).map((item) => (
            <Fragment key={item._uid}>{DRAW_CONTENT[item.component]?.(item) ?? null}</Fragment>
          ))}
        </DocSection>
      ))}
    </Doc>
  ),

  final_banner: (blok) => (
    <FinalBanner
      label={text(blok.label)}
      title={text(blok.title) ?? ""}
      text={text(blok.text)}
      buttonLabel={text(blok.button_label) ?? ""}
      // Пока редактор не указал адрес, «Let's start» ведёт к началу документа
      buttonHref={START_HERE(href(blok.button_link))}
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
    <Fragment key={blok._uid}>{DRAW[blok.component]?.(blok) ?? null}</Fragment>
  ));
}
