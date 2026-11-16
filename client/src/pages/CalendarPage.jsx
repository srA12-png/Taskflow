import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import PageContainer from "../components/layout/PageContainer.jsx";
import Button from "../components/ui/Button.jsx";
import PlaceholderPanel from "../components/ui/PlaceholderPanel.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import TaskList from "../components/tasks/TaskList.jsx";
import { useTasks } from "../context/TasksContext.jsx";
import { useTaskDialogs } from "../hooks/useTaskDialogs.jsx";

import {
  WEEKDAY_LABELS,
  addMonths,
  buildMonthGrid,
  formatLongDate,
  formatMonthYear,
  formatWeekday,
  isSameDay,
  isToday,
  startOfMonth,
} from "../utils/date.js";

import {
  isDueToday,
  sortTasks,
} from "../utils/tasks.js";

import { cn } from "../utils/cn.js";

const PRIORITY_DOT = {
  high: "bg-danger",
  medium: "bg-warning",
  low: "bg-success",
};

export default function CalendarPage() {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState(() => new Date());
  const { tasks } = useTasks();
  const dialogs = useTaskDialogs();

  const days = useMemo(() => buildMonthGrid(cursor), [cursor]);

  const tasksByDate = useMemo(() => {
    const map = new Map();
    for (const task of tasks) {
      if (!task.dueAt) continue;
      const key = localDateKey(task.dueAt);
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(task);
    }
    return map;
  }, [tasks]);

  const undatedCount = tasks.filter((task) => !task.dueAt).length;
  const selectedKey = localDateKey(selected.toISOString());
  const selectedTasks = sortTasks(tasksByDate.get(selectedKey) ?? [], "due");

  function goToToday() {
    const now = new Date();
    setCursor(startOfMonth(now));
    setSelected(now);
  }

  function openCreateForSelected() {
    const key = localDateKey(selected.toISOString());
    if (key) dialogs.openCreate({ dueDate: key });
  }

  return (
    <PageContainer
      title="Calendar"
      description="See your deadlines in a month view. Dates use your local timezone."
      actions={
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={goToToday}>
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            Today
          </Button>
          <Button size="sm" onClick={openCreateForSelected}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add task
          </Button>
        </div>
      }
    >
      <PlaceholderPanel
        title="Task markers pending"
        phase="Phase 4"
        icon={CalendarDays}
        description="Month navigation and date selection work now. Dots and the day task list appear once tasks are loaded from the API."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="panel overflow-hidden" aria-label="Month calendar">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
            <h2 className="text-base font-semibold text-ink" aria-live="polite">
              {formatMonthYear(cursor)}
            </h2>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCursor((current) => addMonths(current, -1))}
                aria-label="Previous month"
                className="h-9 w-9"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCursor((current) => addMonths(current, 1))}
                aria-label="Next month"
                className="h-9 w-9"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          <div
            className="grid grid-cols-7 border-b border-line px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-ink-muted"
            aria-hidden="true"
          >
            {WEEKDAY_LABELS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div
            role="group"
            aria-label={`${formatMonthYear(cursor)} dates`}
            className="grid grid-cols-7 gap-1 p-2 sm:gap-1.5 sm:p-3"
          >
            {days.map((day) => {
              const key = localDateKey(day.toISOString());
              const dayTasks = tasksByDate.get(key) ?? [];
              const inMonth = day.getMonth() === cursor.getMonth();
              const selectedDay = isSameDay(day, selected);
              const today = isToday(day);

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelected(day)}
                  aria-pressed={selectedDay}
                  aria-label={`${formatLongDate(day)}${
                    dayTasks.length
                      ? `, ${dayTasks.length} task${dayTasks.length === 1 ? "" : "s"}`
                      : ""
                  }`}
                  className={cn(
                    "flex h-16 flex-col items-start rounded-lg border border-transparent p-1.5 text-left transition-colors sm:h-[86px] sm:p-2",
                    "hover:bg-surface-muted",
                    inMonth ? "text-ink" : "text-ink-muted/50",
                    selectedDay &&
                      "bg-brand-soft text-brand-strong ring-1 ring-brand/40 dark:text-brand",
                    today && !selectedDay && "border-brand/40",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-6 w-6 place-items-center rounded-full text-xs font-medium",
                      today &&
                        "bg-brand font-semibold text-white dark:text-slate-950",
                    )}
                  >
                    {day.getDate()}
                  </span>

                  {dayTasks.length > 0 ? (
                    <>
                      <span className="mt-1 flex flex-wrap gap-0.5" aria-hidden="true">
                        {dayTasks.slice(0, 3).map((task) => (
                          <span
                            key={task.id}
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              task.status === "completed"
                                ? "bg-ink-muted/50"
                                : PRIORITY_DOT[task.priority] ?? "bg-brand",
                            )}
                          />
                        ))}
                        {dayTasks.length > 3 ? (
                          <span className="text-[9px] font-medium text-ink-muted">
                            +{dayTasks.length - 3}
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-auto hidden w-full truncate text-[10px] leading-tight text-ink-muted sm:block">
                        {dayTasks[0].title}
                      </span>
                    </>
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>

        <section className="panel h-fit p-5" aria-label="Selected day tasks">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            {formatWeekday(selected)}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-ink">
              {formatLongDate(selected)}
            </h2>
            {isToday(selected) ? (
              <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-strong dark:text-brand">
                Today
              </span>
            ) : null}
          </div>

          <div className="mt-4">
            {tasks.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="No tasks yet"
                description="Add a task and give it a due date to see it here."
                className="px-2 py-6"
                action={
                  <Button variant="secondary" size="sm" onClick={openCreateForSelected}>
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Add task
                  </Button>
                }
              />
            ) : selectedTasks.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="No tasks on this day"
                description="Select another date, or add a task due on this day."
                className="px-2 py-6"
                action={
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={openCreateForSelected}
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Add task
                  </Button>
                }
              />
            ) : (
              <TaskList
                tasks={selectedTasks}
                onOpen={dialogs.openDetail}
                onToggle={dialogs.toggle}
                onRequestDelete={dialogs.requestDelete}
              />
            )}
          </div>

          {undatedCount > 0 ? (
            <p className="mt-4 border-t border-line pt-3 text-xs text-ink-muted">
              {undatedCount} task{undatedCount === 1 ? "" : "s"} without a due
              date.{" "}
              <a
                href="/tasks?due=none"
                className="font-medium text-brand-strong hover:underline dark:text-brand"
              >
                View them
              </a>
            </p>
          ) : null}
        </section>
      </div>

      {dialogs.dialogs}
    </PageContainer>
  );
}
