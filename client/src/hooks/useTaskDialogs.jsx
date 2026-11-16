import { useCallback, useState } from "react";
import TaskForm from "../components/tasks/TaskForm.jsx";
import TaskDetail from "../components/tasks/TaskDetail.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import { useTasks } from "../context/TasksContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

/**
 * One place to drive task dialogs, used by every view so create/edit/delete
 * behave identically. Call `dialogs` once in the page's JSX.
 */
export function useTaskDialogs() {
  const { deleteTask, toggleTask } = useTasks();
  const toast = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formDefaults, setFormDefaults] = useState({});
  const [detailId, setDetailId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const openCreate = useCallback((defaults = {}) => {
    setEditingTask(null);
    setFormDefaults(defaults);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((task) => {
    setDetailId(null);
    setEditingTask(task);
    setFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditingTask(null);
    setFormDefaults({});
  }, []);

  const openDetail = useCallback((task) => setDetailId(task.id), []);
  const closeDetail = useCallback(() => setDetailId(null), []);
  const requestDelete = useCallback((task) => setDeleteTarget(task), []);
  const cancelDelete = useCallback(() => setDeleteTarget(null), []);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTask(deleteTarget.id);
      if (detailId === deleteTarget.id) setDetailId(null);
      setDeleteTarget(null);
      toast.success("Task deleted");
    } catch (error) {
      toast.error(error.message ?? "Could not delete the task");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, deleteTask, detailId, toast]);

  const toggle = useCallback(
    async (task) => {
      try {
        await toggleTask(task);
        toast.success(
          task.status === "completed" ? "Task reopened" : "Task completed",
        );
      } catch (error) {
        toast.error(error.message ?? "Could not update the task");
      }
    },
    [toggleTask, toast],
  );

  const dialogs = (
    <>
      <TaskForm
        open={formOpen}
        task={editingTask}
        defaults={formDefaults}
        onClose={closeForm}
      />
      <TaskDetail
        taskId={detailId}
        open={detailId !== null}
        onClose={closeDetail}
        onEdit={openEdit}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete task?"
        description={
          deleteTarget
            ? `“${deleteTarget.title}” will be permanently removed. This cannot be undone.`
            : ""
        }
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </>
  );

  return {
    openCreate,
    openEdit,
    openDetail,
    closeDetail,
    requestDelete,
    toggle,
    dialogs,
    detailId,
  };
}
