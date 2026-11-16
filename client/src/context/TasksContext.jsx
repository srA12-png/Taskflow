import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "../services/api.js";

const TasksContext = createContext(null);

async function fetchAllTasks() {
  const collected = [];
  let page = 1;
  let totalPages = 1;
  let total = 0;

  do {
    const data = await api.get(`/tasks?page=${page}&limit=100&sort=newest`);
    collected.push(...data.tasks);
    totalPages = data.pagination.totalPages;
    total = data.pagination.total;
    page += 1;
    // Safety stop so a bad pagination value can never loop forever.
  } while (page <= totalPages && page <= 20);

  return { tasks: collected, total };
}

/**
 * One shared task store keeps Dashboard, list views, calendar and Kanban in
 * sync: every mutation updates local state after the API confirms it.
 */
export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  const bump = useCallback(() => setVersion((value) => value + 1), []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ tasks: fetchedTasks }, categoryData] = await Promise.all([
        fetchAllTasks(),
        api.get("/categories"),
      ]);
      setTasks(fetchedTasks);
      setCategories(categoryData.categories);
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createTask = useCallback(
    async (payload) => {
      const data = await api.post("/tasks", payload);
      setTasks((current) => [data.task, ...current]);
      bump();
      return data.task;
    },
    [bump],
  );

  const updateTask = useCallback(
    async (id, payload) => {
      const data = await api.patch(`/tasks/${id}`, payload);
      setTasks((current) =>
        current.map((task) => (task.id === id ? data.task : task)),
      );
      bump();
      return data.task;
    },
    [bump],
  );

  const deleteTask = useCallback(
    async (id) => {
      await api.delete(`/tasks/${id}`);
      setTasks((current) => current.filter((task) => task.id !== id));
      bump();
    },
    [bump],
  );

  const toggleTask = useCallback(
    (task) =>
      updateTask(task.id, {
        status: task.status === "completed" ? "pending" : "completed",
      }),
    [updateTask],
  );

  const createCategory = useCallback(async (payload) => {
    const data = await api.post("/categories", payload);
    setCategories((current) =>
      [...current, data.category].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    );
    return data.category;
  }, []);

  const updateCategory = useCallback(async (id, payload) => {
    const data = await api.patch(`/categories/${id}`, payload);
    setCategories((current) =>
      current
        .map((category) => (category.id === id ? data.category : category))
        .sort((a, b) => a.name.localeCompare(b.name)),
    );
    setTasks((current) =>
      current.map((task) =>
        task.category?.id === id
          ? { ...task, category: { ...task.category, ...data.category } }
          : task,
      ),
    );
    return data.category;
  }, []);

  const deleteCategory = useCallback(async (id) => {
    const data = await api.delete(`/categories/${id}`);
    setCategories((current) => current.filter((category) => category.id !== id));
    setTasks((current) =>
      current.map((task) =>
        task.category?.id === id ? { ...task, category: null } : task,
      ),
    );
    return data;
  }, []);

  const value = useMemo(
    () => ({
      tasks,
      categories,
      loading,
      error,
      version,
      refresh,
      createTask,
      updateTask,
      deleteTask,
      toggleTask,
      createCategory,
      updateCategory,
      deleteCategory,
    }),
    [
      tasks,
      categories,
      loading,
      error,
      version,
      refresh,
      createTask,
      updateTask,
      deleteTask,
      toggleTask,
      createCategory,
      updateCategory,
      deleteCategory,
    ],
  );

  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) throw new Error("useTasks must be used inside a TasksProvider");
  return context;
}
