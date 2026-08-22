const { execSync } = require("node:child_process");

function runLint() {
  try {
    execSync("npm run lint", {
      stdio: "inherit",
    });

    return {
      status: "passed",
      exitCode: 0,
    };
  } catch (error) {
    return {
      status: "failed",
      exitCode: error.status ?? 1,
    };
  }
}

module.exports = {
  runLint,
};
