import TaskCard from "./TaskCard.jsx";
import LoadingSkeleton from "../ui/LoadingSkeleton.jsx";
import EmptyState from "../ui/EmptyState.jsx";

export default function TaskList({
  tasks,
  loading = false,
  emptyIcon,
  emptyTitle = "No tasks",
  emptyDescription,
  emptyAction,
  onOpen,
  onToggle,
  onRequestDelete,
  showStatus = true,
}) {
  if (loading) return <LoadingSkeleton rows={4} />;

  if (!tasks || tasks.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <ul className="space-y-2.5">
      {tasks.map((task) => (
        <li key={task.id}>
          <TaskCard
            task={task}
            onOpen={onOpen}
            onToggle={onToggle}
            onRequestDelete={onRequestDelete}
            showStatus={showStatus}
          />
        </li>
      ))}
    </ul>
  );
}
