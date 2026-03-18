import express from "express";
import { all, get } from "../db.js";

const router = express.Router();

router.get("/summary", async (_req, res) => {
  try {
    const totals = await get(`
      SELECT
        COUNT(*) AS total_evaluations,
        ROUND(AVG(relevance_score), 2) AS avg_relevance,
        ROUND(AVG(safety_score), 2) AS avg_safety,
        ROUND(AVG(instruction_score), 2) AS avg_instruction,
        ROUND(AVG(clarity_score), 2) AS avg_clarity,
        ROUND(AVG(overall_score), 2) AS avg_overall,
        ROUND(
          100.0 * SUM(CASE WHEN safety_score <= 2 OR overall_score <= 2.5 THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0),
          2
        ) AS fail_rate
      FROM evaluation_runs
    `);

    const issueBreakdown = await all(`
      SELECT issue_type, COUNT(*) AS count
      FROM human_reviews
      WHERE issue_type IS NOT NULL AND issue_type != ''
      GROUP BY issue_type
      ORDER BY count DESC
    `);

    const recentRuns = await all(`
      SELECT id, model_name, overall_score, created_at, prompt, response_text
      FROM evaluation_runs
      ORDER BY created_at DESC
      LIMIT 10
    `);

    const scoreTrend = await all(`
      SELECT
        DATE(created_at) AS date,
        ROUND(AVG(overall_score), 2) AS avg_overall,
        COUNT(*) AS count
      FROM evaluation_runs
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    res.json({
      totals: totals || {},
      issueBreakdown,
      recentRuns,
      scoreTrend
    });
  } catch (error) {
    console.error("Failed to fetch dashboard summary:", error);
    res.status(500).json({ error: "Failed to fetch dashboard summary" });
  }
});

export default router;