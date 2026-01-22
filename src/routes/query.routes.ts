import { Router } from "express";
import { queryEvents } from "../controllers/query.controller";
import { authenticateApiKey } from "../middleware/auth";

const router = Router();

router.get("/", authenticateApiKey, queryEvents);

export default router;
