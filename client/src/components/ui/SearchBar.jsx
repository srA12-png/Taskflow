import { Search, X } from "lucide-react";
import { cn } from "../../utils/cn.js";

export default function SearchBar({
  id = "task-search",
  value,
  onChange,
  placeholder = "Search tasks…",
  label = "Search tasks",
  className,
}) {
  return (
    <div className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
        aria-hidden="true"
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-9 text-sm text-ink transition placeholder:text-ink-muted/80 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-ink-muted transition hover:bg-surface-muted hover:text-ink"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
