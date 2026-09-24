# Troubleshooting

Failures we have actually seen, and what each one means.

## `pip install -r requirements.txt` fails in CI

**Symptom**

```
ERROR: Could not open requirements file: [Errno 2] No such file or directory: 'requirements.txt'
```

**Cause.** Four workflows install from the repository root, but the real file
is `backend/requirements.txt` and there is no root copy.

**Fix.** Add a root `requirements.txt` that pulls in the backend one, or point
the workflow steps at the real path.

---

## `npm ci` cannot read `package.json`

**Symptom**

```
npm error Invalid package.json ... Expecting property name enclosed in double quotes
```

**Cause.** The root `package.json` carried a stray unkeyed `{` that turned a
second `scripts` block into an anonymous member of the root object.

**Fix.** Merge the duplicate block into the real `scripts` object and drop the
brace. Deleting the brace alone leaves two `scripts` keys, and JSON keeps only
the last — silently dropping `dev`, `build`, `lint` and `test`.

---

## A workflow fails with zero jobs

**Symptom.** The run appears as a failure, but there are no jobs to open.

**Cause.** The workflow never scheduled — it failed validation before any
runner started. Common triggers:

- malformed YAML (a mis-indented step, a stray character)
- a `uses:` pointing at a local action that does not exist
- an action reference whose SHA does not resolve

**Fix.** Validate the file before pushing:

```bash
python -c "import yaml,sys; yaml.safe_load(open('.github/workflows/your.yml'))"
```

Then confirm every `uses:` target exists.

---

## `invalid reference format` when building the image

**Symptom.** The Docker build step dies with a tag that looks like garbage.

**Cause.** A `${{ … }}` expression was escaped into markdown somewhere in
`deploy-dev.yaml`, so buildx received literal text instead of a resolved tag.

**Fix.** Restore the expression:

```yaml
images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
```

---

## Interactive docs return 404

`/docs` and `/redoc` are served by FastAPI, not by this site. If they 404, the
application itself is not running — check `GET /health` first.

## Getting help

Open an issue at
<https://github.com/ZyntroAI/new-crystalcastle/issues> with the request you
made, the response you got, and the relevant slice of `/api/execution/logs`.
