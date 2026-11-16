import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";
import { cn } from "../../utils/cn.js";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
  { value: "dark", label: "Dark", icon: Moon },
];

export default function ThemeToggle({ variant = "icon", className }) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  if (variant === "segmented") {
    return (
      <div
        role="group"
        aria-label="Color theme"
        className={cn(
          "inline-flex rounded-xl border border-line bg-surface p-1",
          className,
        )}
      >
        {OPTIONS.map(({ value, label, icon: Icon }) => {
          const active = theme === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              aria-pressed={active}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-soft text-brand-strong dark:text-brand"
                  : "text-ink-muted hover:bg-surface-muted hover:text-ink",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </div>
    );
  }

  const nextLabel =
    resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={nextLabel}
      title={nextLabel}
      className={cn(
        "grid h-10 w-10 place-items-center rounded-xl text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink",
        className,
      )}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-[18px] w-[18px]" aria-hidden="true" />
      ) : (
        <Moon className="h-[18px] w-[18px]" aria-hidden="true" />
      )}
    </button>
  );
}
