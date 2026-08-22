// scripts/ai-pr-review.js
import { Octokit } from "@octokit/rest";
import OpenAI from "openai";

// Initialize GitHub client
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN, // injected automatically by GitHub Actions
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function run() {
  try {
    const { GITHUB_REPOSITORY, GITHUB_EVENT_PATH } = process.env;
    const [owner, repo] = GITHUB_REPOSITORY.split("/");

    // Load PR event payload
    const event = require(GITHUB_EVENT_PATH);
    const pull_number = event.pull_request.number;

    // Fetch PR diff
    const diff = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number,
      mediaType: { format: "diff" },
    });

    // Send diff to AI for review
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a senior code reviewer. Provide concise, actionable feedback on code quality, security, readability, and maintainability.",
        },
        {
          role: "user",
          content: diff.data,
        },
      ],
    });

    const feedback = aiResponse.choices[0].message.content;

    // Post feedback as a PR comment
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: pull_number,
      body: `🤖 **AI Review Feedback**\n\n${feedback}`,
    });

    console.log("AI PR review completed successfully.");
  } catch (error) {
    console.error("Error running AI PR review:", error);
    process.exit(1);
  }
}

run();
