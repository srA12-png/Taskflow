import { useState } from "react";
import { Pencil, Plus, Tags, Trash2 } from "lucide-react";
import { useTasks } from "../../context/TasksContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { ApiError } from "../../services/api.js";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import Field from "../ui/Field.jsx";
import ConfirmDialog from "../ui/ConfirmDialog.jsx";

const DEFAULT_COLOR = "#6366F1";

export default function CategoryManager() {
  const { categories, createCategory, updateCategory, deleteCategory } = useTasks();
  const toast = useToast();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [values, setValues] = useState({
    name: "",
    color: DEFAULT_COLOR,
  });
  const [fieldError, setFieldError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function openCreate() {
    setEditing(null);
    setValues({ name: "", color: DEFAULT_COLOR });
    setFieldError(null);
    setFormError(null);
    setEditorOpen(true);
  }

  function openEdit(category) {
    setEditing(category);
    setValues({
      name: category.name,
      color: category.color,
    });
    setFieldError(null);
    setFormError(null);
    setEditorOpen(true);
  }

  async function handleSave(event) {
    event.preventDefault();
    setFormError(null);

    if (!values.name.trim()) {
      setFieldError("Category name is required");
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await updateCategory(editing.id, {
          name: values.name.trim(),
          color: values.color,
        });
        toast.success("Category updated");
      } else {
        await createCategory({
          name: values.name.trim(),
          color: values.color,
        });
        toast.success("Category created");
      }
      setEditorOpen(false);
    } catch (error) {
      if (error instanceof ApiError) {
        const fields = error.fieldErrors();
        if (fields.name) setFieldError(fields.name);
        else if (fields.color) setFieldError(fields.color);
        else setFormError(error.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const result = await deleteCategory(deleteTarget.id);
      toast.success(
        result?.movedTasks
          ? `Category deleted — ${result.movedTasks} task${
              result.movedTasks === 1 ? "" : "s"
            } moved to Uncategorized`
          : "Category deleted",
      );
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error.message ?? "Could not delete the category");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-ink">Categories</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Group tasks by area of life. Personal, Work, Study, Health and Other
            ship by default.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          New category
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-line p-4 text-sm text-ink-muted">
          <Tags className="h-4 w-4" aria-hidden="true" />
          No categories yet. Create one to group your tasks.
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-line rounded-xl border border-line">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex flex-wrap items-center gap-3 px-4 py-3"
            >
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: category.color }}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                {category.name}
              </span>
              <span className="text-xs text-ink-muted">
                {category.taskCount} task{category.taskCount === 1 ? "" : "s"}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => openEdit(category)}
                  aria-label={`Rename ${category.name}`}
                  className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted transition hover:bg-surface-muted hover:text-ink"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(category)}
                  aria-label={`Delete ${category.name}`}
                  className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted transition hover:bg-danger-soft hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editing ? "Edit category" : "New category"}
        size="sm"
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => setEditorOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" form="category-form" disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Create category"}
            </Button>
          </div>
        }
      >
        <form
          id="category-form"
          onSubmit={handleSave}
          className="space-y-4"
          noValidate
        >
          {formError ? (
            <div
              role="alert"
              className="rounded-xl border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger"
            >
              {formError}
            </div>
          ) : null}

          <Field
            id="category-name"
            label="Name"
            value={values.name}
            onChange={(event) => {
              setValues((current) => ({
                ...current,
                name: event.target.value,
              }));
              setFieldError(null);
            }}
            error={fieldError}
            maxLength={40}
            placeholder="e.g. Internship applications"
          />

          <div>
            <label
              htmlFor="category-color"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Color
            </label>
            <div className="flex items-center gap-3">
              <input
                id="category-color"
                type="color"
                value={values.color}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    color: event.target.value,
                  }))
                }
                className="h-11 w-14 cursor-pointer rounded-lg border border-line bg-surface p-1"
              />
              <span className="font-mono text-sm uppercase text-ink-muted">
                {values.color}
              </span>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete category?"
        description={
          deleteTarget
            ? `“${deleteTarget.name}” will be removed. ${
                deleteTarget.taskCount
                  ? `${deleteTarget.taskCount} task${
                      deleteTarget.taskCount === 1 ? "" : "s"
                    } will become Uncategorized — the tasks themselves are kept.`
                  : "It has no tasks attached."
              }`
            : ""
        }
        confirmLabel="Delete category"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
