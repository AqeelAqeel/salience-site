---
name: pdf-form-autofill
description: Inspect uploaded fillable PDFs, build a one-time field registry from PDF form fields, extract values from notes/transcripts/voice context, fill safe matches, and report remaining gaps. Use when Codex needs to implement, debug, or operate a self-service PDF form autofill flow for broker workflows or other low-volume document workflows.
---

# PDF Form Autofill

Use this workflow for one-time, case-by-case PDF completion where the uploaded form itself is the registry. This is best for low-volume form universes where a persistent per-form integration is premature.

## Workflow

1. Inspect the uploaded PDF with a structured PDF library, preferably `pdf-lib`.
2. Build a temporary registry from the AcroForm fields: exact field name, field type, option values, and read-only status.
3. Gather source context from pasted notes, transcripts, voice-note transcription, and text attachments.
4. Ask the model to map evidence into exact PDF field names. Require JSON, confidence scores, source quotes, and gap questions.
5. Fill only fields that exist in the registry and are supported by evidence. Leave legal attestations, signatures, tax IDs, and low-confidence answers blank unless explicitly provided.
6. Return the filled editable PDF plus an operator-facing gap report.

## Guardrails

- Treat flat/scanned PDFs as unsupported unless OCR or coordinate overlay is explicitly available.
- Never infer legal identifiers, signatures, initials, policy numbers, or attestation answers.
- Keep the source quote for every AI-filled value so a broker can audit it.
- For checkboxes, fill only clear yes/no evidence.
- For dropdowns, radios, and option lists, choose from the PDF's actual options.
- Preserve editability unless the user explicitly requests a flattened PDF.

## Implementation Notes

- Server route should accept `multipart/form-data`.
- Target PDF file key: `template`.
- Source text key: `notes`.
- Optional audio key: `voiceNote`; transcribe before extraction.
- Optional text attachments key: `supportingFiles`.
- Use an environment-selectable extraction model; default to the repo's existing OpenAI client conventions.
- Cap prompt field lists and source text defensively, but report when fields or files are omitted.

## Output Contract

Return enough structure for a live UI:

```json
{
  "status": "filled",
  "fileName": "form-filled.pdf",
  "pdfBase64": "...",
  "filledCount": 12,
  "attemptedCount": 14,
  "appliedFields": [{ "fieldName": "exact_pdf_field", "value": "Acme LLC", "type": "text" }],
  "skippedFields": [{ "fieldName": "signature", "reason": "No explicit signature authorization" }],
  "unfilledFields": [{ "fieldName": "FEIN", "reason": "Not provided", "followUpQuestion": "What is the business FEIN?" }],
  "summary": {
    "extractedFacts": ["..."],
    "assumptions": [],
    "warnings": ["..."]
  }
}
```
