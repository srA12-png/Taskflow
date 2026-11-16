import { Inbox } from "lucide-react";
import { cn } from "../../utils/cn.js";

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl px-6 py-12 text-center",
        className,
      )}
    >
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-surface-muted text-ink-muted">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-sm font-semibold text-ink">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-muted">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
