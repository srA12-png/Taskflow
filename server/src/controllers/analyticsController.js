import { getCompletions, getSummary } from "../services/analyticsService.js";

export async function summary(request, response) {
  const data = await getSummary(
    request.user.id,
    request.validated.query.tzOffset,
  );
  response.json({ data });
}

export async function completions(request, response) {
  const data = await getCompletions(request.user.id, request.validated.query);
  response.json({ data });
}
