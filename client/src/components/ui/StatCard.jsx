import { cn } from "../../utils/cn.js";

const TONES = {
  brand: "bg-brand-soft text-brand-strong dark:text-brand",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = "brand",
  hint,
  className,
}) {
  return (
    <article className={cn("panel p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-muted">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
            {value}
          </p>
        </div>
        {Icon ? (
          <span
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
              TONES[tone] ?? TONES.brand,
            )}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        ) : null}
      </div>
      {hint ? <p className="mt-3 text-xs text-ink-muted">{hint}</p> : null}
    </article>
  );
}
