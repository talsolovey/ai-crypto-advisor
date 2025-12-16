import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Express request type with optional userId property
export type AuthedRequest = Request & { userId?: string };

// Middleware to require a valid JWT for authentication
export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Missing token" });

  try {
    const token = header.slice("Bearer ".length);
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
