import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth.js";

export const onboardingRouter = Router();

const onboardingSchema = z.object({
  assets: z.array(z.string().min(1)).min(1),
  investorType: z.string().min(1),
  contentTypes: z.array(z.string().min(1)).min(1),
});

onboardingRouter.post("/", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = onboardingSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const { assets, investorType, contentTypes } = parsed.data;

  const pref = await prisma.preference.upsert({
    where: { userId: req.userId! },
    update: {
      assets: JSON.stringify(assets),
      investorType,
      contentTypes: JSON.stringify(contentTypes),
    },
    create: {
      userId: req.userId!,
      assets: JSON.stringify(assets),
      investorType,
      contentTypes: JSON.stringify(contentTypes),
    },
    select: { assets: true, investorType: true, contentTypes: true },
  });

  res.json({
    preference: {
      assets: JSON.parse(pref.assets),
      investorType: pref.investorType,
      contentTypes: JSON.parse(pref.contentTypes),
    },
  });
});

onboardingRouter.get("/preferences", requireAuth, async (req: AuthedRequest, res) => {
  const pref = await prisma.preference.findUnique({
    where: { userId: req.userId! },
    select: { assets: true, investorType: true, contentTypes: true },
  });

  if (!pref) return res.status(404).json({ error: "No preferences yet" });

  res.json({
    preference: {
      assets: JSON.parse(pref.assets),
      investorType: pref.investorType,
      contentTypes: JSON.parse(pref.contentTypes),
    },
  });
});
