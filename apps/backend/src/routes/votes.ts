import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { upsertVote, deleteVote } from "../controllers/votes.js";

export const votesRouter = Router();

votesRouter.post("/", requireAuth, upsertVote);
votesRouter.delete("/", requireAuth, deleteVote);
