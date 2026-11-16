import { changePassword } from "../services/authService.js";
import { updateUserName } from "../services/userService.js";

export async function updateProfile(request, response) {
  const user = await updateUserName(request.user.id, request.validated.body.name);
  response.json({ data: { user } });
}

export async function updatePassword(request, response) {
  await changePassword(request.user.id, request.validated.body);
  response.status(204).end();
}
