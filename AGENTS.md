# Ledgerline project instructions

## Purpose and scope

Ledgerline implements ASA PS-1: accept an invoice PDF, extract traceable evidence,
check procurement controls, and return an explained decision. Preserve the working
intake, live processing stages, history, source viewer, PO register, exports and
audited human review.

This is a browser-local prototype using fictional sample data. Approval means
ready for AP posting. Do not represent it as a payment, ERP posting, authenticated
approval or verified legal/accounting decision.

Read `README.md`, `docs/solution-notes.md` and relevant tests before a substantial
change. Check `git status --short` and preserve work
that predates the current request.

## Source map

- `dist/index.html`: application shell and navigation.
- `dist/app.mjs`: PDF intake, UI rendering, persistence, reviews and exports.
- `dist/engine.mjs`: extraction, integer-money calculations and decision rules.
- `dist/style.css`: layout and responsive styles.
- `dist/icons.mjs`: bundled Lucide icon subset.
- `dist/fonts.css`, `dist/fonts/`: self-hosted Instrument Sans and JetBrains Mono
  fonts and their OFL licenses.
- `dist/vendor/`: PDF.js and library licenses.
- `dist/samples/`: four invoice PDFs, PO CSV and demonstration instructions.
- `tests/*.test.mjs`: rule and regression tests.
- `tests/workflow.cjs`: browser workflow checks.
- `.openai/hosting.json`: existing Site identity and static deployment settings.

There is no app build step or runtime API key. Keep the implementation buildless
unless a requested feature justifies a different architecture.

## Invoice controls that must hold

- Store and calculate money in integer minor units. Never use floating-point
  arithmetic for financial comparisons.
- Missing or conflicting fields, unreadable scans and ambiguous PO matches must
  lead to review. Do not invent currency, tax, invoice identity or source facts.
- Duplicate approved invoices must not create another budget reservation.
- Count opening commitments and all prior approved invoices when evaluating a PO.
  Tolerance is cumulative, not reset for each partial invoice.
- Check supplier identity/status, invoice/PO currency and arithmetic independently.
  Preserve hard stops and explain their reasons.
- A human correction must re-run the controls against the latest ledger and retain
  original extraction, prior decisions, reviewer details and before/after values.
- Header corrections must not erase extracted line items or bypass their
  arithmetic checks.
- The PO display must distinguish reserved amounts from uncommitted requests.
  A duplicate's displayed balance must remain unchanged.
- Preserve source text, original PDFs, fingerprints and saved decision snapshots.
  Do not present local fingerprints as authentication or tamper-proof evidence.
- Keep workspace locking around final ledger decisions. Preserve the separate
  `ledgerline.unslop.workspace.v1` storage key and `ledgerline-unslop-files`
  IndexedDB database; do not migrate or clear stored data without a reason.

OCR, arbitrary-layout interpretation, payment initiation, external messages,
foreign exchange, goods-receipt matching and credit notes are outside the current
scope. Keep these limits clear when they affect a requested feature.

## Development and validation

Run commands from this project root.

```sh
python3 -m http.server 8768 --bind 127.0.0.1 --directory dist
```

Open `http://127.0.0.1:8768`. JavaScript modules and the PDF worker require HTTP;
opening `index.html` directly is insufficient.

```sh
node --check dist/app.mjs
node --test tests/*.test.mjs
```

For changes affecting the workflow, start the server and run the Playwright suite:

```sh
BASE_URL=http://127.0.0.1:8768 QA_OUTPUT_DIR=qa-output node tests/workflow.cjs
```

Playwright is an optional development dependency. `PLAYWRIGHT_MODULE` and
`PLAYWRIGHT_EXECUTABLE` can select an existing installation. Do not hardcode a
developer's absolute runtime paths into portable project files.

Use tests appropriate to the change. Invoice-rule changes need meaningful rule
coverage; workflow changes need affected browser checks. Documentation-only
changes need document/path verification, not a full browser run. Inspect changed
screens at desktop and mobile widths when changing their presentation.

Historical validation records are evidence of those runs, not a permanent test
count. Report current observed results and update the relevant records when tests
or behavior change.

## Publishing and handoff

For website changes, follow the available Sites skill. Reuse the exact project ID
in `.openai/hosting.json`; do not create another Site for a routine update. Preserve
the current audience unless the user requests an access change. Open the current
remote source through the supported source workflow before editing a hosted Site.

Keep source credentials in memory and pass them through the helper's hidden stdin.
Never write tokens into files, command arguments, logs or deliverables. Push the
exact source used to package an archive, deploy that saved version, and verify the
native deployment result before calling it live.

Keep exported archives, previews and reports in the workspace's `outputs/`
directory. Include the current `AGENTS.md` in source packages. Keep limitations
accurate and distinguish a working prototype from a candidate's personal recorded
demonstration.
