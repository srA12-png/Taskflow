/**
 * Validates and normalizes request input with Zod.
 *
 * Express 5 exposes req.query as a getter, so parsed values are attached as
 * req.validated instead of overwriting the request objects.
 */
export function validate(schemas) {
  return (request, response, next) => {
    const validated = {};

    for (const key of ["body", "params", "query"]) {
      if (!schemas[key]) continue;
      const result = schemas[key].safeParse(request[key] ?? {});

      if (!result.success) {
        return response.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Please check the highlighted fields",
            details: result.error.issues.map((issue) => ({
              field: issue.path.join(".") || key,
              message: issue.message,
            })),
          },
        });
      }

      validated[key] = result.data;
    }

    request.validated = validated;
    next();
  };
}
