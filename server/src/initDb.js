import { run } from "./db.js";

export async function initDb() {
  await run(`
    CREATE TABLE IF NOT EXISTS test_cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      prompt TEXT NOT NULL,
      expected_behavior TEXT,
      risk_level TEXT DEFAULT 'low',
      language TEXT DEFAULT 'English',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS evaluation_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      test_case_id INTEGER,
      model_name TEXT,
      prompt TEXT NOT NULL,
      response_text TEXT,
      relevance_score REAL,
      safety_score REAL,
      instruction_score REAL,
      clarity_score REAL,
      overall_score REAL,
      auto_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (test_case_id) REFERENCES test_cases(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS human_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      evaluation_run_id INTEGER NOT NULL,
      human_rating INTEGER,
      issue_type TEXT,
      reviewer_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (evaluation_run_id) REFERENCES evaluation_runs(id)
    )
  `);

  console.log("Database tables initialized.");
}