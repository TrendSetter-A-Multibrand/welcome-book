import { Tag } from "@/components/ui/Tag";

/**
 * Плитка цифры: белая с рамкой 1px Sage, подпись - красный чип, значение
 * красным, под ним необязательная строка (период или источник) Sage.
 */
export function KpiTile({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <li className="flex min-h-[168px] flex-col items-start justify-between gap-4 border border-sage bg-white p-4 md:min-h-[240px] md:p-6">
      <Tag>{label}</Tag>
      <div className="flex flex-col items-start gap-2">
        <span className="t-kpi whitespace-nowrap text-red @min-[760px]:whitespace-normal">
          {value}
        </span>
        {note ? (
          <span className="font-mono text-[14px] leading-[1.2] tracking-[0.04em] text-sage uppercase md:text-[16px]">
            {note}
          </span>
        ) : null}
      </div>
    </li>
  );
}
