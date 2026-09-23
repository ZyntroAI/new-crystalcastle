# Repaired workflow files

Five workflow files on `main` were syntactically invalid YAML, so GitHub never
ran them. They are repaired here rather than committed directly because the Fig
GitHub App lacks the `workflows` permission — any push that creates or updates a
file under `.github/workflows/` is rejected, regardless of the account's rights.

## The five files and what was wrong

| File | Root cause |
|---|---|
| `CICD_Pipeline.yaml` | The `steps:` list and its `run:` block were dedented to column 0. Invalid YAML; never parsed. |
| `errorlog-generator.yml` | `steps:` itself was mis-indented, flattening the whole job structure. |
| `pages-ci.yml` | Leading tab character plus a `run:` block with unescaped quotes. |
| `pytest-markers.yml` | A stray `4` on line 1, before `name:`. |
| `scorecsv.yml` | CRLF line endings throughout while the rest of the repo is LF. |

## Install

Run from a checkout that has `workflows` permission (or apply the diff through
the GitHub web editor):

```bash
./ci/install-repaired-workflows.sh            # dry run — shows what would change
./ci/install-repaired-workflows.sh --apply    # copies and re-validates
```

The script validates every source file parses before writing anything, and
re-validates after copying. Dry run is the default; `--apply` is required to
write.

## Verify

```bash
python3 - <<'PY'
import glob, yaml
bad = []
for f in sorted(glob.glob('.github/workflows/*')):
    try:
        yaml.safe_load(open(f, encoding='utf-8'))
    except Exception as e:
        bad.append((f, e))
print("invalid:", len(bad))
for f, e in bad: print("  ", f, e)
PY
```

## Still unverified after install

Four of the five reference paths that do not exist in this repo, or commands
this repo cannot run. Repairing the YAML makes them parse; it does not make them
pass. Each needs a product decision — see the `CAVEAT` note at the bottom of
each file:

- `CICD_Pipeline.yaml` — needs `requirements.txt` and a `poetry` project; this repo has neither.
- `errorlog-generator.yml` — needs `scripts/errorlog-generator/` (generator + requirements.txt); the directory does not exist.
- `pages-ci.yml` — repointed at real, currently-passing gates (`typecheck`, `build`); `lint` is deliberately left out because it fails on pre-existing errors.
- `pytest-markers.yml` — sets up Node then runs `pytest`; there is no Python project or requirements to install.
- `scorecsv.yml` — needs a scoring entrypoint; the file no-ops with a clear message when none is present.
