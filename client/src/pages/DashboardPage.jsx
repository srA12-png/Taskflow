import { Link } from "react-router-dom";
import {
  AlertTriangle,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Clock3,
  ListTodo,
  Plus,
  RefreshCw,
} from "lucide-react";
import PageContainer from "../components/layout/PageContainer.jsx";
import Button from "../components/ui/Button.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { Skeleton } from "../components/ui/LoadingSkeleton.jsx";
import TaskList from "../components/tasks/TaskList.jsx";
import {
  CompletionsBarChart,
  PriorityPieChart,
} from "../components/analytics/AnalyticsChart.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useTasks } from "../context/TasksContext.jsx";
import { useAnalytics } from "../hooks/useAnalytics.js";
import { useTaskDialogs } from "../hooks/useTaskDialogs.jsx";
import { formatLongDate, getGreeting } from "../utils/date.js";
import {
  formatDueLabel,
  isCompleted,
  sortTasks,
  withinNextDays,
} from "../utils/tasks.js";

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    tasks,
    loading,
    error: tasksError,
    refresh: refreshTasks,
  } = useTasks();
  const {
    summary,
    completions,
    loading: analyticsLoading,
    error: analyticsError,
    refresh: refreshAnalytics,
  } = useAnalytics();
  const dialogs = useTaskDialogs();

  const now = new Date();
  const firstName = user?.name?.split(" ")[0] ?? "there";

  const recentTasks = sortTasks(tasks, "newest").slice(0, 4);
  const upcomingTasks = tasks
    .filter((task) => !isCompleted(task) && withinNextDays(task, 7))
    .sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt))
    .slice(0, 4);

  const statValue = (value) =>
    analyticsLoading || analyticsError ? "—" : (value ?? 0);
  const taskHint = (value, label) =>
    analyticsLoading ? "Loading…" : analyticsError ? "Unavailable" : `${value} ${label}`;

  return (
    <PageContainer
      title={`${getGreeting(now)}, ${firstName}`}
      description={`${formatLongDate(now)} · Here is where your work stands today.`}
      actions={
        <Button onClick={() => dialogs.openCreate()}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Quick add task
        </Button>
      }
    >
      <section aria-label="Task summary">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total tasks"
            value={statValue(summary?.total)}
            icon={ListTodo}
            tone="brand"
            hint={taskHint(summary?.dueToday ?? 0, "due today")}
          />
          <StatCard
            label="Completed"
            value={statValue(summary?.completed)}
            icon={CheckCircle2}
            tone="success"
            hint={taskHint(summary?.completedToday ?? 0, "completed today")}
          />
          <StatCard
            label="Pending"
            value={statValue(summary?.pending)}
            icon={Clock3}
            tone="warning"
            hint={taskHint(summary?.inProgress ?? 0, "in progress")}
          />
          <StatCard
            label="Overdue"
            value={statValue(summary?.overdue)}
            icon={AlertTriangle}
            tone="danger"
            hint="Past due and not completed"
          />
        </div>
      </section>

      {tasksError ? (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger sm:flex-row sm:items-center sm:justify-between"
        >
          <span>Could not load your tasks: {tasksError.message}</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={refreshTasks}
            className="shrink-0"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Retry
          </Button>
        </div>
      ) : null}

      {analyticsError ? (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger sm:flex-row sm:items-center sm:justify-between"
        >
          <span>Could not load dashboard metrics: {analyticsError.message}</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={refreshAnalytics}
            className="shrink-0"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Retry
          </Button>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="panel p-5 lg:col-span-2" aria-labelledby="completions-heading">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="completions-heading" className="text-sm font-semibold text-ink">
                Task completions
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                Tasks you finished over the last 7 days.
              </p>
            </div>
            <BarChart3 className="h-5 w-5 text-ink-muted" aria-hidden="true" />
          </div>

          <div className="mt-4">
            {analyticsLoading ? (
              <Skeleton className="h-[230px] w-full" />
            ) : analyticsError ? (
              <p role="status" className="py-16 text-center text-sm text-ink-muted">
                Completion data is unavailable.
              </p>
            ) : (
              <CompletionsBarChart data={completions?.days ?? []} />
            )}
          </div>
          {!analyticsError && completions && completions.total === 0 ? (
            <p className="mt-2 text-xs text-ink-muted">
              No completions in this window yet — complete a task to see the chart fill in.
            </p>
          ) : null}
        </section>

        <div className="space-y-4">
          <section className="panel p-5" aria-labelledby="rate-heading">
            <div className="flex items-center justify-between">
              <h2 id="rate-heading" className="text-sm font-semibold text-ink">
                Completion rate
              </h2>
              <span className="text-xs font-medium text-ink-muted">
                {analyticsLoading
                  ? "Loading…"
                  : analyticsError
                    ? "Unavailable"
                    : summary?.total
                      ? `${summary.completed}/${summary.total}`
                      : "No tasks"}
              </span>
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">
              {analyticsLoading || analyticsError
                ? "—"
                : `${summary?.completionRate ?? 0}%`}
            </p>
            <div
              className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-muted"
              role="progressbar"
              aria-valuenow={summary?.completionRate ?? 0}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Task completion rate"
            >
              <div
                className="h-full rounded-full bg-brand transition-[width] duration-500"
                style={{ width: `${summary?.completionRate ?? 0}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-ink-muted">
              Completed tasks divided by all your tasks.
            </p>
          </section>

          <section className="panel p-5" aria-labelledby="priority-heading">
            <h2 id="priority-heading" className="text-sm font-semibold text-ink">
              Priority breakdown
            </h2>
            {analyticsLoading ? (
              <Skeleton className="mt-4 h-40 w-full" />
            ) : analyticsError ? (
              <p role="status" className="py-10 text-center text-sm text-ink-muted">
                Priority data is unavailable.
              </p>
            ) : (
              <div className="mt-3">
                <PriorityPieChart byPriority={summary?.byPriority} />
              </div>
            )}
          </section>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel p-5" aria-labelledby="recent-heading">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 id="recent-heading" className="text-sm font-semibold text-ink">
              Recent tasks
            </h2>
            <Link
              to="/tasks"
              className="rounded-md text-xs font-medium text-brand-strong hover:underline dark:text-brand"
            >
              View all
            </Link>
          </div>
          {tasksError ? (
            <p role="status" className="py-8 text-center text-sm text-ink-muted">
              Recent tasks are unavailable until your tasks can be loaded.
            </p>
          ) : (
            <TaskList
              tasks={recentTasks}
              loading={loading}
              emptyIcon={ListTodo}
              emptyTitle="No tasks yet"
              emptyDescription="Create your first task to start tracking progress."
              emptyAction={
                <Button variant="secondary" onClick={() => dialogs.openCreate()}>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Create a task
                </Button>
              }
              onOpen={dialogs.openDetail}
              onToggle={dialogs.toggle}
              onRequestDelete={dialogs.requestDelete}
            />
          )}
        </section>

        <section className="panel p-5" aria-labelledby="deadlines-heading">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 id="deadlines-heading" className="text-sm font-semibold text-ink">
              Upcoming deadlines
            </h2>
            <Link
              to="/upcoming"
              className="rounded-md text-xs font-medium text-brand-strong hover:underline dark:text-brand"
            >
              View upcoming
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : tasksError ? (
            <p role="status" className="py-8 text-center text-sm text-ink-muted">
              Upcoming deadlines are unavailable until your tasks can be loaded.
            </p>
          ) : upcomingTasks.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title="No deadlines this week"
              description="Tasks with due dates in the next 7 days will appear here."
              className="py-8"
            />
          ) : (
            <ul className="divide-y divide-line">
              {upcomingTasks.map((task) => {
                const due = formatDueLabel(task.dueAt);
                return (
                  <li key={task.id}>
                    <button
                      type="button"
                      onClick={() => dialogs.openDetail(task)}
                      className="flex w-full items-center justify-between gap-3 rounded-lg px-1 py-3 text-left transition hover:bg-surface-muted"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-ink">
                          {task.title}
                        </span>
                        <span className="mt-0.5 block text-xs text-ink-muted">
                          {task.category?.name ?? "Uncategorized"}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs font-medium text-ink-muted">
                        {due.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {dialogs.dialogs}
    </PageContainer>
  );
}
