---
name: nomni-invoice-ux
description: Build, spec, or review the Nomni invoice processing screens — capture/upload, exception queue & detail, approval routing, and status/dashboard views. Use whenever building invoice processing UI, the exception queue, invoice capture flow, invoice approval screens, or invoice status/self-serve dashboard views.
---

# Nomni Invoice Processing UX Skill

This skill turns the "Invoice processing UX research — competitive benchmarks and
recommendations" brief (Zeemart 2.0 project, Sept 2026) into buildable screen specs.
It governs the **screens** around the Invoice Agent — not its extraction/matching
logic, which belongs to `nomni-invoice-agent`, and not general HQ-module screens,
which belong to `nomni-hq-module-ui`.

---

## 0 · First-read checklist (mandatory)

1. Read `nomni-invoice-agent` first for the data model (`Invoice`, `InvoiceLine`,
   `MatchResult`, `ExceptionReason`, `InvoiceStatus`) and pipeline non-negotiables.
   This skill only adds UI-layer concerns on top — never re-implement matching logic
   in a component.
2. Read `nomni-hq-module-ui` for design tokens and the component registry. Every
   screen below is built from `component-library.js` components — never invented
   ones or raw hex values.
3. If the screen involves outlet/HQ scoping (approvals, cross-outlet views), check
   `nomni-governance-agent` for the existing outlet-group model before building
   anything new — approval scope reuses that model, it does not duplicate it.
4. If a price-variance exception touches recipe costing, the UI reads from
   `nomni-margin-agent`'s surfaces — this skill never computes margin itself, only
   renders what that agent returns.
5. Self-check against §5 (Non-negotiables) and §6 (Top failure modes) before
   returning any screen.

---

## 1 · Screen inventory

| # | Screen | Primary user | Research pattern it implements |
|---|--------|--------------|----------------------------------|
| 1 | Capture / upload | Outlet staff, AP clerk | Receiving-dock-first multi-page capture, side-by-side verify, provenance badges |
| 2 | Exception queue | Finance user | Line-level status, categorized aged sub-queues, bulk approve-under-threshold |
| 3 | Exception detail | Finance user | Inline recipe/margin impact, quantity/short-delivery resolution path |
| 4 | Approval routing | Outlet manager, Finance, HQ | Scope × threshold routing, milestone tracker, approval groups |
| 5 | Status / dashboard | Finance user, HQ/ops | Reason-coded status chips, home summary card, cross-outlet HQ view |

---

## 2 · Data model extensions (UI layer only)

These extend `nomni-invoice-agent`'s types — add fields, never fork the model.

```typescript
// Provenance badge — derived directly from Invoice.source, always visible in list/detail views
type ProvenanceBadge = 'PEPPOL' | 'Photo' | 'Email' | 'PDF' | 'Nomni Supply';
const provenanceLabel: Record<Invoice['source'], ProvenanceBadge> = {
  peppol: 'PEPPOL', photo: 'Photo', email: 'Email', pdf: 'PDF', nomni_supply: 'Nomni Supply',
};

// Reason-coded status chip — one small, scannable label per invoice row, never colour alone
type StatusChipTone = 'ok' | 'warn' | 'risk' | 'info' | 'neutral';
interface StatusChip { label: string; tone: StatusChipTone; }
function statusChipFor(invoice: Invoice): StatusChip {
  // Map InvoiceStatus + ExceptionReason -> a single reason-coded chip.
  // e.g. 'awaiting_grn' -> {label: 'Awaiting GRN', tone: 'neutral'}
  //      'exception' + 'price_variance_exceeded' -> {label: 'Price exception', tone: 'risk'}
  //      'auto_posted' -> {label: 'Auto-posted', tone: 'ok'}
  // Never render a flat pending/overdue binary — always say *why*.
  throw new Error('implement per InvoiceStatus x ExceptionReason matrix');
}

// Approval routing — crosses scope with dollar impact; reuses outlet-group model, does not replace it
type ApprovalScope = 'outlet' | 'outlet_group' | 'hq';
interface ApprovalRoute {
  scope: ApprovalScope;         // does this change affect one outlet, a group, or a market-list price (HQ)?
  dollarBand: 'low' | 'high';   // configurable threshold, same pattern as invoice agent's match tolerances
  requiredApprovers: string[];  // named approval GROUPS, not individuals — see §4.4
}

// Recipe/margin impact card — rendered from the Margin Agent's price_change_event consumer, not computed here
interface RecipeImpactSummary {
  affectedRecipeCount: number;
  recipesBelowTarget: { name: string; previousMargin: number; newMargin: number }[];
}
```

