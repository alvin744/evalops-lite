import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDb } from "./initDb.js";

import testCasesRouter from "./routes/testCases.js";
import evaluateRouter from "./routes/evaluate.js";
import reviewsRouter from "./routes/reviews.js";
import dashboardRouter from "./routes/dashboard.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173"
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    }
  })
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "EvalOps Lite API is running" });
});

app.get("/api/config", (_req, res) => {
  res.json({
    hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY),
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    mockFallback: process.env.USE_MOCK_IF_NO_KEY === "true"
  });
});

app.use("/api/test-cases", testCasesRouter);
app.use("/api/evaluate", evaluateRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/dashboard", dashboardRouter);

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  });