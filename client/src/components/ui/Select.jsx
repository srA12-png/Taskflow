import { cn } from "../../utils/cn.js";

export default function Select({
  id,
  label,
  value,
  onChange,
  options,
  className,
  hideLabel = true,
}) {
  return (
    <div className={cn("relative", className)}>
      <label
        htmlFor={id}
        className={hideLabel ? "sr-only" : "mb-1.5 block text-sm font-medium text-ink"}
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full appearance-none rounded-xl border border-line bg-surface pl-3 pr-8 text-sm font-medium text-ink transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
