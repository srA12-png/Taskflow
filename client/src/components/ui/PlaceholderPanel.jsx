import { cn } from "../../utils/cn.js";

/**
 * Visually marked placeholder for UI that is intentionally not connected yet.
 * Dashed border + "Phase" tag make it impossible to mistake for live data.
 */
export default function PlaceholderPanel({
  title,
  description,
  phase,
  icon: Icon,
  className,
  children,
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-dashed border-line bg-surface/70 p-5 sm:p-6",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {Icon ? (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-muted text-ink-muted">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-ink">{title}</h2>
            {phase ? (
              <span className="rounded-full border border-line bg-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                {phase}
              </span>
            ) : null}
          </div>
          {description ? (
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}
