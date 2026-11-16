import { AlertTriangle } from "lucide-react";
import Modal from "./Modal.jsx";
import Button from "./Button.jsx";

export default function ConfirmDialog({
  open,
  title = "Delete this item?",
  description = "This action cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={loading ? () => {} : onCancel}
      title={title}
      size="sm"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={loading}>
            {loading ? "Working…" : confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="flex gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-danger-soft text-danger">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="text-sm leading-relaxed text-ink-muted">{description}</p>
      </div>
    </Modal>
  );
}
