import {
  createTask,
  deleteTask,
  getTaskById,
  listTasks,
  updateTask,
} from "../services/taskService.js";

export async function list(request, response) {
  const result = await listTasks(request.user.id, request.validated.query);
  response.json({ data: result });
}

export async function create(request, response) {
  const task = await createTask(request.user.id, request.validated.body);
  response.status(201).json({ data: { task } });
}

export async function getOne(request, response) {
  const task = await getTaskById(
    request.user.id,
    request.validated.params.id,
  );
  response.json({ data: { task } });
}

export async function update(request, response) {
  const task = await updateTask(
    request.user.id,
    request.validated.params.id,
    request.validated.body,
  );
  response.json({ data: { task } });
}

export async function remove(request, response) {
  await deleteTask(request.user.id, request.validated.params.id);
  response.status(204).end();
}
