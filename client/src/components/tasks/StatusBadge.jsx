import { cn } from "../../utils/cn.js";

const STATUS_META = {
  pending: { label: "Pending", className: "bg-surface-muted text-ink-muted" },
  in_progress: {
    label: "In Progress",
    className: "bg-brand-soft text-brand-strong dark:text-brand",
  },
  completed: { label: "Completed", className: "bg-success-soft text-success" },
};

export default function StatusBadge({ status, className }) {
  const key = String(status ?? "").toLowerCase().replace(/[\s-]+/g, "_");
  const meta = STATUS_META[key] ?? STATUS_META.pending;

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
