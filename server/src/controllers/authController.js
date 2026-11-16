import { loginUser, registerUser } from "../services/authService.js";
import { setAuthCookie, clearAuthCookie } from "../utils/tokens.js";

export async function register(request, response) {
  const { user, token } = await registerUser(request.validated.body);
  setAuthCookie(response, token);
  response.status(201).json({ data: { user } });
}

export async function login(request, response) {
  const { user, token } = await loginUser(request.validated.body);
  setAuthCookie(response, token);
  response.json({ data: { user } });
}

export function logout(_request, response) {
  clearAuthCookie(response);
  response.status(204).end();
}

export function me(request, response) {
  response.json({ data: { user: request.user } });
}
