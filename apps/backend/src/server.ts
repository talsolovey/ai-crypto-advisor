import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { authRouter } from "./routes/auth.js";

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.WEB_ORIGIN }));
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/auth", authRouter);

app.get("/health", (req, res) => res.json({ ok: true }));

app.listen(4000, () => console.log("Backend running on http://localhost:4000"));
