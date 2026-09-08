@gemini-code-assist[bot] commented on this pull request.

Code Review
This pull request updates the root .gitignore to ignore .env* and .ai* files, and introduces a new test suite scripts/tests/gitignore.test.ts to validate these ignore patterns using git check-ignore. The review feedback suggests making the test suite more robust by checking if git is available in the execution environment before running the tests, preventing failures in environments without a git installation (such as certain CI runners or Docker containers).

In scripts/tests/gitignore.test.ts:

> +import { describe, it, expect } from 'vitest';
+import { execFileSync } from 'node:child_process';
+import { fileURLToPath } from 'node:url';
+import { dirname, join } from 'node:path';
+
+const __dirname = dirname(fileURLToPath(import.meta.url));
+const repoRoot = join(__dirname, '..', '..');
high

In environments where git is not installed or the project is run outside of a git repository (such as inside a Docker container, a CI runner with a shallow/tarball checkout, or a source distribution), executing git commands will throw an error and fail the entire test suite.

To make the tests robust, we can check if we are inside a git repository first and conditionally run the gitignore tests.

import { describe, it, expect } from 'vitest';
import { execFileSync, execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..');

let gitAvailable = false;
try {
  execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore', cwd: repoRoot });
  gitAvailable = true;
} catch {}
References
Use the node: prefix when importing built-in Node.js modules for consistency across the codebase.
In scripts/tests/gitignore.test.ts:

> +  try {
+    execFileSync('git', ['check-ignore', '-q', pathToCheck], {
+      cwd: repoRoot,
+    });
+    return true;
+  } catch (error: unknown) {
+    const err = error as { status?: number };
+    // `git check-ignore` exits with status 1 when the path is not ignored.
+    if (err.status === 1) {
+      return false;
+    }
+    throw error;
+  }
+}
+
+describe('root .gitignore', () => {
high

Use describe.runIf(gitAvailable) to conditionally run the gitignore tests only when git is available and we are inside a git repository.

⬇️ Suggested change
-describe('root .gitignore', () => {
+describe.runIf(gitAvailable)('root .gitignore', () => {
—
Reply to this email directly, view it on GitHub, or unsubscribe.
You are receiving this because you authored the thread.

