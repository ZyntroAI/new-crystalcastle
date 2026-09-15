## 📄 Next.js Page with Run History (`pages/rubric-dashboard.js`)

```jsx
import React, { useState } from "react";
import Papa from "papaparse";

export async function getServerSideProps() {
  const owner = "your-org"; // replace with your GitHub org/user
  const repo = "your-repo"; // replace with your repo name

  // 1. Fetch last 10 workflow runs
  const runsRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=10`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
    }
  );

  const runsData = await runsRes.json();
  const runs = runsData.workflow_runs || [];

  // 2. For the latest run, fetch artifacts
  let scores = [];
  if (runs.length > 0) {
    const latestRunId = runs[0].id;
    const artifactsRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/runs/${latestRunId}/artifacts`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    const artifactsData = await artifactsRes.json();
    const artifact = artifactsData.artifacts.find((a) => a.name === "scores-csv");

    if (artifact) {
      const downloadRes = await fetch(artifact.archive_download_url, {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
        },
      });
      const buffer = await downloadRes.arrayBuffer();
      const text = new TextDecoder().decode(buffer);
      const parsed = Papa.parse(text, { header: true });
      scores = parsed.data;
    }
  }

  return {
    props: { runs, scores },
  };
}

export default function RubricDashboard({ runs, scores }) {
  const [selectedRun, setSelectedRun] = useState(runs[0]?.id);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        Rubric Evaluation Dashboard
      </h1>

      {/* Run history navigation */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Workflow Run:
        </label>
        <select
          className="border rounded px-3 py-2 text-sm"
          value={selectedRun}
          onChange={(e) => setSelectedRun(e.target.value)}
        >
          {runs.map((run) => (
            <option key={run.id} value={run.id}>
              {run.name} — {new Date(run.created_at).toLocaleString()} (SHA: {run.head_sha.slice(0,7)})
            </option>
          ))}
        </select>
      </div>

      {/* Scores table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded-lg shadow-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Criterion
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Score
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Feedback
              </th>
            </tr>
          </thead>
          <tbody>
            {scores.map((row, idx) => (
              <tr
                key={idx}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-4 py-2 text-sm text-gray-800">
                  {row.Criterion}
                </td>
                <td className="px-4 py-2 text-sm font-medium text-blue-600">
                  {row.Score}
                </td>
                <td className="px-4 py-2 text-sm text-gray-600">
                  {row.Feedback}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-700 mb-2">Summary</h2>
        <p className="text-sm text-gray-700">
          Browse past workflow runs and view rubric scoring results for each PR.
        </p>
      </div>
    </div>
  );
}
```

---

## 🔑 How It Works
- **Run history**: Fetches the last 10 workflow runs from GitHub Actions.  
- **Dropdown navigation**: Lets you select a run by timestamp and commit SHA.  
- **Scores table**: Displays rubric results from the selected run (currently wired to latest run; you can extend fetching logic to reload scores when dropdown changes).  
- **Metadata**: Shows run name, timestamp, and commit SHA for context.  

---

## 🚀 Next Steps
- Add **dynamic artifact fetching** when a different run is selected (currently only preloads latest run).  
- Show **run status** (success/failure) with badges.  
- Add **download buttons** for CSV/Doc artifacts per run.  
- Integrate charts for score trends across runs.  


Here’s a **Next.js page** that fetches rubric scoring results directly from the **GitHub Actions API** (server‑side) and renders them with Tailwind styling. This way, your dashboard always shows the latest evaluation results when someone opens the page.

---

## 📄 Next.js Page (`pages/rubric-dashboard.js`)

```jsx
import React from "react";
import Papa from "papaparse";

// Server-side fetching from GitHub Actions artifacts
export async function getServerSideProps() {
  const owner = "your-org"; // replace with your GitHub org/user
  const repo = "your-repo"; // replace with your repo name
  const runId = "latest";   // or fetch dynamically via API

  // Example: fetch artifact list
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/runs/${runId}/artifacts`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, // set in .env.local
        Accept: "application/vnd.github+json",
      },
    }
  );

  const data = await res.json();

  // Find scores.csv artifact
  const artifact = data.artifacts.find((a) => a.name === "scores-csv");

  let scores = [];
  if (artifact) {
    const downloadRes = await fetch(artifact.archive_download_url, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
    });
    const buffer = await downloadRes.arrayBuffer();
    const text = new TextDecoder().decode(buffer);
    const parsed = Papa.parse(text, { header: true });
    scores = parsed.data;
  }

  return {
    props: { scores },
  };
}

export default function RubricDashboard({ scores }) {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        Rubric Evaluation Results
      </h1>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded-lg shadow-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Criterion
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Score
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Feedback
              </th>
            </tr>
          </thead>
          <tbody>
            {scores.map((row, idx) => (
              <tr
                key={idx}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-4 py-2 text-sm text-gray-800">
                  {row.Criterion}
                </td>
                <td className="px-4 py-2 text-sm font-medium text-blue-600">
                  {row.Score}
                </td>
                <td className="px-4 py-2 text-sm text-gray-600">
                  {row.Feedback}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-700 mb-2">Summary</h2>
        <p className="text-sm text-gray-700">
          Overall performance across rubric items is automatically evaluated and
          published from GitHub Actions.
        </p>
      </div>
    </div>
  );
}
```

---

## 🔑 Setup Notes
- Add a **GitHub token** in `.env.local`:
  ```env
  GITHUB_TOKEN=ghp_yourtokenhere
  ```
- Replace `owner`, `repo`, and `runId` with your actual repo details.  
- You can fetch the **latest workflow run ID** dynamically by hitting:
  ```
  https://api.github.com/repos/{owner}/{repo}/actions/runs
  ```
  and grabbing the most recent `id`.  
- Artifacts must be uploaded in your GitHub Actions workflow (`actions/upload-artifact`) with a consistent name (e.g., `scores-csv`).  

---

## 🚀 Extensions
- Add **charts** (e.g., `react-chartjs-2`) for score distribution.  
- Add a **download button** for CSV/Doc artifacts.  
- Integrate with your **rubric scoring UI** so reviewers can override or add comments.  
- Use **ISR (Incremental Static Regeneration)** if you want caching with periodic refresh instead of fetching every request.  

---

👉 Do you want me to also sketch the **GitHub Actions step for uploading `scores.csv` as an artifact**, so this Next.js page can fetch it seamlessly?