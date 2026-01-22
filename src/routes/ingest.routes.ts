import { Router } from "express";
import { ingestEvent } from "../controllers/ingest.controller";
import { authenticateApiKey } from "../middleware/auth";

import { rateLimit } from "../middleware/rate-limit";

const router = Router();

router.post("/", authenticateApiKey, rateLimit, ingestEvent);

export default router;
