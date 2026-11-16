import { cn } from "../../utils/cn.js";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50";

const VARIANTS = {
  primary:
    "bg-brand text-white shadow-sm hover:bg-indigo-600 active:bg-indigo-700 dark:text-slate-950 dark:hover:bg-indigo-400",
  secondary:
    "border border-line bg-surface text-ink shadow-sm hover:bg-surface-muted",
  ghost: "text-ink-muted hover:bg-surface-muted hover:text-ink",
  danger: "bg-danger text-white shadow-sm hover:bg-red-700",
};

const SIZES = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  icon: "h-10 w-10",
};

/** Shared class builder so links can look like buttons without an extra component. */
export function buttonStyles({ variant = "primary", size = "md", className } = {}) {
  return cn(BASE, VARIANTS[variant], SIZES[size], className);
}

export default function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={buttonStyles({ variant, size, className })}
      {...props}
    >
      {children}
    </button>
  );
}
