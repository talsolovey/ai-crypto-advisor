import type { Response } from "express";
import { prisma } from "../db/prisma.js";
import type { AuthedRequest } from "../middleware/requireAuth.js";

// Parse and validate vote value
function parseVoteValue(raw: unknown): 1 | -1 {
  if (raw === 1 || raw === "1" || raw === "up" || raw === "UP") return 1;
  if (raw === -1 || raw === "-1" || raw === "down" || raw === "DOWN") return -1;
  throw new Error("Invalid vote value");
}

// Valid sections for voting
function parseSection(raw: unknown): "NEWS" | "PRICES" | "INSIGHT" | "MEME" {
  const s = String(raw ?? "").toUpperCase();
  if (s === "NEWS" || s === "PRICES" || s === "INSIGHT" || s === "MEME") return s;
  throw new Error("Invalid section");
}

// Upsert (create or update) a vote for an item in a section
export async function upsertVote(req: AuthedRequest, res: Response) {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const section = parseSection(req.body.section);
    const itemId = String(req.body.itemId ?? "").trim();
    if (!itemId) return res.status(400).json({ error: "itemId is required" });

    const value = parseVoteValue(req.body.value);

    const vote = await prisma.vote.upsert({
      where: {
        userId_section_itemId: { userId, section, itemId },
      },
      create: { userId, section, itemId, value },
      update: { value },
      select: { id: true, section: true, itemId: true, value: true, createdAt: true },
    });

    return res.json({ vote });
  } catch (e: any) {
    return res.status(400).json({ error: e?.message ?? "Bad request" });
  }
}

// Delete a vote for an item in a section
export async function deleteVote(req: AuthedRequest, res: Response) {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const section = parseSection(req.body.section);
    const itemId = String(req.body.itemId ?? "").trim();
    if (!itemId) return res.status(400).json({ error: "itemId is required" });

    await prisma.vote.delete({
      where: { userId_section_itemId: { userId, section, itemId } },
    });

    return res.json({ ok: true });
  } catch {
    // If it doesn't exist, treat as already-deleted
    return res.json({ ok: true });
  }
}
