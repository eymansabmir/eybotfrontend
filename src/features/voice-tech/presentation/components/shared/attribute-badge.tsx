import type { AttributeType } from "../../../types";

const TYPE_STYLES: Record<AttributeType, { bg: string; text: string }> = {
  string: { bg: "bg-blue-500/10", text: "text-blue-600" },
  number: { bg: "bg-emerald-500/10", text: "text-emerald-600" },
  boolean: { bg: "bg-orange-500/10", text: "text-orange-600" },
  enum: { bg: "bg-violet-500/10", text: "text-violet-600" },
  date: { bg: "bg-pink-500/10", text: "text-pink-600" },
};

interface AttributeBadgeProps {
  type: AttributeType;
}

export function AttributeBadge({ type }: AttributeBadgeProps) {
  const style = TYPE_STYLES[type] ?? TYPE_STYLES.string;
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${style.bg} ${style.text}`}
    >
      {type}
    </span>
  );
}
