# Making Nomni's Invoice Processing Self-Serve: Competitive UX Research & Recommendations

*Prepared for Keith / Zeemart — Nomni Procure Invoice Agent, September 2026*

## Why this matters

The Nomni Invoice Agent already has a real structural advantage: PEPPOL e-invoicing live on both buyer and supplier sides, ahead of Restoke and Supy, plus a 3-way match pipeline that most competitors are still bolting on. The gap isn't the backend — it's that the *screens* around that pipeline (capture, exception review, approval, status) don't yet feel as self-serve as the best general AP tools, and the foodservice-specific complexity (perishables, receiving docks, multi-outlet, GST e-invoicing) means we can't just copy those tools wholesale either.

This brief pulls concrete, sourced UX patterns from two categories of comparable product — generalist AP/spend platforms (Bill.com, Ramp, Brex, Stampli, Tipalti, Ottimate, QuickBooks, Xero, Expensify) and foodservice-specific tools (MarginEdge, Restaurant365/xtraCHEF, Toast, Supy, Restoke) — and turns them into specific recommendations for the four screens that matter most: capture/upload, matching & exception review, approvals, and dashboard/status.

## How to read this

Each section has three parts: what best-in-class apps actually do (with sources), what foodservice/Nomni-specific constraints change about that pattern, and a concrete recommendation. Where the research surfaced genuine white space — something no competitor, generalist or foodservice, has publicly shown — it's called out explicitly, because those are the differentiation opportunities worth prioritizing over parity features.

---

## 1. Capture & upload

### What best-in-class apps do

