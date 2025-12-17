import { Router } from "express";
import { getDashboard } from "../controllers/dashboard.js";
import { requireAuth } from "../middleware/requireAuth.js";

// Router for dashboard-related routes
export const dashboardRouter = Router();

// Protected route to get dashboard data
dashboardRouter.get("/", requireAuth, getDashboard);