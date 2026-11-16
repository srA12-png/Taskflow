import { useMemo } from "react";
import { CalendarClock, CheckCircle2, Star, Sun } from "lucide-react";
import PageContainer from "../components/layout/PageContainer.jsx";
import TaskList from "../components/tasks/TaskList.jsx";
import Button from "../components/ui/Button.jsx";
import { useTasks } from "../context/TasksContext.jsx";
import { useTaskDialogs } from "../hooks/useTaskDialogs.jsx";
import { formatLongDate } from "../utils/date.js";
import {
  isCompleted,
  isDueToday,
  isOverdue,
  localDateKey,
  sortTasks,
  withinNextDays,
} from "../utils/tasks.js";


const VIEWS = {
  today: {
    title: "Today",
    description: "Tasks due today in your local timezone, plus anything overdue.",
    icon: Sun,
    emptyTitle: "Nothing due today",
    emptyDescription: "You are caught up. Tasks due today will appear here.",
  },
  upcoming: {
    title: "Upcoming",
    description: "Everything due in the next seven days.",
    icon: CalendarClock,
    emptyTitle: "Your week is clear",
    emptyDescription: "Tasks due within the next 7 days will be grouped here by date.",
  },
  completed: {
    title: "Completed",
    description: "Finished work, most recent first.",
    icon: CheckCircle2,
    emptyTitle: "No completed tasks yet",
    emptyDescription: "Mark a task complete and it moves here with its completion time.",
  },
  important: {
    title: "Important",
    description: "High-priority work that needs attention first.",
    icon: Star,
    emptyTitle: "No high-priority tasks",
    emptyDescription: "Create a task with High priority to see it here.",
  },
};

export default function TaskViewPage({ view }) {
  const config = VIEWS[view] ?? VIEWS.today;
  const Icon = config.icon;
  const { tasks, loading } = useTasks();
  const dialogs = useTaskDialogs();

  const todayTasks = useMemo(() => {
    const overdue = sortTasks(tasks.filter((task) => isOverdue(task)), "due");
    const dueToday = sortTasks(
      tasks.filter(
        (task) => !isCompleted(task) && isDueToday(task) && !isOverdue(task),
      ),
      "priority",
    );
    return { overdue, dueToday };
  }, [tasks]);

  const upcomingGroups = useMemo(() => {
    const upcoming = tasks.filter(
      (task) =>
        !isCompleted(task) && task.dueAt && withinNextDays(task, 7),
    );
    const groups = new Map();
    for (const task of upcoming) {
      const key = localDateKey(task.dueAt);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(task);
    }
    return [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, items]) => ({
        key,
        label: formatLongDate(new Date(`${key}T12:00:00`)),
        tasks: sortTasks(items, "priority"),
      }));
  }, [tasks]);

  const completedTasks = useMemo(
    () =>
      sortTasks(tasks.filter(isCompleted), "newest").sort((a, b) => {
        const aTime = a.completedAt ? Date.parse(a.completedAt) : 0;
        const bTime = b.completedAt ? Date.parse(b.completedAt) : 0;
        return bTime - aTime;
      }),
    [tasks],
  );

  const importantTasks = useMemo(
    () => sortTasks(tasks.filter((task) => task.priority === "high"), "due"),
    [tasks],
  );

  const sharedListProps = {
    loading,
    onOpen: dialogs.openDetail,
    onToggle: dialogs.toggle,
    onRequestDelete: dialogs.requestDelete,
  };

  const emptyState = (title = config.emptyTitle) => (
    <TaskList
      tasks={[]}
      loading={loading}
      emptyIcon={Icon}
      emptyTitle={title}
      emptyDescription={config.emptyDescription}
      emptyAction={
        <Button variant="secondary" onClick={() => dialogs.openCreate()}>
          Add a task
        </Button>
      }
      {...sharedListProps}
    />
  );

  return (
    <PageContainer title={config.title} description={config.description}>
      {view === "today" ? (
        <div className="space-y-6">
          {todayTasks.overdue.length > 0 ? (
            <section className="panel p-4 sm:p-5" aria-labelledby="overdue-heading">
              <h2
                id="overdue-heading"
                className="mb-3 text-sm font-semibold text-danger"
              >
                Overdue ({todayTasks.overdue.length})
              </h2>
              <TaskList tasks={todayTasks.overdue} {...sharedListProps} />
            </section>
          ) : null}

          <section className="panel p-4 sm:p-5" aria-labelledby="today-heading">
            <h2 id="today-heading" className="mb-3 text-sm font-semibold text-ink">
              Due today ({todayTasks.dueToday.length})
            </h2>
            {todayTasks.dueToday.length === 0 ? (
              emptyState(
                todayTasks.overdue.length > 0
                  ? "Nothing else due today"
                  : config.emptyTitle,
              )
            ) : (
              <TaskList tasks={todayTasks.dueToday} {...sharedListProps} />
            )}
          </section>
        </div>
      ) : null}

      {view === "upcoming" ? (
        loading ? (
          <section className="panel p-4">
            <TaskList tasks={[]} loading {...sharedListProps} />
          </section>
        ) : upcomingGroups.length === 0 ? (
          <section className="panel p-2 sm:p-3">{emptyState()}</section>
        ) : (
          <div className="space-y-6">
            {upcomingGroups.map((group) => (
              <section
                key={group.key}
                className="panel p-4 sm:p-5"
                aria-label={group.label}
              >
                <h2 className="mb-3 text-sm font-semibold text-ink">
                  {group.label}
                  <span className="ml-2 text-xs font-normal text-ink-muted">
                    {group.tasks.length} task{group.tasks.length === 1 ? "" : "s"}
                  </span>
                </h2>
                <TaskList tasks={group.tasks} {...sharedListProps} />
              </section>
            ))}
          </div>
        )
      ) : null}

      {view === "completed" ? (
        <section className="panel p-2 sm:p-3">
          <TaskList
            tasks={completedTasks}
            emptyIcon={Icon}
            emptyTitle={config.emptyTitle}
            emptyDescription={config.emptyDescription}
            {...sharedListProps}
          />
        </section>
      ) : null}

      {view === "important" ? (
        <section className="panel p-2 sm:p-3">
          <TaskList
            tasks={importantTasks}
            emptyIcon={Icon}
            emptyTitle={config.emptyTitle}
            emptyDescription={config.emptyDescription}
            {...sharedListProps}
          />
        </section>
      ) : null}

      {dialogs.dialogs}
    </PageContainer>
  );
}
