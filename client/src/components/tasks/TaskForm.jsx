import { useEffect, useState } from "react";
import { useTasks } from "../../context/TasksContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { combineDueDateTime, toDateInput, toTimeInput } from "../../utils/tasks.js";
import { ApiError } from "../../services/api.js";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import Select from "../ui/Select.jsx";
import Field from "../ui/Field.jsx";

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

function buildInitialValues(task, defaults) {
  if (task) {
    return {
      title: task.title,
      description: task.description ?? "",
      priority: task.priority,
      status: task.status,
      categoryId: task.category?.id ? String(task.category.id) : "none",
      dueDate: toDateInput(task.dueAt),
      dueTime: toTimeInput(task.dueAt),
    };
  }
  return {
    title: "",
    description: "",
    priority: defaults.priority ?? "medium",
    status: defaults.status ?? "pending",
    categoryId: defaults.categoryId ? String(defaults.categoryId) : "none",
    dueDate: defaults.dueDate ?? "",
    dueTime: "",
  };
}

export default function TaskForm({ open, onClose, task = null, defaults = {} }) {
  const { categories, createTask, updateTask } = useTasks();
  const toast = useToast();
  const isEdit = Boolean(task);

  const [values, setValues] = useState(() => buildInitialValues(task, defaults));
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const defaultsKey = JSON.stringify(defaults);

  // Reset each time the dialog opens (or switches to another task).
  useEffect(() => {
    if (!open) return;
    setValues(buildInitialValues(task, JSON.parse(defaultsKey)));
    setFieldErrors({});
    setFormError(null);
    setDirty(false);
    setConfirmDiscard(false);
    setSubmitting(false);
  }, [open, task, defaultsKey]);

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setDirty(true);
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate() {
    const errors = {};
    if (!values.title.trim()) errors.title = "Title is required";
    else if (values.title.trim().length > 200) {
      errors.title = "Title must be at most 200 characters";
    }
    if (values.description.length > 2000) {
      errors.description = "Description must be at most 2000 characters";
    }
    if (values.dueTime && !values.dueDate) {
      errors.dueDate = "Pick a date before adding a time";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;

    const payload = {
      title: values.title.trim(),
      description: values.description.trim() || null,
      priority: values.priority,
      status: values.status,
      categoryId: values.categoryId === "none" ? null : Number(values.categoryId),
      dueAt: combineDueDateTime(values.dueDate, values.dueTime),
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        await updateTask(task.id, payload);
        toast.success("Task updated");
      } else {
        await createTask(payload);
        toast.success("Task created");
      }
      setDirty(false);
      onClose();
    } catch (error) {
      if (error instanceof ApiError) {
        const serverFields = error.fieldErrors();
        if (serverFields.dueAt) {
          serverFields.dueDate = serverFields.dueAt;
          delete serverFields.dueAt;
        }
        if (Object.keys(serverFields).length > 0) {
          setFieldErrors(serverFields);
        } else {
          setFormError(error.message);
        }
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function requestClose() {
    if (submitting) return;
    if (dirty) {
      setConfirmDiscard(true);
      return;
    }
    onClose();
  }

  const categoryOptions = [
    { value: "none", label: "No category" },
    ...categories.map((category) => ({
      value: String(category.id),
      label: category.name,
    })),
  ];

  return (
    <Modal
      open={open}
      onClose={requestClose}
      title={isEdit ? "Edit task" : "New task"}
      description={
        isEdit
          ? "Update the details and save your changes."
          : "Capture what needs to happen. You can refine it later."
      }
      footer={
        confirmDiscard ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-ink-muted">
              You have unsaved changes. Discard them?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setConfirmDiscard(false)}
              >
                Keep editing
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setConfirmDiscard(false);
                  setDirty(false);
                  onClose();
                }}
              >
                Discard
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={requestClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" form="task-form" disabled={submitting}>
              {submitting
                ? "Saving…"
                : isEdit
                  ? "Save changes"
                  : "Create task"}
            </Button>
          </div>
        )
      }
    >
      <form id="task-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        {formError ? (
          <div
            role="alert"
            className="rounded-xl border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger"
          >
            {formError}
          </div>
        ) : null}

        <Field
          id="task-title"
          label="Title"
          value={values.title}
          onChange={(event) => update("title", event.target.value)}
          placeholder="e.g. Finish physics assignment"
          error={fieldErrors.title}
          maxLength={200}
          required
          data-autofocus
        />

        <div>
          <label
            htmlFor="task-description"
            className="mb-1.5 block text-sm font-medium text-ink"
          >
            Description <span className="font-normal text-ink-muted">(optional)</span>
          </label>
          <textarea
            id="task-description"
            value={values.description}
            onChange={(event) => update("description", event.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Add context, links or acceptance criteria…"
            aria-invalid={fieldErrors.description ? "true" : undefined}
            aria-describedby={
              fieldErrors.description ? "task-description-error" : undefined
            }
            className="w-full resize-y rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink transition placeholder:text-ink-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
          />
          {fieldErrors.description ? (
            <p
              id="task-description-error"
              className="mt-1.5 text-xs font-medium text-danger"
            >
              {fieldErrors.description}
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            id="task-priority"
            label="Priority"
            hideLabel={false}
            value={values.priority}
            onChange={(value) => update("priority", value)}
            options={PRIORITIES}
          />
          <Select
            id="task-status"
            label="Status"
            hideLabel={false}
            value={values.status}
            onChange={(value) => update("status", value)}
            options={STATUSES}
          />
        </div>

        <Select
          id="task-category"
          label="Category"
          hideLabel={false}
          value={values.categoryId}
          onChange={(value) => update("categoryId", value)}
          options={categoryOptions}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="task-due-date"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Due date <span className="font-normal text-ink-muted">(optional)</span>
            </label>
            <input
              id="task-due-date"
              type="date"
              value={values.dueDate}
              onChange={(event) => update("dueDate", event.target.value)}
              aria-invalid={fieldErrors.dueDate ? "true" : undefined}
              aria-describedby={fieldErrors.dueDate ? "task-due-error" : undefined}
              className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
            />
            {fieldErrors.dueDate ? (
              <p
                id="task-due-error"
                className="mt-1.5 text-xs font-medium text-danger"
              >
                {fieldErrors.dueDate}
              </p>
            ) : null}
          </div>
          <div>
            <label
              htmlFor="task-due-time"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Due time <span className="font-normal text-ink-muted">(optional)</span>
            </label>
            <input
              id="task-due-time"
              type="time"
              value={values.dueTime}
              onChange={(event) => update("dueTime", event.target.value)}
              className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
            />
          </div>
        </div>
        <p className="text-xs text-ink-muted">
          A date without a time is treated as end of that day in your local
          timezone.
        </p>
      </form>
    </Modal>
  );
}
