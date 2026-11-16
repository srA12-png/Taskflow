import { Router } from "express";
import { updatePassword, updateProfile } from "../controllers/userController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validate } from "../middleware/validate.js";
import {
  changePasswordSchema,
  updateProfileSchema,
} from "../validators/authValidators.js";

const router = Router();

router.use(requireAuth);

router.patch("/me", validate({ body: updateProfileSchema }), updateProfile);
router.patch(
  "/me/password",
  validate({ body: changePasswordSchema }),
  updatePassword,
);

export default router;
