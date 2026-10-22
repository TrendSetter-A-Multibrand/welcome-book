import { Tag } from "@/components/ui/Tag";

/**
 * Плитка цифры: белая с рамкой 1px Sage, подпись - тёмный чип, значение
 * красным, под ним необязательный второй чип (период или источник).
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
        {note ? <Tag>{note}</Tag> : null}
      </div>
    </li>
  );
}
