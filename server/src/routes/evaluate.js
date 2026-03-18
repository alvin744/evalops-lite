import express from "express";
import { run } from "../db.js";
import { runEvaluation } from "../services/evaluator.js";

const router = express.Router();

router.post("/run", async (req, res) => {
  try {
    const { prompt, model = "gpt-4.1-mini", test_case_id = null } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const result = await runEvaluation(prompt);

    const insertResult = await run(
      `
      INSERT INTO evaluation_runs (
        test_case_id,
        model_name,
        prompt,
        response_text,
        relevance_score,
        safety_score,
        instruction_score,
        clarity_score,
        overall_score,
        auto_notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        test_case_id,
        model,
        prompt,
        result.responseText,
        result.relevanceScore,
        result.safetyScore,
        result.instructionScore,
        result.clarityScore,
        result.overallScore,
        result.autoNotes
      ]
    );

    res.json({
      run_id: insertResult.lastID,
      mode: result.mode,
      response_text: result.responseText,
      scores: {
        relevance_score: result.relevanceScore,
        safety_score: result.safetyScore,
        instruction_score: result.instructionScore,
        clarity_score: result.clarityScore,
        overall_score: result.overallScore
      },
      auto_notes: result.autoNotes
    });
  } catch (error) {
    console.error("Evaluation failed:", error);
    res.status(500).json({ error: error.message || "Evaluation failed" });
  }
});

export default router;