# Validation

Latest run, after the second Unslop pass (October 31, 2026): 24 invoice-rule/regression tests and 20 browser workflow checks passed, 44 checks in total, with no unhandled browser errors. Counts describe these scenarios; they are not a claim about extraction accuracy on arbitrary documents.

The rules cover duplicate identity and file fingerprints, cumulative PO spend and tolerance boundaries, supplier identity/status, header and item arithmetic, missing fields, dates, currency consistency, text label variants, correction evidence preservation and PO CSV validation.

The browser suite processes real PDF fixtures. It verifies actual extracted evidence, the original-file viewer, named manual correction, decision exports, history persistence, search/status filters, mobile width, and competing-tab duplicate prevention. It also checks that the PO view shows the reserved amount and correct remaining balance, leaves a duplicate's budget unchanged, and labels an unapproved request as uncommitted.

The redesign was inspected at 1440px and 375px: overview, invoice history, purchase orders, rules and guide, the process-invoice drawer, decision drawers for approved, overrun and image-only invoices, and the mobile navigation menu. The source sheet's line numbers were checked against the engine's line references. All visible app data comes from real runs or explicitly labeled sample inputs and expected outcomes. No decision history is seeded.

Chromium was tested with Playwright (headless shell 1243); this report does not claim separate Safari/Firefox coverage. The browser runtime is a development dependency only. Production limitations remain those documented in the README and operating guide.
