import { Router } from "express";
import { completions, summary } from "../controllers/analyticsController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validate } from "../middleware/validate.js";
import {
  completionsQuerySchema,
  summaryQuerySchema,
} from "../validators/analyticsValidators.js";

const router = Router();

router.use(requireAuth);

router.get("/summary", validate({ query: summaryQuerySchema }), summary);
router.get(
  "/completions",
  validate({ query: completionsQuerySchema }),
  completions,
);

export default router;