---

## 3 · Component mapping (Nomni Design System)

| Screen element | Component(s) | Notes |
|---|---|---|
| Drag-drop / forward-to-email capture zone | `File upload`, `Text input` (read-only email display) | Dual-filter forwarding config uses `Toggle` + `Select`, admin-only |
| Multi-page "Add page" control | `Button` (secondary) inside capture flow | Never auto-split — explicit user action |
| Source-vs-extracted verify | `Panel` (x2, side by side) + `Inline edit` per field | Always editable; never a read-only commit view |
| Duplicate warning | `Notification` (tone = warn) | Never a silent block — always explains why |
| Exception queue tabs | `Tabs` (Price / Quantity / Missing GRN / Duplicate / Low confidence) + `Status pill` for counts | Categorized, not one flat list |
| Exception row | `Structured list` row + `Status pill` (line-level, per §4.2) | Verdict must be scannable without opening the row |
| Bulk approve-under-threshold | `Checkbox` (row select) + `Slider` (threshold) + `Confirm dialog` | See §5.4 — confirmation is mandatory, this moves real money |
| Recipe impact panel | `Agent card` (agent = Margin Agent) + `Link` ("View affected recipes") | Must carry the agent signature (green border/glow) — it's agent-surfaced, not manually authored |
| Quantity/short-delivery resolution | `Button` group (Draft credit note / Hold / Reject) | Distinct action set from the price-exception approve/reject binary |
| Approval milestone tracker | `Stepper` | Shows "N of M approved" + active stage, per research |
| Approval routing config | `Radio group` (scope) + `Select` (approval group) + `Slider` (threshold) | Reuses outlet-group `Multi-select`/`Tree view` from `nomni-hq-module-ui` §4.2 |
| Cross-outlet HQ exception view | `Pulse hero` + `Table interactions` filtered by outlet group | Distinct view from any single outlet's queue |
| Home summary card | `KPI tile` or `Stat card` (clickable, filters into queue) | Must be a one-click filter, not just a static count |
| Audit trail | `Activity timeline` | Every override, approval, auto-post — same pattern as `nomni-invoice-agent` §9 |

---

## 4 · Screen specs

### 4.1 Capture / upload