Every generalist AP tool researched (Bill.com, Ramp, Brex, QuickBooks, Xero, Expensify) has converged on the same three ingestion channels: a dedicated forwarding email address, in-app photo/drag-drop upload, and increasingly a vendor-push channel (Ramp's Vendor Network). A few patterns are worth lifting directly:

- **Ramp exposes two independent, self-serve filters on email forwarding** — who's trusted to send (employees/vendors/anyone) and what's trusted as content (only things that look like invoices, or everything) — rather than a blunt on/off switch. It also silently splits one email with multiple invoice attachments into separate drafts, filters exact duplicates, and emails the sender a confirmation of what was and wasn't processed.
- **Xero/Hubdoc's side-by-side verification screen** (source document next to extracted fields, extraction in under 20 seconds) is the clearest "trust but verify" pattern found — the human confirms against the original, not against a black box.
- **None of the eight generalist tools expose a numeric confidence score to the end user.** Low-confidence extraction either shows up as a blank field the user notices, or (Expensify) routes to a human support fallback. Extraction is always an editable draft, never a committed record.
- **QuickBooks and Expensify sit at opposite ends of a "confirm the shot" spectrum**: QBO makes you tap "Use this photo" before OCR runs; Expensify auto-submits on shutter and relies on strong post-hoc coaching (flat surface, contrasting background, all edges visible, hold steady) plus a human fallback for anything unclear.

### What's different for foodservice

The receiving dock, not the inbox, is where most foodservice invoices actually get captured — and this is the sharpest divergence in the whole research set. Supy is built explicitly around a receiving manager photographing a paper invoice on a tablet the moment the delivery truck arrives, with extraction and matching running immediately, trained on F&B-specific quirks (different column orders per supplier, tax calculated differently, line items split across pages). MarginEdge and xtraCHEF both build multi-page-aware capture guidance for exactly this reason — a crumpled multi-page paper invoice photographed on a loading dock, not a clean scanned office PDF — and xtraCHEF explicitly warns users not to snap separate photos per page, requiring an in-app "Add Page" control instead.

The other divergence: foodservice has a long tail of small, non-digitized suppliers — butchers, produce stands, fishmongers — sending handwritten or faxed invoices that break pure-OCR pipelines. MarginEdge is unusually candid that "hand-written scribbles" go through a human-assisted extraction pipeline with a ~48-hour SLA rather than promising instant touchless OCR. Nomni's "PEPPOL first, never OCR" rule already handles the high end of this spectrum correctly; the low end (handwritten local-supplier invoices) is where a promise of instant, fully automated extraction will predictably fail and erode trust in self-serve.

### Recommendations

1. **Build a true receiving-moment capture flow**, not just a generic "upload a photo" button: multi-page-aware (explicit "add another page" rather than treating each shot as a new invoice), optimized for outlet staff on a phone at the dock, with the same framing/lighting coaching Expensify and check-deposit apps converge on (flat surface, contrasting background, all edges visible).
2. **Show extracted data as an always-editable draft next to the source image**, Hubdoc-style, rather than committing silently — this is cheap to build and directly addresses trust, which matters more for self-serve adoption than raw extraction accuracy.
3. **Don't expose a confidence percentage.** Instead, force human review below Nomni's existing 0.85 extraction-confidence threshold (already in the invoice agent spec) and be honest in the UI copy that low-confidence/handwritten invoices take longer — set the expectation rather than hide it.
4. **Adopt Ramp's dual-filter email-forwarding model** (sender trust + content trust, both self-serve for an admin) rather than an all-or-nothing toggle — this is a low-effort, high-leverage self-serve win.
5. **Make provenance visible on every captured invoice** — a small badge showing PEPPOL / Photo / Email / PDF / Nomni Supply. No competitor researched (including Xero, which has native PEPPOL) surfaces this at a glance in the invoice list; it's cheap to add given the `source` field already exists in the data model, and it matters more for Nomni than most because PEPPOL invoices skip extraction confidence checks entirely — a reviewer should be able to see why.
6. **Apply duplicate detection uniformly across every ingestion channel.** Xero's own history — manual entry was protected from duplicates before email-in was, and it took a 2024 fix to bring parity — is a cautionary tale directly relevant to Nomni's five ingestion sources (photo, PDF, email, PEPPOL, Nomni Supply). This should be treated as a correctness bug class, not a nice-to-have.

---

## 2. Matching & exception review

### What best-in-class apps do

This is the most fragmented category — most vendors market matching as a capability, not a shown interaction — but three patterns rise clearly to the top:

- **Ramp surfaces match status at the line level, not just invoice level**: a green "All billed units have been received" banner when quantities reconcile, a warning on the specific line when they haven't, and an inline fix action ("Update bill vendor") right next to a flagged mismatch rather than sending the reviewer elsewhere.
- **Stampli's queue is categorized and aged, with a forced reason code and named owner.** Exceptions split into sub-queues by type or vendor (not one generic bucket), each item ages visibly, and unresolved items past a threshold auto-escalate to the resolver's manager with full history attached. This directly prevents the "stale exception nobody owns" failure mode that plagues generic queues.
- **Tipalti resolves low-risk exceptions by email**, letting an approving buyer approve or contest with a single click straight from their inbox for exceptions under a configurable threshold — collapsing routine cases out of the queue UI entirely.
- **Every vendor researched claims tolerance-based auto-approval exists, but not one publicly shows a bulk "approve all exceptions under $X variance" control that a human reviewer wields directly** — it's implemented as an invisible backend rule everywhere, never as a queue-triage tool. This is the single clearest gap the research surfaced across the entire category.

### What's different for foodservice

Quantity and short-delivery variance deserve equal billing with price variance — this is the core foodservice-specific finding. Supy explicitly separates "supplier billed for more than was received" from price drift, and auto-generates a credit note plus a corrected invoice record for short deliveries — a receiving-side problem that two-way-match tools mostly don't encounter because most of what they buy isn't perishable and short-shipment is rare and low-stakes outside F&B. Nomni's existing 3-way match already treats quantity variance as a first-class exception reason (`qty_variance_exceeded`) alongside price and supplier mismatch — the research validates that this was the right call, and the review UI should reflect it with equal visual weight to price variance, not treat quantity as secondary.

The bigger finding: none of the ten AP and foodservice tools researched show recipe/margin impact inline at the point of coding an invoice. MarginEdge, Toast, and Restoke all push the ingredient-price → recipe-margin connection into a separate proactive alert or report (MarginEdge's Plate/Pour Cost Alerts, Restoke's recipe-drift notification) rather than surfacing it the moment a reviewer is looking at the price variance that caused it. Nomni already has the pieces to close this gap — the invoice agent emits a `price_change_event` that the margin agent consumes — and putting "this price change affects 4 recipes, 2 now below target margin" directly on the exception card, rather than as a separate downstream alert days later, would be a genuine first for the category, not a parity feature.

### Recommendations

1. **Adopt line-level status badges** (à la Ramp) inside the exception queue mockup already in the invoice agent skill — each exception line should carry a compact visual verdict (price/qty/supplier/GRN), not just a paragraph of exception reasons.
2. **Categorize the exception queue by reason type with visible age**, Stampli-style: price variance, quantity variance, missing GRN, low confidence, duplicate, as distinct filterable groups rather than one flat list — this matters more as invoice volume grows past what one finance user can triage in a single unsorted queue.
3. **Build the bulk "approve all under threshold" action explicitly into the queue UI**, not just as a backend auto-post rule. This is the clearest differentiation opportunity in the whole matching category — every competitor has the underlying tolerance logic, none expose it as a reviewer-facing bulk-triage tool.
4. **Surface recipe/margin impact directly on the price-variance exception card** — "affects 4 recipes, 2 below target margin" with a link into the margin agent's detail view — rather than only as a separate downstream alert. This directly leverages the existing price-change event architecture and is a legitimate white-space differentiator validated by this research.
5. **Give quantity/short-delivery exceptions their own clear resolution path** (credit note generation, corrected invoice record), matching Supy's pattern, rather than folding them into a generic "approve anyway / reject" binary that was designed with price variance in mind.
6. **Keep the audit trail as a single always-visible tab or panel per invoice** (Ottimate's HISTORY-tab pattern) that doubles as the surface for comments/@mentions on that specific exception — Stampli's model of keeping the conversation scoped to the one invoice, not a separate ticketing system, is the more collaborative and more auditable pattern for a finance team that needs a clean record for every override.

---

## 3. Approval workflows

### What best-in-class apps do

- **Brex's Copilot delegation** is the clearest OOO pattern found: assign a colleague as a delegate with an optional end date, a persistent banner shows "acting as [delegator]," and it's deliberately all-or-nothing (no granular permission scoping) to keep the model simple — plus a weekly email summarizing what's pending for the person you're covering.
- **BILL Spend & Expense's push-notification approvals** — admins can approve or deny a budget request directly from the lock-screen notification, without opening the app — is the fastest mobile approval pattern in the set. Ramp and Brex both support Slack-native approve/deny buttons inline in a message as a lighter-weight variant of the same idea.
- **Airbase's milestone tracker** ("5 out of 6 Milestones Approved," with the active stage flagged "PENDING YOUR APPROVAL") is the clearest way to visualize a multi-step approval chain to both the requester and the approver at once.
- **Bill.com's approval groups** (any one member of a named group can clear a step) are a simpler and more robust substitute for one-to-one delegation — coverage is structural rather than requiring someone to remember to set up an OOO delegate.

### What's different for foodservice

Approval scope needs to be role-and-location gated, not just tiered by dollar amount — this is the operative foodservice difference. Supy's explicit example is the sharpest: "a branch manager should not be able to accept a group-level price change." A generic dollar-threshold approval chain (the model every generalist tool defaults to) doesn't capture this — a $50 price increase might be trivial in dollar terms but still needs HQ sign-off if it changes a market-list price that propagates to every outlet, while a $2,000 single-outlet reorder might need only that outlet manager. Supy also supports splitting one multi-branch delivery's costs across branches within a single workflow, and gives HQ/ops a cross-location pending-approvals queue rather than forcing a site-by-site view — both patterns line up with how Nomni's HQ module already thinks about outlet groups and propagation.

### Recommendations

1. **Model approval routing on scope (outlet vs. group/HQ) crossed with dollar threshold, not dollar threshold alone.** A price-variance exception that would change a market-list price needs HQ approval regardless of dollar size; a routine single-outlet quantity exception can stay at the outlet-manager level. This should reuse the same outlet-group assignment model already built for the HQ governance agent's market-list propagation, rather than inventing a parallel approval-scoping concept.
2. **Use named approval groups (Bill.com's model) as the default coverage mechanism**, with individual delegation (Brex's Copilot pattern, including the persistent "acting as" banner) as a secondary option for cases where a specific person genuinely needs to hand off — groups are more robust for multi-outlet operations where staff turnover and shift coverage are constant.
3. **Ship push-notification and/or WhatsApp/Slack-equivalent inline approve/deny for low-stakes exceptions**, matching BILL Spend & Expense and Ramp's Slack pattern — for a foodservice operator, the approver is very often not sitting at a desktop, they're on the floor or on the road between outlets.
4. **Visualize multi-step chains with Airbase's fraction-and-named-stage pattern** ("2 of 3 approvals — pending Finance Manager") on any invoice that requires more than one sign-off, so both the requester and the next approver always know exactly where it stands.

---

## 4. Dashboard, status & self-serve search

### What best-in-class apps do

- The standard AP aging taxonomy (Current → 1–30 → 31–60 → 61–90 → 90+ days past due) shows up consistently, but more interestingly, the leading edge is moving toward **reason-coded status chips** rather than a flat pending/overdue binary — Brex's content describes surfacing *why* something is stuck (pending approval, matching exception, missing vendor data, cash-flow hold, dispute) directly on the invoice, not just when it's due.
- **Brex's home-page "Expenses missing review" card** — a clickable percentage/dollar figure that drills straight into the specific pending items — is a concrete "at a glance, then one click to act" pattern worth copying directly.
- QuickBooks' "For Review" queue framing, and Ramp's confirmation emails, both give an ambiguous post-capture state an actual name the user can act on, rather than leaving a document in silent limbo.

### What's different for foodservice

None of the foodservice-specific tools researched publicly document a genuinely cross-location dashboard beyond marketing language ("multi-level approval workflows," "cross-location visibility") — Restaurant365 in particular makes the claim repeatedly but doesn't show the mechanics. Supy is the exception, explicitly calling out a cross-location pending-approvals queue for HQ/ops as distinct from a per-site view. For a multi-outlet operator, the dashboard's job is less "how much am I paying this week" (the generalist framing) and more "which outlets have exceptions piling up, and which prices just moved for everyone."

### Recommendations

1. **Add reason-coded status chips** (awaiting GRN, price exception, duplicate hold, pending HQ approval) to every invoice list view, not just a pending/overdue date badge — this is a low-cost, high-clarity change that directly serves self-serve, since a finance user shouldn't have to open an invoice to know why it's stuck.
2. **Build an HQ-level cross-outlet exception summary** (à la Supy) as a distinct view from the per-outlet invoice queue — "12 exceptions across 4 outlets, 3 are group-level price changes awaiting your approval" — since Nomni's HQ/outlet-group model is already more structured than most competitors' flat multi-location marketing claims.
3. **Put an actionable summary card on the finance user's home view** (Brex's "Expenses missing review" pattern) — count + dollar total of exceptions needing review, clickable straight into the filtered queue.

---

## Prioritization

Ranked by effort-to-impact, drawing on both the parity gaps and the differentiation opportunities above:

**Quick wins (low effort, directly serve self-serve):** provenance badges on captured invoices; reason-coded status chips on invoice lists; dual-filter email forwarding (sender + content trust); line-level status badges in the exception queue; a home-view exception summary card.

**Medium effort, clear payoff:** categorized/aged exception sub-queues with forced reason codes; the bulk "approve under threshold" reviewer-facing control; scope-and-threshold approval routing tied to the existing outlet-group model; a cross-outlet HQ exception summary view.

**Bigger bets, but the most defensible differentiators:** inline recipe/margin-impact surfacing on price-variance exceptions (nobody in the category does this); a genuinely receiving-dock-optimized multi-page capture flow tuned for foodservice's paper reality; explicit, well-designed short-delivery/damaged-goods exception handling with automatic credit-note generation.

## Where Nomni can credibly claim to be first

Two findings from this research are worth stating plainly because they're not just "do this better than competitors" — they're gaps nobody in the category has filled:

GST/VAT e-invoicing compliance is essentially absent from every foodservice tool's public product marketing, including Supy, which operates in the UAE where an FTA e-invoicing mandate is approaching. Nomni's existing PEPPOL InvoiceNow work (already ahead of Restoke and Supy per the invoice agent skill) means self-serve UX built around compliance-readiness — visible provenance, audit-ready trails, IRAS-aligned batch/real-time handling per source type — is a market position no competitor is currently claiming, in Singapore or the wider APAC/Middle East region.

And inline recipe-margin impact at the moment of invoice coding — not a separate report, not a proactive threshold alert days later, but on the exception card itself — was validated as genuine white space across all ten products researched. Given the price-change event architecture already exists between the invoice agent and margin agent, this is closer to a UI investment than a new backend build.

## Open questions this raises

A few things worth resolving before committing to specific screen designs: how granular should scope-based approval routing get (outlet / outlet-group / brand / all), and does that reuse the HQ governance agent's existing outlet-group assignment model directly or need its own configuration surface? Should the bulk "approve under threshold" control require a secondary confirmation given it's a new pattern nobody else exposes (worth getting right the first time, since it's real money moving without individual review)? And for short-delivery/damaged-goods exceptions, does Nomni want to auto-generate a credit note (Supy's pattern) or leave that as a manual follow-up step — that's as much a finance-policy decision as a UX one.

---

## Sources

**Generalist AP/spend platforms:** BILL (bill.com product/help docs, developer docs), Ramp (support.ramp.com, ramp.com/blog), Brex (brex.com/support, brex.com/spend-trends), Airbase (marketing PDFs, Mattermost's public internal ops handbook, third-party reviews — Airbase's own site now largely redirects post-Paylocity acquisition), Stampli (stampli.com resources and blog), Tipalti (tipalti.com/ap-automation), Ottimate/Plate IQ (ottimate.com, support.ottimate.com), QuickBooks Online (quickbooks.intuit.com help), Xero/Hubdoc (xero.com, productideas.xero.com), Expensify (use.expensify.com, help.expensify.com, community.expensify.com), Chase mobile deposit (chase.com) as a capture-UX analog.

**Foodservice-specific tools:** MarginEdge (marginedge.com, help.marginedge.com), Restaurant365/xtraCHEF (restaurant365.com, support.toasttab.com), Toast (pos.toasttab.com), Supy (supy.io/blog), Restoke (restoke.ai).

**Internal:** Nomni Invoice Agent skill (3-way match spec, exception reasons, non-negotiables), PEPPOL InvoiceNow research notes (Zeemart 2.0 project).

*Note: public marketing and help-center content documents configuration logic and capability claims far more thoroughly than pixel-level screen layouts — several specific UI details (exact chart types on dashboards, Airbase's and Coupa's buyer-side review screens) sit behind product logins and would need a live trial or demo to confirm precisely. Recommendations above are flagged as competitor-validated patterns vs. Nomni-specific differentiation opportunities throughout, so that distinction survives even where exact pixel details couldn't be verified.*
