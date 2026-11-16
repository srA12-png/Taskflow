import { Router } from "express";
import {
  create,
  getOne,
  list,
  remove,
  update,
} from "../controllers/taskController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validate } from "../middleware/validate.js";
import {
  createTaskSchema,
  taskIdSchema,
  taskQuerySchema,
  updateTaskSchema,
} from "../validators/taskValidators.js";

const router = Router();

router.use(requireAuth);

router.get("/", validate({ query: taskQuerySchema }), list);
router.post("/", validate({ body: createTaskSchema }), create);
router.get("/:id", validate({ params: taskIdSchema }), getOne);
router.patch(
  "/:id",
  validate({ params: taskIdSchema, body: updateTaskSchema }),
  update,
);
router.delete("/:id", validate({ params: taskIdSchema }), remove);

export default router;
