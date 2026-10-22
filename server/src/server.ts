import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import connectDB from "./config/db";
import mongoose from "mongoose";

const PORT = process.env.PORT || 5000;


app.get("/health", (_req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;

  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? "ok" : "degraded",
    service: "CollabBoard API",
    database: dbConnected ? "connected" : "disconnected",
  });
});
const startServer = async (): Promise<void> => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from .env");
  }

  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((error: unknown) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});