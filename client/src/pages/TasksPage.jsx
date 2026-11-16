import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Columns3, FilterX, List, ListTodo, Plus } from "lucide-react";
import PageContainer from "../components/layout/PageContainer.jsx";
import Button from "../components/ui/Button.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import SearchBar from "../components/ui/SearchBar.jsx";
import FilterBar from "../components/tasks/FilterBar.jsx";
import TaskList from "../components/tasks/TaskList.jsx";
import TaskCard from "../components/tasks/TaskCard.jsx";
import { useTasks } from "../context/TasksContext.jsx";
import { useTaskDialogs } from "../hooks/useTaskDialogs.jsx";
import { filterTasks, groupByStatus, sortTasks } from "../utils/tasks.js";
import { cn } from "../utils/cn.js";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

const PRIORITY_OPTIONS = [
  { value: "all", label: "All priorities" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const DUE_OPTIONS = [
  { value: "all", label: "Any due date" },
  { value: "today", label: "Due today" },
  { value: "week", label: "Next 7 days" },
  { value: "overdue", label: "Overdue" },
  { value: "none", label: "No due date" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "due", label: "Due date" },
  { value: "priority", label: "Priority" },
];

const BOARD_COLUMNS = [
  { key: "pending", label: "Pending" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
];

const DEFAULT_FILTERS = {
  status: "all",
  priority: "all",
  categoryId: "all",
  due: "all",
  sort: "newest",
};

export default function TasksPage() {
  const { tasks, categories, loading } = useTasks();
  const dialogs = useTaskDialogs();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [view, setView] = useState("list");

  const search = searchParams.get("q") ?? "";

  function setSearch(value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("q", value);
    else next.delete("q");
    setSearchParams(next, { replace: true });
  }

  function setFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  const hasFilters =
    search !== "" ||
    Object.entries(DEFAULT_FILTERS).some(
      ([key, value]) => key !== "sort" && filters[key] !== value,
    );

  const visibleTasks = useMemo(
    () => sortTasks(filterTasks(tasks, { ...filters, search }), filters.sort),
    [tasks, filters, search],
  );

  const grouped = useMemo(() => groupByStatus(visibleTasks), [visibleTasks]);

  const categoryOptions = [
    { value: "all", label: "All categories" },
    ...categories.map((category) => ({
      value: String(category.id),
      label: category.name,
    })),
    { value: "none", label: "Uncategorized" },
  ];

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
    setSearch("");
  }

  return (
    <PageContainer
      title="All Tasks"
      description="Search, filter and sort every task in your workspace."
      actions={
        <Button onClick={() => dialogs.openCreate()}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          New task
        </Button>
      }
    >
      <section className="panel p-4 sm:p-5" aria-label="Task controls">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <SearchBar
            value={search}
            onChange={setSearch}
            className="w-full xl:max-w-xs"
          />

          <FilterBar
            filters={[
              {
                id: "filter-status",
                label: "Status",
                value: filters.status,
                onChange: (value) => setFilter("status", value),
                options: STATUS_OPTIONS,
              },
              {
                id: "filter-priority",
                label: "Priority",
                value: filters.priority,
                onChange: (value) => setFilter("priority", value),
                options: PRIORITY_OPTIONS,
              },
              {
                id: "filter-category",
                label: "Category",
                value: filters.categoryId,
                onChange: (value) => setFilter("categoryId", value),
                options: categoryOptions,
                width: "w-[150px]",
              },
              {
                id: "filter-due",
                label: "Due date",
                value: filters.due,
                onChange: (value) => setFilter("due", value),
                options: DUE_OPTIONS,
              },
              {
                id: "filter-sort",
                label: "Sort by",
                value: filters.sort,
                onChange: (value) => setFilter("sort", value),
                options: SORT_OPTIONS,
                width: "w-[150px]",
              },
            ]}
          />

          <div
            role="group"
            aria-label="Task view"
            className="flex shrink-0 rounded-xl border border-line bg-surface p-1 xl:ml-auto"
          >
            <button
              type="button"
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors",
                view === "list"
                  ? "bg-brand-soft text-brand-strong dark:text-brand"
                  : "text-ink-muted hover:text-ink",
              )}
            >
              <List className="h-4 w-4" aria-hidden="true" />
              List
            </button>
            <button
              type="button"
              onClick={() => setView("board")}
              aria-pressed={view === "board"}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors",
                view === "board"
                  ? "bg-brand-soft text-brand-strong dark:text-brand"
                  : "text-ink-muted hover:text-ink",
              )}
            >
              <Columns3 className="h-4 w-4" aria-hidden="true" />
              Board
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
          <span aria-live="polite">
            {loading
              ? "Loading tasks…"
              : `${visibleTasks.length} of ${tasks.length} tasks`}
          </span>
          {hasFilters ? (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 rounded-md font-medium text-brand-strong hover:underline dark:text-brand"
            >
              <FilterX className="h-3.5 w-3.5" aria-hidden="true" />
              Clear filters
            </button>
          ) : null}
        </div>
      </section>

      {view === "list" ? (
        <section className="panel p-2 sm:p-3" aria-label="Task list">
          <TaskList
            tasks={visibleTasks}
            loading={loading}
            emptyIcon={ListTodo}
            emptyTitle={hasFilters ? "No tasks match these filters" : "No tasks yet"}
            emptyDescription={
              hasFilters
                ? "Try clearing a filter or searching for something else."
                : "Create your first task to start organising your work."
            }
            emptyAction={
              hasFilters ? (
                <Button variant="secondary" onClick={resetFilters}>
                  Clear filters
                </Button>
              ) : (
                <Button onClick={() => dialogs.openCreate()}>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Create a task
                </Button>
              )
            }
            onOpen={dialogs.openDetail}
            onToggle={dialogs.toggle}
            onRequestDelete={dialogs.requestDelete}
          />
        </section>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {BOARD_COLUMNS.map((column) => {
            const columnTasks = grouped[column.key] ?? [];
            return (
              <section
                key={column.key}
                className="panel p-3 sm:p-4"
                aria-label={`${column.label} column`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-ink">
                    {column.label}
                  </h2>
                  <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-ink-muted">
                    {columnTasks.length}
                  </span>
                </div>
                {columnTasks.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-line p-6 text-center text-xs text-ink-muted">
                    No tasks
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {columnTasks.map((task) => (
                      <li key={task.id}>
                        <TaskCard
                          task={task}
                          showStatus={false}
                          onOpen={dialogs.openDetail}
                          onToggle={dialogs.toggle}
                          onRequestDelete={dialogs.requestDelete}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}

      {dialogs.dialogs}
    </PageContainer>
  );
}
