import {
  createCategory,
  deleteCategory,
  findCategory,
  listCategories,
  updateCategory,
} from "../services/categoryService.js";

export async function list(request, response) {
  const categories = await listCategories(request.user.id);
  response.json({ data: { categories } });
}

export async function create(request, response) {
  const category = await createCategory(request.user.id, request.validated.body);
  response.status(201).json({ data: { category } });
}

export async function getOne(request, response) {
  const category = await findCategory(
    request.user.id,
    request.validated.params.id,
  );
  response.json({ data: { category } });
}

export async function update(request, response) {
  const category = await updateCategory(
    request.user.id,
    request.validated.params.id,
    request.validated.body,
  );
  response.json({ data: { category } });
}

export async function remove(request, response) {
  const result = await deleteCategory(
    request.user.id,
    request.validated.params.id,
  );
  response.json({ data: result });
}
