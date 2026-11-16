import { Router } from "express";
import { login, logout, me, register } from "../controllers/authController.js";
import { loginSchema, registerSchema } from "../validators/authValidators.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { authLimiter } from "../middleware/security.js";

const router = Router();

router.post("/register", authLimiter, validate({ body: registerSchema }), register);
router.post("/login", authLimiter, validate({ body: loginSchema }), login);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

export default router;