- Default entry point is optimized for the **receiving dock**, not an inbox: mobile-first, multi-page-aware, with an explicit "Add another page" action between shots — never infer page boundaries from timing or backgrounds.
- Every capture channel (photo, PDF, email, PEPPOL, Nomni Supply) runs through the **same** duplicate-detection check before it reaches a human. This is a correctness invariant, not a per-channel nice-to-have — treat a channel-specific gap here as a bug, not a backlog item.
- Extraction always lands as an **editable draft** next to the source image/document. Never auto-commit, and never show a numeric confidence score to the end user — force human review below the existing 0.85 extraction-confidence threshold (`nomni-invoice-agent` §4) and say so in plain copy ("this one needs a quick check") rather than a percentage.
- PEPPOL invoices skip the OCR/confidence path entirely (`nomni-invoice-agent` §7, non-negotiable #1) — the capture screen must still show them, badged, in the same list as every other source.
- Email forwarding admin config exposes two independent filters — sender trust and content trust — never a single on/off toggle.

### 4.2 Exception queue

- Categorize by exception type (price / quantity / missing GRN / duplicate / low confidence) as filterable tabs with live counts, not one flat list — this is what keeps the queue usable as volume grows.
- Every row shows a line-level status verdict, not just an invoice-level one — a reviewer should be able to scan the queue without opening a single row.
- Aging and ownership are first-class: an exception past a configurable age auto-escalates (mirrors `nomni-invoice-agent`'s existing tolerance/threshold pattern) and always carries a named resolver, never an unowned item sitting in a shared queue.
- Build the bulk "approve all under X% variance" control as an explicit, reviewer-facing action — this is the single clearest gap the competitive research found (every vendor has the tolerance logic; none expose it as a queue-triage tool a human wields directly). See §5.4 for the guardrail this requires.

### 4.3 Exception detail

- A price-variance exception's detail view renders the Margin Agent's recipe-impact summary inline — "affects N recipes, M now below target margin" — with a link into the affected recipes. This is the validated white-space differentiator from the research; do not relegate it to a separate report or a later notification.
- Quantity and short-delivery variance get their **own** action set (draft credit note / hold / reject), not the price-exception's approve-anyway/hold/reject binary — a short delivery is a receiving-side problem, not a pricing dispute, and the UI should not force one shape onto the other.
- Every override (approve anyway, reject, hold) requires a reason and writes to the audit trail — no silent state transitions, ever (`nomni-invoice-agent` §9, non-negotiable #6).

### 4.4 Approval routing

- Route on **scope × dollar threshold**, not dollar threshold alone. A change that touches a market-list price (HQ/group scope) requires HQ approval regardless of dollar size; a routine single-outlet exception can stay at the outlet-manager level. Reuse the outlet-group assignment model from `nomni-governance-agent` — do not build a parallel scoping concept.
- Default coverage mechanism is **named approval groups** (any member can clear a step), not one-to-one delegation — groups are more robust for multi-outlet operations with shift turnover. Offer individual delegation only as a secondary option, with a persistent "acting as X" indicator when active.
- Multi-step chains render as a milestone tracker ("2 of 3 approved," active stage flagged) so both the requester and next approver always know where things stand.
- Low-stakes exceptions should be actionable from outside the app (push notification or chat-integration approve/deny) where the org has that channel configured — approvers are frequently not at a desktop.

### 4.5 Status / dashboard

- Every invoice list row carries a reason-coded status chip (awaiting GRN, price exception, duplicate hold, pending HQ approval, auto-posted) — never a flat pending/overdue date badge. A user should know *why* something is stuck without opening it.
- The finance user's home view includes a clickable summary card (count + $ total needing review) that filters straight into the queue — not a static number.
- HQ/ops gets a distinct cross-outlet exception view, not a site-by-site hunt — "12 exceptions across 4 outlets, 3 are group-level price changes awaiting approval."

---

## 5 · Non-negotiables

Carried forward from `nomni-invoice-agent` (still apply at the UI layer):

1. PEPPOL invoices never show a confidence score or route through OCR-review copy.
2. No invoice without a GRN can be approved to auto-post from any screen — the UI must reflect `awaiting_grn`, not offer a way around it.
3. Every auto-posted invoice shows its Undo window affordance, not just a static "posted" state.

New, UI-specific non-negotiables from this research:

4. **Bulk "approve under threshold" always requires a confirmation step** (`Confirm dialog`) naming the count and total dollar amount before committing — this is a new pattern nobody else in the category exposes to reviewers, and it moves real money without individual review.
5. **Duplicate detection UI is uniform across all five ingestion sources** — if one capture channel's screen doesn't show the same duplicate-warning treatment as the others, that's a bug.
6. **No numeric extraction-confidence score is ever shown to an end user.** Low confidence forces review; it does not become a percentage on the screen.
7. **Approval scope routing reuses the outlet-group model** (`nomni-governance-agent`) — never introduce a second, parallel scoping/grouping concept for invoice approvals.
8. **Recipe/margin impact panels render Margin Agent output; they never compute margin.** Wrong numbers on an invoice screen from a duplicated calculation are worse than no panel at all.
9. **Quantity/short-delivery exceptions get their own action set**, never forced through the price-exception's approve-anyway/hold/reject shape.

---

## 6 · Top failure modes

| Failure | What it looks like | Fix |
|---|---|---|
| Confidence % leaks into UI copy | "87% confident" shown to reviewer | Replace with binary: needs review / doesn't |
| Duplicate check missing on one channel | Email-forwarded invoices skip the warning others get | Route every source through one shared duplicate-check component |
| Bulk approve with no confirmation | Threshold slider silently posts N invoices on drag | Add mandatory `Confirm dialog` naming count + $ total |
| Recipe impact computed client-side | Invoice screen shows a margin number that drifts from the Margin Agent's own view | Panel must read the agent's event/output, never recompute |
| Approval routed on dollar amount alone | A cheap group-level price change slips through at outlet-manager level | Cross scope with threshold — see §4.4 |
| Quantity exception forced into price-exception UI | "Approve anyway" on a short delivery with no credit-note path | Separate action set per §4.3 |
| Flat pending/overdue status | List row gives no reason a user can act on | Reason-coded chip per §4.5 |
| PEPPOL invoice shown with a confidence badge | Violates `nomni-invoice-agent` non-negotiable #1 at the UI layer | Gate confidence UI on `source !== 'peppol'` |

---

## 7 · Source

Derived from "Invoice processing UX research — competitive benchmarks and
recommendations" (Zeemart 2.0 project, Sept 2026) — competitive analysis of
Bill.com, Ramp, Brex, Stampli, Tipalti, Ottimate, QuickBooks, Xero, Expensify,
MarginEdge, Restaurant365/xtraCHEF, Toast, Supy, and Restoke. Read that doc for
the full sourced rationale behind each recommendation above.
