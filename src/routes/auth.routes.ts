import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { signupValidation } from "../middleware/validation";

const router = Router();

router.post("/signup", signupValidation, AuthController.signup);

export default router;
