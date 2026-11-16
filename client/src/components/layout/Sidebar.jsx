import { NavLink } from "react-router-dom";
import {
  CheckSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  X,
} from "lucide-react";
import { NAV_SECTIONS } from "../../utils/navigation.js";
import { useTasks } from "../../context/TasksContext.jsx";
import { isDueToday, isCompleted } from "../../utils/tasks.js";
import { cn } from "../../utils/cn.js";

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  quickAdd,
}) {
  const { tasks } = useTasks();

  const totalCount = tasks.length;
  const todayCount = tasks.filter(
    (task) => !isCompleted(task) && isDueToday(task),
  ).length;

  return (
    <aside
      id="app-sidebar"
      aria-label="Main navigation"
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-line bg-surface",
        "transition-[width,transform] duration-300 ease-out",
        "lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
        collapsed ? "w-[76px]" : "w-72",
        mobileOpen
          ? "visible translate-x-0 shadow-pop lg:shadow-none"
          : "invisible -translate-x-full lg:visible",
      )}
    >
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-line px-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
          <CheckSquare className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className={cn("min-w-0", collapsed && "lg:hidden")}>
          <p className="text-sm font-semibold tracking-tight">TaskFlow</p>
          <p className="truncate text-[11px] text-ink-muted">
            Smart task management
          </p>
        </div>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation"
          className="ml-auto grid h-9 w-9 place-items-center rounded-lg text-ink-muted transition hover:bg-surface-muted hover:text-ink lg:hidden"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Sections">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-5 last:mb-0">
            <p
              className={cn(
                "px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted",
                collapsed && "lg:sr-only",
              )}
            >
              {section.label}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                let count = null;
                if (item.to === "/tasks") {
                  count = totalCount;
                } else if (item.to === "/today") {
                  count = todayCount;
                }
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end
                      onClick={onCloseMobile}
                      aria-label={item.label}
                      title={collapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                          collapsed && "lg:justify-center lg:px-0",
                          isActive
                            ? "bg-brand-soft text-brand-strong dark:text-brand"
                            : "text-ink-muted hover:bg-surface-muted hover:text-ink",
                        )
                      }
                    >
                      <item.icon
                        className="h-[18px] w-[18px] shrink-0"
                        aria-hidden="true"
                      />
                      <span className={cn("truncate", collapsed && "lg:hidden")}>
                        {item.label}
                      </span>
                      {count != null ? (
                        <span
                          className={cn(
                            "ml-auto flex h-6 min-w-5 items-center justify-center rounded-full border border-line bg-surface px-1.5 text-[11px] font-semibold text-ink-muted",
                            collapsed && "hidden",
                          )}
                        >
                          {count}
                        </span>
                      ) : null}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-line p-3">
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          className="mt-2 hidden h-9 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium text-ink-muted transition hover:bg-surface-muted hover:text-ink lg:flex"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
          )}
          <span className={cn(collapsed && "sr-only")}>Collapse</span>
        </button>

        <button
          type="button"
          onClick={quickAdd}
          className={cn(
            "mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium text-white shadow-sm transition hover:bg-[#4f46e5] lg:hidden lg:justify-start lg:px-3 lg:py-2",
            collapsed && "lg:hidden",
          )}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {collapsed ? null : <span className="truncate">New task</span>}
        </button>
      </div>
    </aside>
  );
}
