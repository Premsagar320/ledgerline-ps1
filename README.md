# Ledgerline — PS-1, Unslop edition

A new, independently deployable PS-1 invoice review desk, designed using the Unslop skill. It retains the current AP-2026.2 invoice controls, PDF extraction, source viewing, live stages, history, exports and audited human review.

## Run locally

No dependency install or API key is needed to run the app. Use a current browser supporting Web Locks and IndexedDB.

```sh
cd ledgerline-unslop
python3 -m http.server 8768 --bind 127.0.0.1 --directory dist
```

Open `http://127.0.0.1:8768`. A local HTTP server is required for JavaScript modules, fonts, PDF worker and sample inputs. Keep the terminal open while using the app.

## Design

The current direction (second Unslop pass, derived from a clean slate) is meticulous, plainspoken and accountable: an auditor's working papers, with graphite surfaces, printed invoices and the reviewer's blue-ink tickmarks. Ink blue is the only accent; green, amber and red mean decision status and nothing else. Instrument Sans sets the interface and JetBrains Mono sets identifiers, line references and source text.

The overview keeps its section sequence: context, metrics, intake and processing explanation, then recent decisions. On desktop the decision drawer is two panes: the extracted text as a printed source sheet, with each traced field ticked on its line, beside the verdict, PO budget, evidence and controls. The PO budget is one stacked bar built from the saved PO and prior-approval snapshot. An approved invoice shows its reservation and remaining budget, a duplicate shows an unchanged budget, and a held request is hatched and labeled as uncommitted. Controls that did not pass are listed first. See `docs/design-direction.md` and `docs/design-report.md`.

No invoice runs are seeded. Sample buttons are labeled with expected results; every actual history row comes from processing a PDF. The new app uses a separate browser storage key and file database from the earlier project.

## Reproduce the workflow

1. Process `dist/samples/01-happy-path.pdf` → Approved. PO-1001 has $3,800.00 remaining after the $1,200.00 reservation.
2. Process that same PDF again → Blocked. No additional commitment is created.
3. `02-split-overrun.pdf` → Needs review. $4,500 requested against $4,000 available plus $25 tolerance.
4. `03-ambiguous-po.pdf` → Needs review. Two eligible Cedar POs, neither selected automatically. Verify PO-1003 with procurement before rechecking.
5. `04-scanned.pdf` → Needs review. Open the original source and verify the fields through the review form. Exact values are in `dist/samples/README.txt`.

A named review retains original extraction, prior decisions and corrected values. Header correction does not erase extracted item evidence or bypass item arithmetic. Reset through Rules & guide before a fresh demonstration.

## Validation

```sh
node --test tests/*.test.mjs
```

The source includes 24 rule/regression tests. The optional Playwright workflow suite checks real PDF intake, corrections, originals, exports, persistence, filters, mobile layout and competing tabs. Three additional checks verify the displayed PO reservation, unchanged duplicate balance and held-request status. Start the server first, then run `node tests/workflow.cjs` with Playwright available as a development dependency.

Environment overrides: `PLAYWRIGHT_MODULE`, `PLAYWRIGHT_EXECUTABLE`, `BASE_URL`, `QA_OUTPUT_DIR`. None is needed by app visitors.

## Scope

This is a single-browser prototype with local run history and original-file storage. It supports documented invoice labels, explicit currency, ISO dates and decimal-point amounts. No OCR, general layout interpretation, authenticated reviewer identity, shared ERP ledger, immutable audit store, foreign exchange, credit notes, goods-receipt matching, payment initiation or external messaging is provided. Approval means ready for AP posting, not paid. All fixtures are fictional.

## Attribution

Design guidance: **Unslop**, created by **Damir Sokolovsky** ([@heydamir](https://x.com/heydamir)), https://github.com/heydamir/unslop, licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Applied in two passes; each direction was approved before implementation. This app adapts that guidance; it does not copy the reference dashboard's visual assets or layout.

Self-hosted Instrument Sans and JetBrains Mono (latin and latin-ext subsets) are distributed with their OFL licenses under `dist/fonts/`. The Lucide icon subset carries its ISC license in `dist/vendor/LUCIDE-LICENSE`. PDF.js is bundled with its Apache 2.0 license in `dist/vendor/PDFJS-LICENSE`.
