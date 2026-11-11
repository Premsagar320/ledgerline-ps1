LEDGERLINE DEMO INPUTS
All suppliers and records are fictional. Reset workspace before a fresh demo.

1. 01-happy-path.pdf -> Approved ($1,200 against PO-1001; remaining $3,800).
2. Upload 01-happy-path.pdf again -> Blocked duplicate; balance unchanged.
3. 02-split-overrun.pdf -> Needs review ($4,500 against $4,000 remaining + $25 tolerance).
4. 03-ambiguous-po.pdf -> Needs review (two Cedar POs; no automatic guess).
   Verify PO-1003 with procurement, enter it in the review form, add reviewer name and note, then recheck.
5. 04-scanned.pdf -> Needs review (image-only, no OCR). Open original and verify:
   Vendor: Northstar Studio LLC
   Invoice number: NS-2049
   Date: 2026-10-20
   PO: PO-1001
   Currency: USD
   Subtotal: 500.00
   Tax: 0.00
   Total: 500.00
   Add reviewer name and verification note, confirm the checkbox, and recheck -> Approved.

PO CSV imports replace the opening register only before any run. Header must match exactly. Amounts are decimal currency units. No quotes or embedded commas in descriptions. The opening commitment on PO-1002 is $6,000.
