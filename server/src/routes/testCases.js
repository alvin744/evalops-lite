import express from "express";
import { all } from "../db.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const rows = await all(`
      SELECT *
      FROM test_cases
      ORDER BY id DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Failed to fetch test cases:", error);
    res.status(500).json({ error: "Failed to fetch test cases" });
  }
});

export default router;