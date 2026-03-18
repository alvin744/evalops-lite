import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line
} from "recharts";
import { api } from "./api";
import "./App.css";

const ISSUE_OPTIONS = [
  "hallucination",
  "unsafe",
  "irrelevant",
  "poor instruction following",
  "low clarity"
];

function App() {
  const [config, setConfig] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);

  const [humanRating, setHumanRating] = useState(3);
  const [issueType, setIssueType] = useState("");
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      const [cfg, cases, summary] = await Promise.all([
        api.getConfig(),
        api.getTestCases(),
        api.getDashboardSummary()
      ]);
      setConfig(cfg);
      setTestCases(cases);
      setDashboard(summary);
    } catch (error) {
      console.error(error);
    }
  }

  function handleSelectCase(event) {
    const id = event.target.value;
    setSelectedCaseId(id);

    const chosen = testCases.find((item) => String(item.id) === id);
    setPrompt(chosen ? chosen.prompt : "");
  }

  async function handleRunEvaluation() {
    if (!prompt.trim()) return;

    try {
      setLoading(true);
      setReviewMessage("");

      const response = await api.runEvaluation({
        prompt,
        model: "gpt-4.1-mini",
        test_case_id: selectedCaseId || null
      });

      setResult(response);
      setHumanRating(3);
      setIssueType("");
      setReviewerNotes("");

      const updatedSummary = await api.getDashboardSummary();
      setDashboard(updatedSummary);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitReview() {
    if (!result?.run_id) return;

    try {
      await api.submitReview({
        evaluation_run_id: result.run_id,
        human_rating: Number(humanRating),
        issue_type: issueType,
        reviewer_notes: reviewerNotes
      });

      setReviewMessage("Review submitted.");
      const updatedSummary = await api.getDashboardSummary();
      setDashboard(updatedSummary);
    } catch (error) {
      alert(error.message);
    }
  }

  const metricCards = dashboard?.totals
    ? [
        { label: "Total Evaluations", value: dashboard.totals.total_evaluations || 0 },
        { label: "Avg Relevance", value: dashboard.totals.avg_relevance || 0 },
        { label: "Avg Safety", value: dashboard.totals.avg_safety || 0 },
        { label: "Avg Instruction", value: dashboard.totals.avg_instruction || 0 },
        { label: "Avg Clarity", value: dashboard.totals.avg_clarity || 0 },
        { label: "Avg Overall", value: dashboard.totals.avg_overall || 0 },
        { label: "Fail Rate %", value: dashboard.totals.fail_rate || 0 }
      ]
    : [];

  return (
    <div className="app">
      <header className="header">
        <h1>EvalOps Lite</h1>
        <p>
          AI Evaluation Platform for Monitoring Safety, Quality, and Model Performance
        </p>
      </header>

      {config && !config.hasOpenAIKey && config.mockFallback && (
        <div className="banner">
          Demo mode is active. The app will use mock evaluation when no OpenAI API key is configured.
        </div>
      )}

      <main className="grid">
        <section className="card">
          <h2>Run Evaluation</h2>

          <label>Choose a seeded test case</label>
          <select value={selectedCaseId} onChange={handleSelectCase}>
            <option value="">-- Select a test case --</option>
            {testCases.map((item) => (
              <option key={item.id} value={item.id}>
                [{item.category}] {item.prompt.slice(0, 70)}
              </option>
            ))}
          </select>

          <label>Prompt</label>
          <textarea
            rows="8"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter a prompt to evaluate..."
          />

          <button onClick={handleRunEvaluation} disabled={loading}>
            {loading ? "Running..." : "Run Evaluation"}
          </button>
        </section>

        <section className="card">
          <h2>Latest Result</h2>
          {!result ? (
            <p>Run an evaluation to see the latest response and scoring breakdown.</p>
          ) : (
            <div className="result-block">
              <div className="mode-row">
                <span className="pill">{result.mode}</span>
              </div>

              <h3>Response</h3>
              <div className="response-box">{result.response_text}</div>

              <h3>Scores</h3>
              <ul>
                <li>Relevance: {result.scores.relevance_score}</li>
                <li>Safety: {result.scores.safety_score}</li>
                <li>Instruction Following: {result.scores.instruction_score}</li>
                <li>Clarity: {result.scores.clarity_score}</li>
                <li>Overall: {result.scores.overall_score}</li>
              </ul>

              <h3>Auto Notes</h3>
              <p>{result.auto_notes}</p>
            </div>
          )}
        </section>
        <section className="card full-width">
          <h2>Key Insight</h2>
          <p>
            Most failures are driven by instruction-following and unsafe responses,
            suggesting that prompt clarity and safety guardrails are key areas for improvement.
          </p>
        </section>
        <section className="card full-width">
          <h2>Dashboard Summary</h2>
          {!dashboard ? (
            <p>Loading dashboard...</p>
          ) : (
            <div className="dashboard-grid">
              {metricCards.map((item) => (
                <div key={item.label} className="metric">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <h2>Score Trend</h2>
          {!dashboard?.scoreTrend?.length ? (
            <p>No trend data yet.</p>
          ) : (
            <div className="chart-scroll">
              <LineChart
                width={520}
                height={260}
                data={dashboard.scoreTrend}
                margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="avg_overall"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </div>
          )}
        </section>

        <section className="card">
          <h2>Issue Breakdown</h2>
          {!dashboard?.issueBreakdown?.length ? (
            <p>No human review issues yet.</p>
          ) : (
            <div className="chart-scroll">
              <BarChart
                width={520}
                height={260}
                data={dashboard.issueBreakdown}
                margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="issue_type" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </div>
          )}
        </section>

        <section className="card">
          <h2>Human Review</h2>
          {!result ? (
            <p>Run an evaluation first.</p>
          ) : (
            <>
              <label>Human Rating</label>
              <select value={humanRating} onChange={(e) => setHumanRating(e.target.value)}>
                {[1, 2, 3, 4, 5].map((score) => (
                  <option key={score} value={score}>
                    {score}
                  </option>
                ))}
              </select>

              <label>Issue Type</label>
              <select value={issueType} onChange={(e) => setIssueType(e.target.value)}>
                <option value="">-- Select an issue --</option>
                {ISSUE_OPTIONS.map((issue) => (
                  <option key={issue} value={issue}>
                    {issue}
                  </option>
                ))}
              </select>

              <label>Reviewer Notes</label>
              <textarea
                rows="5"
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                placeholder="What was wrong or notable about this response?"
              />

              <button onClick={handleSubmitReview}>Submit Review</button>
              {reviewMessage && <p className="success-text">{reviewMessage}</p>}
            </>
          )}
        </section>

        <section className="card">
          <h2>Recent Evaluations</h2>
          {!dashboard?.recentRuns?.length ? (
            <p>No evaluations yet.</p>
          ) : (
            <div className="recent-list">
              {dashboard.recentRuns.map((run) => (
                <div key={run.id} className="recent-item">
                  <div>
                    <strong>Score: {run.overall_score ?? "-"}</strong>
                    <p>{run.prompt}</p>
                    <small>{run.created_at}</small>
                  </div>
                  <span className="pill">{run.model_name || "model"}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card full-width">
          <h2>Test Library</h2>
          <div className="test-list">
            {testCases.map((item) => (
              <div key={item.id} className="test-item">
                <div>
                  <strong>{item.category}</strong>
                  <p>{item.prompt}</p>
                </div>
                <span className={`badge ${item.risk_level}`}>{item.risk_level}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;