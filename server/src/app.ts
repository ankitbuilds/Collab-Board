
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes";
import boardRoutes from "./routes/boardRoutes";

const app = express();

const allowedOrigins = (
  process.env.CLIENT_URL ||
  "http://localhost:5173,https://collab-board-gold.vercel.app"
)
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = origin.replace(/\/$/, "");
      const isLocalhost =
        normalizedOrigin.startsWith("http://localhost:") ||
        normalizedOrigin.startsWith("http://127.0.0.1:") ||
        normalizedOrigin.startsWith("http://[::1]:");

      if (allowedOrigins.includes(normalizedOrigin) || isLocalhost) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "CollabBoard API is running",
  });
});

app.get("/health", (_req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;

  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? "ok" : "degraded",
    service: "CollabBoard API",
    database: dbConnected ? "connected" : "disconnected",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/boards", boardRoutes);

export default app;
