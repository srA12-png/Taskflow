import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";
import ProtectedRoute, {
  FullPageLoader,
} from "./components/auth/ProtectedRoute.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import TasksPage from "./pages/TasksPage.jsx";
import TaskViewPage from "./pages/TaskViewPage.jsx";
import CalendarPage from "./pages/CalendarPage.jsx";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <FullPageLoader />;

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? <Navigate to={'/dashboard'} replace /> : <LoginPage />
        }
      />
      <Route
        path="/register"
        element={
          user ? <Navigate to={'/dashboard'} replace /> : <RegisterPage />
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/today" element={<TaskViewPage view="today" />} />
          <Route path="/upcoming" element={<TaskViewPage view="upcoming" />} />
          <Route path="/completed" element={<TaskViewPage view="completed" />} />
          <Route path="/important" element={<TaskViewPage view="important" />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
