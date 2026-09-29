# Report Template

Copy this structure to `<target_path>/review_results.md`.
Keep entries evidence-based and concise. Do not paste entire source files or raw logs.

# Security-First Review: PDF Convert OCR

**Repository:** `<owner/repo>`  
**Branch reviewed:** `<branch>`  
**Review path:** `<path>`  
**Review date:** `<date>`  
**Review type:** Static review and safe local validation  
**Reviewer:** FIG Agent  

## 1. Executive Summary

- **Production readiness:** Ready / Ready with minor hardening / Ready with required security changes / Not ready for production
- **Overall security posture:**
- **Overall functional/OCR posture:**
- **Findings count:** Critical / High / Medium / Low / Informational
- **Potential secrets detected:** Yes / No / Not verifiable
- **Immediate credential rotation recommended:** Yes / No / Needs verification
- **Scope limitations and confidence level:**

## 2. Review Scope and Evidence

- Reviewed commit:
- Files/directories inspected:
- Tools available:
- Commands run:
- Validation summary:
- Checks skipped:
- Access/tooling limitations:

## 3. Immediate Actions

| Priority | Action | Why | Owner role | Evidence / affected location |
|---|---|---|---|---|

## 4. Secret and API Key Audit

| ID | Classification | Confidence | Location | Exposure channel | Risk | Rotation/revocation | Required remediation |
|---|---|---|---|---|---|---|---|

## 5. Architecture and Data Flow

```text
Input PDF/image
→ validation
→ preprocessing
→ conversion
→ OCR
→ output PDF/text
→ logs / temp files / artifacts
