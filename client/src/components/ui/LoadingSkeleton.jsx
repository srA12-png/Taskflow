import { cn } from "../../utils/cn.js";

/** Single shimmering block used to build skeletons. */
export function Skeleton({ className }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-surface-muted",
        className,
      )}
    />
  );
}

/** List skeleton for task views while data is loading. */
export default function LoadingSkeleton({ rows = 4, className }) {
  return (
    <div
      className={cn("space-y-3", className)}
      role="status"
      aria-live="polite"
      aria-label="Loading tasks"
    >
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4"
        >
          <Skeleton className="h-5 w-5 shrink-0 rounded-md" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
          <Skeleton className="hidden h-6 w-20 rounded-full sm:block" />
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
