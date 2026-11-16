import { cn } from "../../utils/cn.js";

export default function Field({
  id,
  label,
  type = "text",
  hint,
  error,
  className,
  ...props
}) {
  const describedBy = error
    ? `${id}-error`
    : hint
      ? `${id}-hint`
      : undefined;

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-ink"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
        className={cn(
          "h-11 w-full rounded-xl border bg-surface px-3 text-sm text-ink transition",
          "placeholder:text-ink-muted/70 focus:outline-none focus:ring-2",
          error
            ? "border-danger focus:border-danger focus:ring-danger/25"
            : "border-line focus:border-brand focus:ring-brand/25",
        )}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
