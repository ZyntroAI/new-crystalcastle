# Safe Validation Checklist

Read immediately before executing commands.

## Safe first

Prefer:
- Static inspection
- Existing unit tests
- Lint/build commands documented by repository
- Non-destructive validation
- Controlled local fixture only

Do not:
- Use real credentials
- Upload files to external services
- Process private documents
- Run downloaded scripts as root
- Run unknown destructive commands
- Print environment variables
- Add debug output that may reveal secrets

## Record each command

For every executed command record:
- Purpose
- Command (redact sensitive values)
- Result: passed / failed / skipped
- Concise error outcome
- What was not verified

## OCR validation targets

If safe fixtures and local dependencies exist:
- Scanned PDF
- Text PDF
- Multi-page PDF
- Rotated page
- Thai/English or available language combination
- Output existence
- Searchability/selectability if testable
- Page count/order
- No uncontrolled temp artifacts

If fixtures/tools are unavailable:
- Record a blocker.
- Do not claim OCR behavior was validated.

## Git safety

Before branch/commit:
- Check status
- Preserve user changes
- Stage only report file
- Review staged diff
- Verify commit SHA
- Verify remote result before claiming success
