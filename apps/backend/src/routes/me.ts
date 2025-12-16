import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth.js";

export const meRouter = Router();

meRouter.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { id: true, name: true, email: true },
  });

  if (!user) return res.status(404).json({ error: "User not found" });

  // Preferences + onboarding status to be added here.
  res.json({ user, onboardingCompleted: false });
});
