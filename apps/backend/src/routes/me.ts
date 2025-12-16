import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth.js";

export const meRouter = Router();

meRouter.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { id: true, name: true, email: true, preference: { select: { id: true } } },
  });

  if (!user) return res.status(404).json({ error: "User not found" });
  const onboardingCompleted = Boolean(user?.preference);

  // Preferences + onboarding status to be added here.
  res.json({ user: { id: user!.id, name: user!.name, email: user!.email }, onboardingCompleted });
});
