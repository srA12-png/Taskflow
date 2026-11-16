import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { TasksProvider } from "../../context/TasksContext.jsx";
import AppLayout from "../layout/AppLayout.jsx";

function FullPageLoader() {
  return (
    <div
      className="grid min-h-screen place-items-center bg-canvas"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3">
        <span className="h-9 w-9 animate-spin rounded-full border-2 border-line border-t-brand" />
        <p className="text-sm text-ink-muted">Loading your workspace…</p>
      </div>
    </div>
  );
}

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageLoader />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <TasksProvider>
      <Outlet />
    </TasksProvider>
  );
}

export { FullPageLoader };
