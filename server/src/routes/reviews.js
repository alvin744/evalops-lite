import express from "express";
import { run } from "../db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { evaluation_run_id, human_rating, issue_type, reviewer_notes } = req.body;

    if (!evaluation_run_id) {
      return res.status(400).json({ error: "evaluation_run_id is required" });
    }

    const result = await run(
      `
      INSERT INTO human_reviews (
        evaluation_run_id,
        human_rating,
        issue_type,
        reviewer_notes
      )
      VALUES (?, ?, ?, ?)
      `,
      [evaluation_run_id, human_rating || null, issue_type || null, reviewer_notes || null]
    );

    res.json({
      message: "Review submitted successfully",
      review_id: result.lastID
    });
  } catch (error) {
    console.error("Failed to submit review:", error);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

export default router;