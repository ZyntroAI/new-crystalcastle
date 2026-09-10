# Archived non-workflow files

These files lived in `.github/workflows/` but are **not** GitHub Actions workflows —
they are notes, documentation, and a mis-named text bundle. They were moved here so
the actions directory contains only real, valid workflow YAML.

| File | Was | Why moved |
|---|---|---|
| `Update-python.md` | `.github/workflows/Update-python.md` | Explainer note about a Python 3.1 runner failure — not a workflow. |
| `Video_Editing.md` | `.github/workflows/Video_Editing.md` | Thai video-editing notes — not a workflow. |
| `Workflow-automations.txt` | `.github/workflows/Workflow-automations.txt` | Suggestive automations text — not a workflow. |
| `codeql-notes.md` | `.github/workflows/codeql` | A "Ready-to-Commit PR Bundle" text file with **no extension**; its name collided with the real `codeql.yml`. |

Nothing was deleted — every file is preserved here verbatim.

The real, active CodeQL workflow remains at `.github/workflows/codeql.yml`.
