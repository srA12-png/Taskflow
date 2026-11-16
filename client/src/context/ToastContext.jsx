import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "../utils/cn.js";

const ToastContext = createContext(null);

const VARIANTS = {
  success: {
    icon: CheckCircle2,
    className: "border-success/30 bg-success-soft text-success",
  },
  error: {
    icon: AlertTriangle,
    className: "border-danger/30 bg-danger-soft text-danger",
  },
  info: {
    icon: Info,
    className: "border-line bg-surface text-ink",
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (message, variant = "success", options = {}) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const duration = options.duration ?? 4000;
      setToasts((current) => [...current.slice(-3), { id, message, variant }]);
      window.setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({
      success: (message, options) => push(message, "success", options),
      error: (message, options) => push(message, "error", options),
      info: (message, options) => push(message, "info", options),
      dismiss,
    }),
    [push, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[80] flex flex-col items-center gap-2 p-4 sm:items-end"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((toast) => {
          const variant = VARIANTS[toast.variant] ?? VARIANTS.info;
          const Icon = variant.icon;
          return (
            <div
              key={toast.id}
              role="status"
              className={cn(
                "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-pop",
                variant.className,
              )}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p className="flex-1 leading-relaxed">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="rounded-md p-0.5 opacity-70 transition hover:opacity-100"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside a ToastProvider");
  return context;
}
