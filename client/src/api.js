const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Request failed");
  }

  return response.json();
}

export const api = {
  getConfig: () => request("/config"),
  getTestCases: () => request("/test-cases"),
  runEvaluation: (payload) =>
    request("/evaluate/run", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  submitReview: (payload) =>
    request("/reviews", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  getDashboardSummary: () => request("/dashboard/summary")
};