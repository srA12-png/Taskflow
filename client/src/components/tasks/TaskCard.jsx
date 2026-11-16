import { Check, Trash2 } from "lucide-react";
import { formatDueLabel, isOverdue } from "../../utils/tasks.js";
import PriorityBadge from "./PriorityBadge.jsx";
import StatusBadge from "./StatusBadge.jsx";
import CategoryBadge from "./CategoryBadge.jsx";
import { cn } from "../../utils/cn.js";

const DUE_TONE = {
  past: "text-danger",
  today: "text-brand-strong dark:text-brand",
  soon: "text-warning",
  future: "text-ink-muted",
  muted: "text-ink-muted",
};

export default function TaskCard({
  task,
  onOpen,
  onToggle,
  onRequestDelete,
  showStatus = true,
}) {
  const completed = task.status === "completed";
  const due = formatDueLabel(task.dueAt);
  const overdue = isOverdue(task);

  return (
    <article className="group flex items-start gap-3 rounded-xl border border-line bg-surface p-3 transition hover:border-brand/30 hover:shadow-sm sm:p-4">
      <button
        type="button"
        onClick={() => onToggle(task)}
        aria-label={completed ? `Mark “${task.title}” as pending` : `Mark “${task.title}” as completed`}
        aria-pressed={completed}
        className={cn(
          "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition",
          completed
            ? "border-success bg-success text-white"
            : "border-line bg-surface text-transparent hover:border-brand hover:text-brand/40",
        )}
      >
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={() => onOpen(task)}
          className="block w-full rounded text-left"
        >
          <h3
            className={cn(
              "truncate text-sm font-medium text-ink",
              completed && "text-ink-muted line-through",
            )}
          >
            {task.title}
          </h3>
          {task.description ? (
            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-ink-muted">
              {task.description}
            </p>
          ) : null}
        </button>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <PriorityBadge priority={task.priority} />
          {showStatus ? <StatusBadge status={task.status} /> : null}
          {task.category ? (
            <CategoryBadge name={task.category.name} color={task.category.color} />
          ) : null}
          <span
            className={cn(
              "ml-auto text-[11px] font-medium",
              overdue ? "text-danger" : DUE_TONE[due.tone],
            )}
          >
            {overdue ? "Overdue · " : ""}
            {due.label}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onRequestDelete(task)}
        aria-label={`Delete “${task.title}”`}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-muted opacity-0 transition hover:bg-danger-soft hover:text-danger focus-visible:opacity-100 group-hover:opacity-100"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </article>
  );
}
