import { Router } from "express";
import {
  create,
  getOne,
  list,
  remove,
  update,
} from "../controllers/categoryController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validate } from "../middleware/validate.js";
import {
  categoryIdSchema,
  createCategorySchema,
  updateCategorySchema,
} from "../validators/categoryValidators.js";

const router = Router();

router.use(requireAuth);

router.get("/", list);
router.post("/", validate({ body: createCategorySchema }), create);
router.get("/:id", validate({ params: categoryIdSchema }), getOne);
router.patch(
  "/:id",
  validate({ params: categoryIdSchema, body: updateCategorySchema }),
  update,
);
router.delete("/:id", validate({ params: categoryIdSchema }), remove);

export default router;
