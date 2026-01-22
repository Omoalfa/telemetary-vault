import { Router } from "express";
import { queryEvents } from "../controllers/query.controller";
import { authenticateApiKey } from "../middleware/auth";
import { queryValidation } from "../middleware/validation";

const router = Router();

router.get("/", authenticateApiKey, queryValidation, queryEvents);

export default router;
