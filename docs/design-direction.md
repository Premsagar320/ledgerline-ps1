# Ledgerline — Unslop direction (second pass, clean slate)

This direction replaces the first Unslop direction ("exact, composed, workmanlike", ledger green). The user asked for a clean slate, so the direction below was derived again from the product rather than from the earlier design. The earlier version remains in Git history.

## Audit of the first Unslop edition

The first pass had already removed the loud signs: no gradients, glows, emoji or tracked uppercase labels, weights at 400 and 500, and spacing almost entirely on a 4px grid. What remained was a template look and a few craft issues.

1. Template look: off-white surfaces, IBM Plex, a green button, four equal stat cells and tinted status pills. Swapping in another AP tool's name would not look wrong.
2. About ten near-identical green-grey surface tints and ten border greys in `style.css` instead of one neutral ramp.
3. The accent green (`#246546`) and the Approved status green (`#2e7048`) were nearly the same hue, so color could not tell an action from an outcome.
4. The disabled Import CSV button was the most colorful element on the purchase-order page.
5. A lowercase wordmark with a colored period.
6. Breadcrumb, eyebrow and page title repeated each other on every page.
7. Slogan copy: "A source document, a set of controls, a clear next step" and "Evidence before approval".
8. Stat captions restated their labels.
9. The sample status was announced three times: top bar, sidebar and profile.
10. Three date formats and durations in raw milliseconds.
11. The source text, the actual evidence, was hidden in a collapsed details element while a tinted box took the visual weight.
12. A failed control stayed in fixed order among the passes.
13. The PO budget was a single progress bar.
14. A full column of the overview explained five static steps, with a redundant policy slogan.
15. Native disclosure triangles beside Lucide icons.
16. At 375px wide, the icon rail used about a quarter of the screen.

## Direction

- **Product:** Ledgerline checks an invoice PDF against purchase orders and procurement controls and gives an AP reviewer a decision they can defend, with every figure traced to its source line.
- **Character:** Meticulous, plainspoken, accountable.
- **World:** An auditor's working papers: printed invoices, graphite columns and the reviewer's blue-ink tickmarks.
- **Moments:** (1) The source sheet: the extracted invoice set as a printed sheet beside the decision, with traced lines marked in ink. (2) The PO budget as one stacked bar: earlier commitments, this invoice, tolerance and any overrun.
- **Signature:** Blue-ink audit tickmarks beside verified figures and controls, with reviewer initials for human verification and a legend in Rules & guide.

## Decisions

- Graphite neutrals for every surface. Reviewer's ink blue (`#2747a3`, about 8:1 on white) is the only accent. Green, amber and red are reserved for decision status.
- Instrument Sans for the interface, JetBrains Mono for identifiers, line references, fingerprints and source text. Amounts use the interface family with tabular figures. Both fonts are self-hosted under the SIL Open Font License.
- Light theme, because reviewers work beside paper documents.
- Sections, their order, invoice rules, storage keys and every `data-*` hook used by the browser suite are preserved.

## Approval

The audit and direction were shown to the user before any edit, as the skill requires. The user approved with "Go with it".
