import { cn } from "../../utils/cn.js";

const PRIORITY_META = {
  low: { label: "Low", className: "bg-success-soft text-success" },
  medium: { label: "Medium", className: "bg-warning-soft text-warning" },
  high: { label: "High", className: "bg-danger-soft text-danger" },
};

export default function PriorityBadge({ priority, className }) {
  const key = String(priority ?? "").toLowerCase();
  const meta = PRIORITY_META[key] ?? {
    label: "Unset",
    className: "bg-surface-muted text-ink-muted",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        meta.className,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {meta.label}
    </span>
  );
}
