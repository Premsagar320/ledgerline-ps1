# Solution notes — PS-1: PDF to decision

## User and operational goal

The AP reviewer needs a clear next action, with evidence, rather than another unstructured extraction. The target workflow is a mid-size company's emailed PDF invoices and a procurement spreadsheet. This implementation accepts uploaded PDFs in place of an email integration and imports PO data as CSV. The output is a decision record and an actionable review queue; no payment is executed.

## Process map

```text
PDF upload / sample PDF
  → Check file size and PDF signature; compute SHA-256
  → PDF.js: extract every page's text and reconstruct labeled rows
  → Normalize fields; retain source text and line evidence
  → Validate completeness, date, active supplier and arithmetic
  → Match explicit PO, supplier identity and currency
  → Re-read current ledger under a browser workspace lock
  → Check approved duplicates and cumulative PO commitment
  → Approved / Needs review / Blocked
  → Save original PDF, decision evidence, control results and history
  → Display next action; download JSON audit output

Needs review
  → Open original PDF in the built-in viewer
  → Reviewer verifies all required fields and intended PO
  → Named note, source-confirmation checkbox and before/after audit
  → Run every control again against the latest ledger
  → Save revised decision without losing original extraction
```

## Decision model

Hard blocks take precedence over review conditions; approval requires every applicable check to pass.

| Control | Rule | Failure behavior |
| --- | --- | --- |
| Duplicate | Match file SHA-256 or registered supplier + normalized invoice number against approved runs | Block; name earlier run; reserve no additional budget |
| Required fields | Supplier, invoice number, date, currency, subtotal, tax and total must be explicit and readable | Review; list missing fields; never assume zero tax |
| Invoice date | Real ISO date, not later than the UTC calendar date used by the engine | Review; request correction/verification |
| Supplier | Exact curated alias in supplier register; active status required | Unknown: review. Suspended: block |
| Totals | Nonnegative integer cents, positive total, subtotal + tax exactly equals total | Review; credit notes need a separate workflow |
| Structured items | Positive quantity, nonnegative unit price and amount; row arithmetic and summed subtotal within one cent | Review on inconsistency. Bundled rows receive total-level checks |
| Extraction consistency | Conflicting labeled values are retained as warnings | Review; verify against source |
| PO match | Explicit ID in opening PO register; missing references expose candidates without auto-selecting | Review even if only one candidate |
| PO identity | Registered invoice supplier owns the matched PO | Known different supplier: block. Unknown supplier: review |
| PO status / currency | Open PO in same explicit currency | Review; no automatic FX conversion |
| Cumulative budget | Invoice ≤ authorized total − opening commitments − approved runs + tolerance | Review; request amended PO; do not consume budget |

Tolerance is applied once against cumulative spend: `min(round(2% × authorized total), 2,500 minor units)`. For USD this is at most $25; for other supported PO currencies it is at most 25 units of that currency. The tolerance does not reset for each partial invoice. Monetary additions and comparisons use integer minor units. Supported currencies have two decimal places: USD, EUR, GBP and INR.

A human review does not override hard controls. It supplies verified missing/corrected evidence and re-evaluates the original run. Its old record is excluded from duplicate/balance calculations during its own recheck; other approved records remain included.

## Four deliberate edge cases

1. **Repeated invoice**: actual repeated PDF; both content identity and business identity are checked. No second reserve is created.
2. **Split-PO overrun**: external opening commitment plus new invoice exceeds the cumulative cap. This tests ledger reasoning, not a naive invoice-versus-PO comparison.
3. **Ambiguous missing reference**: two same-supplier orders with identical budgets. The system exposes the ambiguity and requires a procurement-confirmed allocation; it does not choose by amount.
4. **Image-only scan**: extraction returns no evidence. The app safely holds the invoice, shows the source image, and supports a verified manual completion with an audit trail.

## Technical choices and tradeoffs

- **PDF.js instead of server extraction**: bundled browser worker, actual file parsing, original-file rendering, no external API dependency. Source fields are traceable to line evidence. Different column arrangements and unlabeled documents remain outside the automatic input contract.
- **Deterministic decision engine**: no model is trusted to authorize spend or invent missing data. AI was used to develop the application, fixtures, tests and walkthrough; no runtime model API is required by the guide.
- **Local browser persistence**: IndexedDB holds original PDFs; localStorage holds runs and the opening register. Browser Web Locks serialize final ledger decisions across tabs. This is transaction-like protection within one browser origin, not a shared enterprise transaction system. Exported JSON is reproducible evidence but editable and not tamper-resistant.
- **Visible processing**: each actual stage updates the UI; a 350 ms minimum display interval keeps fast steps readable. Run duration includes that display pacing. No prebuilt decision is returned in place of file processing.
- **Honest history**: no invoice runs are seeded. Dashboard metrics are derived from saved decisions. Failed file processing does not save an approval.
- **Bounded scope**: maximum 10 MB, 20 pages, 200,000 extracted characters and 200 retained runs. The PO CSV is limited to 500 rows and may be replaced only before any run, preserving the meaning of recorded decisions.

## Assumptions

All PO authorization and opening-commitment totals include tax. The opening register is trusted demo procurement data. A supplier alias register substitutes for vendor-master integration. Submissions contain one invoice per PDF; mixed invoice packets are outside scope. No receiving data is supplied, so this is two-way invoice/PO control, not three-way receipt matching. Negative invoices and credit notes are held for a separate process. The budget reserve is not an accounting posting. Reviewer names and procurement notes are user assertions, not authenticated evidence.

## Limitations and next increments

- No OCR or model layout interpretation; scan recovery is manual and disclosed.
- No proof that supplier details are legally valid, no tax recalculation, and no bank validation.
- No goods-receipt check, ERP posting, email intake, external vendor messaging, real approval authority or payment initiation.
- No shared state between people/devices, authenticated roles, immutable audit log, backup restoration or server-side storage quota management.
- A user may alter or clear browser data. Cross-browser or cross-device duplicate prevention is not provided.
- Line-level checking only covers the documented structured-item contract. Bundled/unstructured lines receive subtotal/tax/total checks, not semantic SKU matching.

Next: shared transactional ledger and idempotency keys; authenticated reviewer permissions; OCR + confidence thresholds; stronger duplicate entity resolution; goods-receipt and ERP integrations; append-only audit events; operational monitoring and recoverable queue processing.
