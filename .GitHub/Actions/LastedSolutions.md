### Latest GitHub Actions solution

The workflow now:

- Snapshots the feature flag’s original state.
- Retries feature enable/restore operations with exponential backoff.
- Verifies every flag change using `get-flag.sh`.
- Retries flaky tests and transient API failures.
- Captures stdout/stderr using `tee` while preserving exit codes.
- Always restores the original flag state, even after failures.
- Runs legacy-path validation after restoration.
- Adds results and collapsible logs to `$GITHUB_STEP_SUMMARY`.
- Fails the workflow if toggling, testing, restoration, or validation ultimately fails.
- Limits summary logs with `tail -n 200`.
- Avoids retrying non-idempotent API changes unless an idempotency key is used.

Recommended order:

```text
Snapshot state
→ Enable with retry and verification
→ Test with retry
→ Inject failure
→ Restore snapshot with retry and verification
→ Validate stable path
→ Publish results and logs
→ Set final workflow status
```
