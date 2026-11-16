import { cn } from "../../utils/cn.js";

/**
 * Category colour comes from the database (user-defined), so it is applied
 * inline as a dot rather than as text colour — that keeps contrast readable
 * in both themes while still making categories easy to scan.
 */
export default function CategoryBadge({ name, color, className }) {
  if (!name) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2 py-0.5 text-xs font-medium text-ink-muted",
        className,
      )}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color || "#64748b" }}
        aria-hidden="true"
      />
      {name}
    </span>
  );
}
