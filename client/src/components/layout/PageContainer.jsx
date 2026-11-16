import { cn } from "../../utils/cn.js";

export default function PageContainer({
  title,
  description,
  actions,
  children,
  className,
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8",
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">
            {title}
          </h1>
          {description ? (
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-muted">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>

      <div className="mt-6 space-y-6 sm:mt-8">{children}</div>
    </div>
  );
}
