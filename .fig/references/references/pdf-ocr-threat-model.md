# PDF/OCR Threat Model

Load only during Phase D.

## Trust boundaries

Map:
- Input PDF/image
- User-provided filename/path/options
- Preprocessing
- Converter subprocesses
- OCR engine/service
- Temporary files
- Output PDF/text
- Logs/artifacts
- External API/storage/network
- CI/deployment environment

## Required threat checks

### Command execution

Check for:
- Unquoted variable expansion
- `eval`
- shell interpolation
- command substitution
- unsafe `xargs`, `find -exec`, globbing
- filenames passed into shell commands
- user controlled language/page/range/options
- PDF metadata/OCR text reused as commands

### File-system safety

Check:
- path traversal
- arbitrary write
- symlink/hard-link attacks
- predictable temporary files
- overly broad temp permissions
- unsafe output filename/path
- failure cleanup
- shared multi-user directories

### PDF/image abuse

Check controls for:
- corrupt/encrypted PDFs
- malformed PDF objects
- decompression/image bombs
- huge page sizes/page count
- high DPI conversion
- massive output volume
- recursive/retry loops
- CPU/memory/disk exhaustion
- subprocess concurrency

### External services and privacy

Check:
- OCR API uploads
- storage buckets
- URL ingestion/SSRF
- network egress
- retention
- telemetry/analytics
- logs/errors/artifacts exposing document content

### Toolchain

Review:
- Ghostscript
- ImageMagick
- Poppler
- Tesseract
- OCRmyPDF
- PDF libraries
- container sandbox/resource controls
- version pinning/update policy

## Threat finding IDs

Use `OCR-001`, `OCR-002`, etc.

For each:
- Threat
- Affected boundary
- Evidence
- Impact
- Existing control
- Missing control
- Remediation
- Safe test
