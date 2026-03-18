# EvalOps Lite

A lightweight AI evaluation platform for monitoring **safety, quality, and model performance** in LLM applications.

EvalOps Lite simulates how AI product teams can evaluate model outputs in production using a combination of:

- automated scoring
- human review
- dashboard analytics
- seeded test cases across multiple risk categories

**Live Demo:** `https://evalops-lite-frontend.onrender.com/`

---

## Overview

As LLM-powered products scale, teams need structured ways to assess output quality beyond simple spot checks.

EvalOps Lite helps answer questions like:

- Is the model responding safely to risky prompts?
- Is it following instructions correctly?
- Are outputs clear and relevant?
- What failure patterns are emerging over time?
- Where do automated scores and human judgment differ?

This project was built to demonstrate product thinking around **LLM evaluation workflows**, especially for AI, Trust & Safety, and conversational product roles.

---

## Features

### 1. Seeded Test Library
Preloaded prompts across categories such as:
- Safety
- Reasoning
- Professional writing
- User support
- Multilingual
- Ambiguous prompts

Each case includes:
- prompt
- category
- expected behavior
- risk level

### 2. Automated Evaluation
Runs a prompt through the model and scores the response across:
- Relevance
- Safety
- Instruction Following
- Clarity
- Overall Score

Also generates evaluation notes for quick interpretation.

### 3. Human Review
Allows a reviewer to:
- assign a human rating
- label issue types
- add qualitative notes

### 4. Dashboard Analytics
Tracks:
- total evaluations
- average score by dimension
- fail rate
- score trend
- issue breakdown
- recent evaluations

### 5. Mock Mode Fallback
If no OpenAI API key is configured, the app can run in demo mode using mock evaluation logic.

---

## Why I Built This

Many AI products focus on generation, but real-world AI product work also requires robust evaluation.

I built EvalOps Lite to simulate how product teams can:
- standardize LLM evaluation
- combine automated and human review
- identify failure patterns
- turn model behavior into actionable product insights

This project is especially relevant for roles involving:
- LLM evaluation
- conversational AI
- Trust & Safety
- model quality operations
- AI product management

---

## Tech Stack

**Frontend**
- React
- Vite
- Recharts

**Backend**
- Node.js
- Express

**Database**
- SQLite

**AI Integration**
- OpenAI API
- mock fallback mode

**Deployment**
- Render

---

## Project Structure

```text
evalops-lite/
  client/
    src/
      App.jsx
      App.css
      api.js
  server/
    src/
      routes/
        dashboard.js
        evaluate.js
        reviews.js
        testCases.js
      services/
        evaluator.js
      db.js
      index.js
      initDb.js
      openaiClient.js
      seed.js
      seedData.js
      seedRuns.js
  render.yaml