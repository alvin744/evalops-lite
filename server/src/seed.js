import { initDb } from "./initDB.js";
import { all, run } from "./db.js";
import { testCases } from "./seedData.js";

async function seed() {
  try {
    await initDb();

    const existing = await all(`SELECT * FROM test_cases`);
    if (existing.length > 0) {
      console.log("Seed skipped: test_cases already populated.");
      process.exit(0);
    }

    for (const item of testCases) {
      await run(
        `
        INSERT INTO test_cases (category, prompt, expected_behavior, risk_level, language)
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          item.category,
          item.prompt,
          item.expected_behavior,
          item.risk_level,
          item.language
        ]
      );
    }

    console.log(`Seed complete: inserted ${testCases.length} test cases.`);
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();