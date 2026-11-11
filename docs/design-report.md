# Ledgerline — Unslop design report (second pass)

## Direction

**Product:** Ledgerline checks an invoice PDF against purchase orders and procurement controls and gives an AP reviewer a decision they can defend, with every figure traced to its source line.

**Character:** Meticulous, plainspoken, accountable.

**World:** An auditor's working papers: printed invoices, graphite columns and the reviewer's blue-ink tickmarks.

**Moments:** The source sheet beside each decision, and the PO budget as one stacked bar.

**Signature:** Blue-ink audit tickmarks beside verified figures and controls, with reviewer initials for human verification.

The direction was derived from scratch at the user's request and approved before implementation. See `design-direction.md` for the audit.

## Pass 1 — Spacing

Kept the 4px rhythm and tightened it: 56px top bar, 248px sidebar with 36px navigation rows and 2px gaps, 24px panel padding, 16–20px inside cards. Sample cases and the column header share one grid so the index, title, expected decision and arrow sit in fixed columns.

## Pass 2 — Color

One graphite ramp replaces about twenty green-grey tints. Three text roles: `#171717`, `#525252`, `#737373`. Hairlines are primary text at 8%. Ink blue `#2747a3` marks the primary action, tickmarks, reviewer initials and the invoice's share of a PO budget, and nothing else. Status colors are toned down and appear only as a dot and a word. The warm paper `#fffdf7` belongs to the source sheet alone. A disabled Import CSV button is now a plain secondary button.

## Pass 3 — Icons

The Lucide subset stays at 16px and a 1.5 stroke. Added `Menu` for the mobile navigation. The disclosure for the processing audit uses a Lucide chevron instead of the browser triangle. Passed controls use the tickmark rather than a generic check, so the icon carries meaning.

## Pass 4 — Copy

Removed the duplicate eyebrow above every title. The overview subtitle now says what happens: "Each invoice PDF is checked against its purchase order and policy AP-2026.2". Stat captions say something new ("Saved in this browser", "$1,200.00 reserved"). The sample-workspace notice appears once. One date format (`Oct 31, 2026, 11:05 AM`), durations in seconds, singular and plural counts, and toasts without trailing periods.

## Pass 5 — Type

Instrument Sans (400, 500, 600 for the wordmark only) for the interface, JetBrains Mono for run IDs, PO numbers, line references, the SHA-256 fingerprint and the source sheet. Money uses the interface family with tabular figures, so mono now means "identifier or source text". Page titles 28px/500, card figures 28px/500, metadata at least 12px.

## Pass 6 — Layout

Sections and order are unchanged. The decision drawer widens to two panes on desktop: the source sheet on the left (sticky while the decision scrolls) and the verdict, budget, evidence and controls on the right. Below 1100px it becomes one column with the sheet after the decision. Below 960px the sidebar becomes an off-canvas menu behind a menu button, hidden from keyboard focus while closed. On phones the run tables drop the PO and run-reference columns, which remain in the drawer.

## Pass 7 — Details

Status pills became a dot and a word. Controls that did not pass are listed first and keep their original reference numbers. Verdicts carry a 3px status rule instead of a tinted panel. Nested radii: panels 14, cards and inputs 8–12, tags 4. Visible focus rings stay in the accent. Hovering an extracted field highlights its line on the source sheet.

## Pass 8 — Visuals

No generated image: the product's own evidence is the visual. The source sheet renders the stored extraction as a printed page, with line numbers that match the engine's line references, ink underlines on traced lines and a tickmark naming each field. An image-only scan shows an honest empty sheet that points to the original. The PO budget is one stacked bar: earlier commitments in graphite, this invoice in ink (hatched when held for review), the authorization limit, the tolerance band and any overrun hatched in red. The PO register uses the same two colors in a compact bar, and the intake shows a small printed sheet with a tickmark.

## Pass 9 — Motion

One easing curve. Hover and press are color changes and a 0.98 press scale. The drawer fades and rises 16px over 320ms, and the mobile menu slides in over 250ms. No looping animation. Reduced-motion preferences turn everything off.

## Checks and limits

The invoice rules, policy AP-2026.2, storage key and IndexedDB database are unchanged. The budget bar and source sheet only present saved decision data; percentages are computed for display from integer minor units. The SHA-256 caption states that it is a local fingerprint, not an authentication record.

## Credit

Unslop by **Damir Sokolovsky** ([@heydamir](https://x.com/heydamir)), https://github.com/heydamir/unslop, **CC BY 4.0**. This project applies and adapts its design guidance with attribution. Instrument Sans and JetBrains Mono (SIL OFL 1.1), Lucide icons (ISC) and PDF.js (Apache 2.0) retain their bundled licenses.
