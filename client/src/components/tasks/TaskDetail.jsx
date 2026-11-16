import { useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Pencil,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useTasks } from "../../context/TasksContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { formatDateTime, formatDueLabel } from "../../utils/tasks.js";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import PriorityBadge from "./PriorityBadge.jsx";
import StatusBadge from "./StatusBadge.jsx";
import CategoryBadge from "./CategoryBadge.jsx";
import { cn } from "../../utils/cn.js";

export default function TaskDetail({ taskId, open, onClose, onEdit }) {
  const { tasks, toggleTask, deleteTask } = useTasks();
  const toast = useToast();
  const task = tasks.find((item) => item.id === taskId) ?? null;

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!task) return null;

  const due = formatDueLabel(task.dueAt);
  const completed = task.status === "completed";

  async function handleToggle() {
    setBusy(true);
    try {
      await toggleTask(task);
      toast.success(completed ? "Task reopened" : "Task completed");
    } catch (error) {
      toast.error(error.message ?? "Could not update the task");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await deleteTask(task.id);
      toast.success("Task deleted");
      setConfirmDelete(false);
      onClose();
    } catch (error) {
      toast.error(error.message ?? "Could not delete the task");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={task.title}
      description={task.category ? undefined : "Uncategorized"}
      footer={
        confirmDelete ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-ink-muted">
              Delete this task permanently?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setConfirmDelete(false)}
                disabled={busy}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete} disabled={busy}>
                {busy ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button
              variant="ghost"
              onClick={() => setConfirmDelete(true)}
              className="text-danger hover:bg-danger-soft hover:text-danger"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => onEdit(task)}>
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Edit
              </Button>
              <Button onClick={handleToggle} disabled={busy}>
                {completed ? (
                  <>
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Reopen
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Complete
                  </>
                )}
              </Button>
            </div>
          </div>
        )
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
          {task.category ? (
            <CategoryBadge
              name={task.category.name}
              color={task.category.color}
            />
          ) : null}
        </div>

        <p
          className={cn(
            "whitespace-pre-wrap text-sm leading-relaxed",
            task.description ? "text-ink" : "italic text-ink-muted",
          )}
        >
          {task.description || "No description added."}
        </p>

        <dl className="grid gap-3 rounded-xl border border-line bg-surface-muted/40 p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">
              Due
            </dt>
            <dd
              className={cn(
                "mt-1 flex items-center gap-1.5",
                due.tone === "past" || (due.tone === "today" && !completed)
                  ? "text-danger"
                  : "text-ink",
              )}
            >
              <CalendarClock className="h-4 w-4" aria-hidden="true" />
              {due.label}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">
              Completed
            </dt>
            <dd className="mt-1 text-ink">
              {task.completedAt ? formatDateTime(task.completedAt) : "Not yet"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">
              Created
            </dt>
            <dd className="mt-1 text-ink">{formatDateTime(task.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">
              Last updated
            </dt>
            <dd className="mt-1 text-ink">{formatDateTime(task.updatedAt)}</dd>
          </div>
        </dl>
      </div>
    </Modal>
  );
}
