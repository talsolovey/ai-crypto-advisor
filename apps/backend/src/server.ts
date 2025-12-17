import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { authRouter } from "./routes/auth.js";
import { meRouter } from "./routes/me.js";
import { onboardingRouter } from "./routes/onboarding.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { votesRouter } from "./routes/votes.js";

dotenv.config();

const app = express();

// Middleware setup
app.use(helmet());
app.use(cors({ origin: process.env.WEB_ORIGIN }));
app.use(express.json());
app.use(morgan("dev"));

// API routes
app.use("/api/auth", authRouter);
app.use("/api/me", meRouter);
app.use("/api/onboarding", onboardingRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/votes", votesRouter);

// Health check endpoint
app.get("/health", (req, res) => res.json({ ok: true }));

app.listen(4000, () => console.log("Backend running on http://localhost:4000"));
