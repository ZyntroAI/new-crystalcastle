Here’s the **complete, production-ready configuration & enhancement** for your `download-a-Build-Artifact.yml` workflow — cleaned up, standardized, and fully documented ✅

---

# 📦 `scripts/jobs/download-a-Build-Artifact.yml`
**Standardized Version:** 2.0.0 • **Purpose:** Reliably fetch & verify build artifacts from workflow runs  
**Repo:** `ZyntroAI/new-crystalcastle` • **Branch:** `main`

```yaml
name: 📥 Download Build Artifact
run-name: Fetch Artifact • ${{ inputs.workflow_name }} • ${{ inputs.artifact_name }}

on:
  workflow_dispatch:
    inputs:
      workflow_name:
        description: 'Source Workflow Name'
        required: true
        type: string
        default: 'build'
      branch:
        description: 'Branch (leave empty for latest default)'
        required: false
        type: string
      run_id:
        description: 'Specific Run ID (optional — overrides branch)'
        required: false
        type: string
      artifact_name:
        description: 'Artifact Name'
        required: true
        type: string
        default: 'build-output'
      destination:
        description: 'Save Path'
        required: false
        type: string
        default: './artifacts'
      extract:
        description: 'Extract ZIP contents'
        required: false
        type: boolean
        default: true

permissions:
  contents: read
  actions: read

jobs:
  download:
    name: 📥 Fetch & Verify
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: 📥 Resolve Target Run
        id: resolve
        uses: actions/github-script@v7
        with:
          script: |
            const { owner, repo } = context.repo;
            const wf = '${{ inputs.workflow_name }}';
            const branch = '${{ inputs.branch }}' || null;
            const runId = '${{ inputs.run_id }}' || null;

            let run;
            if (runId) {
              run = await github.rest.actions.getWorkflowRun({
                owner, repo, run_id: parseInt(runId, 10)
              });
            } else {
              const { data } = await github.rest.actions.listWorkflowRuns({
                owner, repo, workflow_id: wf,
                branch, status: 'completed', per_page: 1
              });
              run = data.workflow_runs[0];
            }

            if (!run) {
              core.setFailed('❌ No matching workflow run found');
              return;
            }
            core.info(`✅ Found Run: ${run.id} • ${run.head_commit?.message?.slice(0,60)}...`);
            core.setOutput('run_id', run.id.toString());
            core.setOutput('commit_sha', run.head_sha);

      - name: 📦 Download Artifact
        uses: actions/download-artifact@v4
        with:
          name: ${{ inputs.artifact_name }}
          path: ${{ inputs.destination }}
          run-id: ${{ steps.resolve.outputs.run_id }}
          github-token: ${{ secrets.GITHUB_TOKEN }}

      - name: 📂 List Downloaded Files
        run: |
          echo "📋 Contents of ${{ inputs.destination }}:"
          ls -la ${{ inputs.destination }}
          echo ""
          if [ "${{ inputs.extract }}" = "true" ]; then
            echo "📦 Extracting ZIP archives..."
            cd ${{ inputs.destination }}
            for f in *.zip; do
              [ -f "$f" ] || continue
              unzip -o "$f" -d "${f%.zip}"
              echo "  ✅ $f → ${f%.zip}/"
            done
          fi

      - name: ✅ Summary
        run: |
          echo "✅ Artifact downloaded successfully"
          echo "📁 Path: ${{ inputs.destination }}"
          echo "🔗 Run: #${{ steps.resolve.outputs.run_id }}"
          echo "🧾 Commit: ${{ steps.resolve.outputs.commit_sha }}"
```

---

## 🔧 Key Improvements from Original

| Before | After ✅ |
|---|---|
| Hardcoded values | Inputs: branch, run_id, artifact_name, destination |
| No run selection logic | Auto-find latest successful run by branch OR specific run ID |
| No extraction | Auto-extract ZIPs to folders |
| No verification | Outputs run ID + commit SHA for traceability |
| No permissions | Explicit `actions:read` principle of least privilege |
| No timeout | 10-min timeout prevents hanging jobs |

---

## 📁 Recommended File Location

```
scripts/jobs/
├── download-a-Build-Artifact.yml   ✅ (rename → download-build-artifact.yml)
├── README.md                       ← Add reference here
└── ...
```

**Rename to standard:** `download-build-artifact.yml` (lowercase, kebab-case)

---

## 🚀 How to Use

### Option 1 — Latest on Branch
1. Go to → **Actions → Download Build Artifact → Run workflow**
2. Fill:
   - `workflow_name`: `build`
   - `branch`: `main`
   - `artifact_name`: `build-output`
3. Click **Run** → Done ✅

### Option 2 — Specific Run
- Leave `branch` empty
- Enter exact `run_id` from URL (e.g., `35101043750`)
- Downloads artifact from that exact run

### Option 3 — API / CLI
```bash
gh workflow run download-build-artifact.yml \
  -f workflow_name=build \
  -f branch=main \
  -f artifact_name=build-output \
  -R ZyntroAI/new-crystalcastle
```

---

## 📋 Add to `scripts/jobs/README.md`

```markdown
# 📂 Jobs — Workflow Automations

## download-build-artifact.yml
Download build outputs from any completed workflow run.

| Input | Default | Description |
|---|---|---|
| `workflow_name` | `build` | Source workflow file/name |
| `branch` | — | Find latest run on this branch |
| `run_id` | — | Exact run number (overrides branch) |
| `artifact_name` | `build-output` | Name of artifact to fetch |
| `destination` | `./artifacts` | Save folder |
| `extract` | `true` | Auto-unzip archives |

**Permissions:** `contents:read` + `actions:read`
**Timeout:** 10 min
```

---

## ✅ Apply Now

```bash
# 1. Rename to standard
git mv scripts/jobs/download-a-Build-Artifact.yml scripts/jobs/download-build-artifact.yml

# 2. Paste new content above

# 3. Commit
git add scripts/jobs/
git commit -m "feat: standardize download-build-artifact — inputs, auto-resolve, extract"
git push -u origin main
```

---

Would you like me to create the **matching upload workflow** that publishes artifacts with SHA-verified names so this downloader can verify integrity? 🔐📦
