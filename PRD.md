# Nomni Procure — Product Requirements Document

**Version:** 1.0  
**Last updated:** 13 Jun 2026  
**Status:** Living document — update after each sprint or prototype revision  
**Source:** Derived from 23 HTML prototype screens in `/screens/`

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Information Architecture](#2-information-architecture)
3. [Feature Specifications](#3-feature-specifications)
4. [Data Models](#4-data-models)
5. [Agent Features](#5-agent-features)
6. [Design System](#6-design-system)
7. [Out of Scope / Future Work](#7-out-of-scope--future-work)
8. [Open Questions](#8-open-questions)

---

## 1. Product Overview

### What It Is

Nomni Procure is a B2B procurement and inventory management platform for multi-outlet hospitality groups. It covers the full procure-to-pay cycle — from par-based replenishment through purchase orders, goods receipt, invoice matching, and accounting export — alongside recipe costing, stock counting, POS menu mapping, and cross-outlet reporting.

### Target Users

| Role | Primary tasks |
|---|---|
| HQ Administrator | Full platform access: market lists, recipes, POS mapping, users, suppliers, approval, reporting |
| HQ Approver | Review and approve high-value orders, recipes, POS mappings; view-only on most admin |
| Outlet Manager | Raise requisitions, receive goods, manage stock counts, view recipes and POS |
| Outlet User | Raise requisitions, receive goods, run stock counts |
| Finance User | Invoice management, 3-way match, Xero export, reporting |
| Supplier User | Nomni Supply portal: view orders, submit e-invoices, manage their catalogue |

Roles are template wrappers over a permission engine of 200+ discrete permissions enforced at the API layer. Scope is set per outlet group (Brand → Region → State → Outlet).

### Operating Modes

Each venue group runs in one of three modes:

- **HQ Mode** — all market lists, recipes, and POS mappings are governed centrally; outlets have read-only views
- **Hybrid** — outlets can raise orders and run counts; HQ controls pricing and recipes
- **Standalone** — individual outlet operates independently (shown as "Ungrouped" in Venues)

### Organisational Hierarchy

HQ → Brand → Region → Outlet Group → Outlet

The prototype shows 124 outlets across four outlet groups: NSW Metro (38), VIC Metro (29), QLD Coastal (32), SA&WA (25). The Venues screen shows a smaller 12-venue demo dataset (CBD Cluster / Beachside / Suburban / Ungrouped) with the same structural model.

### Buyer-Primary Item Model

Internal buyer item names (e.g. "Chicken Breast 500g") are the canonical identity. Each item maps to one or more supplier-specific `supplierItem` names and `supplierSku` codes. Ordering, recipes, inventory, and POS all reference the buyer name; supplier SKUs are an implementation detail surfaced in the item drawer and order lines.

---

## 2. Information Architecture

### Navigation (shell.js v5)

The persistent left-side shell nav renders the following items:

| Nav item | Screen(s) | Access |
|---|---|---|
| Overview | `dashboard.html` | All roles |
| Market lists | `market-list.html` | HQ roles |
| Items | `items.html`, `new-item.html` | HQ roles |
| Recipes | `recipes.html`, `recipe-detail.html`, `outlet-recipes.html` | All roles |
| Orders | `orders.html`, `order-detail.html`, `new-order.html` | Ordering roles |
| Inventory | `inventory.html`, `count-session-detail.html`, `count-sheet.html`, `spot-count.html`, `new-count-session.html` | Ordering roles |
| Invoices | `invoices.html`, `invoice-detail.html` | HQ Admin, Finance |
| POS mapping | `pos-mapping.html` | HQ roles |
| Reporting | `reporting.html` | HQ Admin, HQ Approver, Finance, Outlet Manager (view) |
| Suppliers | `suppliers.html` | HQ Admin |
| Venues | `venues.html` | HQ Admin |
| Users | `users.html` | HQ Admin |

### URL Structure (prototype filenames)

```
/screens/
  dashboard.html
  login.html
  market-list.html
  items.html
  new-item.html
  recipes.html
  recipe-detail.html
  outlet-recipes.html
  orders.html
  order-detail.html
  new-order.html
  inventory.html
  count-session-detail.html
  count-sheet.html
  spot-count.html
  new-count-session.html
  invoices.html
  invoice-detail.html
  pos-mapping.html
  reporting.html
  suppliers.html
  venues.html
  users.html
```

### Role Switcher

A platform-wide role switcher (HQ Admin / Outlet Manager / Finance User) is present in the shell. Switching role changes visible nav items and toggles edit/read-only states throughout all screens.

---

## 3. Feature Specifications

### 3.1 Authentication — `login.html`

**Purpose:** Two-step authentication with enterprise SSO option.

**Flow:**
1. Email + password entry
2. 6-digit MFA code entry
3. Enterprise SSO button (single step)

**Business rules:**
- No password recovery flow shown in prototype
- Session persists via shell.js across all pages

---

### 3.2 Dashboard — `dashboard.html`

**Purpose:** HQ morning brief; single-pane view of platform health across all 124 outlets.

**Screens:** One full-page dashboard (HQ view only).

**Sections:**

- **Agent morning brief strip** — one card per agent (Otto, Vera, Sloan, Mara, Cyrus) showing pending action count and primary suggestion; clicking a card navigates to the relevant module
- **KPI strip** — Revenue, Food Cost %, Invoices pending, Orders pending, POS coverage
- **Pending actions** — list of items requiring HQ attention (approval, review, mapping)
- **Outlet group health** — table of four outlet groups (NSW Metro, VIC Metro, QLD Coastal, SA&WA) with health indicators
- **Top-moving items** — ranked by spend or volume
- **Activity timeline** — chronological log of recent platform events

---

### 3.3 Market Lists — `market-list.html`

**Purpose:** HQ defines and distributes pricing and item lists to outlet groups.

**Screens:** List view with push modal.

**Data displayed:**
- Table columns: Name, Brand, Assigned groups, Last updated, Status (Active / Pending / Draft / Archived)
- Brand hierarchy tree: The Burger Co (24 outlets), Pasta Palace (18), Taco Time (12)

**Flows:**
- **Push to outlet group** — split button with three options: Push to group / Push to selection / Push to all
- Push modal fields: schedule (immediately / scheduled time), conflict resolution (Keep local overrides / Overwrite with HQ values)
- Business rule: a push does not affect in-flight orders

**Agent touchpoints:**
- Sloan surfaces 6 staged price changes from supplier files, pending HQ review before they are pushed

---

### 3.4 Items (Product Catalogue) — `items.html`, `new-item.html`

**Purpose:** The buyer-defined master catalogue — source of truth for ordering, recipes, inventory, and POS.

**Screens:** Category grid view + list view; new item wizard.

**Summary strip (items.html):**
- Total items: 188 across 6 categories
- Supplier linked: 161 (86% of catalogue)
- Need attention: 27 (no preferred supplier)
- Added this month: 14

**Category breakdown:**
| Category | Items | Supplier coverage |
|---|---|---|
| Produce | 47 | 89% |
| Protein | 31 | 97% |
| Dairy | 18 | 100% |
| Dry goods & Bakery | 58 | 76% |
| Beverages | 22 | 91% |
| Cleaning & Supplies | 12 | 58% |

**List view columns:** Name, Category, UOM, Linked suppliers (preferred chip + "+N" overflow), Recipes (count), Assigned groups, Last updated, Actions

**Item detail drawer fields:**
- `internalId`, `buyerName`, category, UOM, sub-category, description
- Supplier SKU table: Supplier, Their SKU (IBM Plex Mono), Order in (pack/UOM), Conv. factor, Last cost, Preferred (radio)
- Par levels per outlet group (inline number inputs)
- Linked recipes (expandable accordion showing recipe name, qty used, link to recipe)
- Drawer footer: Edit item, Manage suppliers

**Row overflow menu:** Edit item, Manage suppliers, Remove item (destructive; shows impact count — recipes, orders, groups)

**New item wizard — `new-item.html`:**

4-step flow: Define item → Link suppliers → Par levels → Done

- Step 1 required fields: Buyer name, Category, UOM; optional: Sub-category, Description
- UOM options: kg, g, lb, L, mL, each, dozen, portion, serve, loaf, bottle, can, carton, bag, box, case
- Step 2: Supplier SKU table (inline editable rows) — fields: Supplier, Their SKU, Order in, Conv. factor, Last cost, Preferred toggle; "Skip for now" allowed
- Step 3: Par levels per group (NSW Metro, VIC Metro, QLD Metro, SA Metro); "Skip & create item" allowed
- Step 4: Done confirmation card — shows Name, Category, UOM, Suppliers linked

**Import:** Bulk import via Excel upload (Download template button provided).

---

### 3.5 Recipes — `recipes.html`, `recipe-detail.html`, `outlet-recipes.html`

**Purpose:** HQ manages the canonical recipe library; outlets view read-only copies.

**Screens:**
- `recipes.html` — HQ recipe library (346 recipes)
- `recipe-detail.html` — full recipe editor with live costing
- `outlet-recipes.html` — outlet read-only view

#### 3.5.1 Recipe Library (`recipes.html`)

**Filter bar:** Search, Category (Breakfast / Mains / Desserts / Beverages / Sides), Brand (The Burger Co / Pasta Palace / Taco Time), Status pills (All / Active / Draft / Archived)

**Table columns:** Name, Category, Brand, Cost ($), Selling price ($), Status (Active / Pending review / Draft / Archived), Locked (ti-lock = Locked by HQ; ti-lock-open = Unlocked)

**Row actions:** View → `recipe-detail.html`, Push (split button), kebab (Edit / Duplicate / Push to outlets / Lock-Unlock / Archive / Delete)

**Import:** Import recipes button (placeholder).

#### 3.5.2 Recipe Detail (`recipe-detail.html`)

**Sample recipe:** Avocado Toast v3, Breakfast, The Burger Co, status Active, locked by HQ.

**Sections:**

- **Basic details** — name, category, brand, description, portions
- **Ingredients** — inline editable table: Ingredient, Qty, UOM, Unit cost, Subtotal; live total cost recalculates on qty change
  - Sample: Sourdough bread 2 slices $0.40, Avocado 1 each $1.80, Feta cheese 30g $0.05/g, Chilli flakes 2g $0.02/g, Olive oil 5ml $0.01/ml = $4.20 total
- **Pricing & margin** — Selling price ($18.00, two-way POS sync), foodCostPct (auto-calc, 23.3%), grossMarginPct (auto-calc, 76.7%), targetMargin (70%)
- **Allergens & nutrition** — Allergens: Gluten, Dairy (propagated to outlets and POS); Nutrition: energy 420 kcal, protein 12g, carbs 38g, fat 24g
- **Lock settings** — toggle: when locked, outlet users cannot edit ingredients or pricing
- **Version history** (accordion) — v3 current, v2 (added feta), v1 (initial); non-current versions have Rollback button
- **Activity timeline** — Recipe locked, Pushed to 42 outlets, Recipe created

**Footer actions:** Push to outlets (split button), Discard, Submit for approval, Save changes  
**Sticky save bar** shows unsaved changes count.

**Agent touchpoints:**
- Mara appears when `grossMarginPct < targetMargin` with three actions: Reprice to target (e.g. $18.90), Rebuild recipe, Re-source

**Business rules:**
- Lock prevents outlet edit of ingredients and pricing
- Allergens and nutrition propagate to outlets and POS on push
- Selling price syncs two-way with POS

#### 3.5.3 Outlet Recipes (`outlet-recipes.html`)

- Info banner: "Recipes managed by HQ. Contact your administrator to request changes."
- Page subtitle: "Read-only view — managed by HQ"
- Table columns: Name (expandable chevron), Category, Cost, Selling price, Status, Managed by (HQ badge)
- Expanding a row shows: ingredient name, qty, allergens, nutrition
- No edit or push actions available
- All recipes show "Managed by HQ" lock badge

---

### 3.6 Orders — `orders.html`, `order-detail.html`, `new-order.html`

**Purpose:** Full procure-to-pay cycle from purchase requisition through PO to goods receipt.

**Screens:**
- `orders.html` — list of PRs and POs with spend control
- `order-detail.html` — full PO detail with timeline, GRN, comms, invoice
- `new-order.html` — 4-step order creation wizard

#### 3.6.1 Orders List (`orders.html`)

**Two tabs:** Requisitions (PR) and Purchase Orders (PO)

**PR statuses:** Needs HQ review, Routed → N POs

**PO statuses:** Needs manager, Sent, Opened, Confirmed, Delayed, Received, Discrepancy

**Spend control bar** (top of page): monthly budget with a soft limit marker at 90%; bar turns amber when approaching limit.

**HQ-only controls:**
- Attention bar — surfaces PRs needing review
- Consolidate button — merges cross-outlet orders for volume pricing

**Agent touchpoints:**
- Otto drafts requisitions from par levels
- Vera flags spend anomalies on the order list

#### 3.6.2 Order Detail (`order-detail.html`)

**Layout:** Full-page with lifecycle timeline at top, then four tabs: Details, GRN, Comms, Invoice.

**PO data structure:**
```javascript
{
  id, supplier, outlet, outletAddr,
  value, expected, created, createdBy,
  approval,        // 'auto' | 'manager'
  status,
  sentAt, openedAt, confirmedBy, confirmedVia, confirmedAt,
  deliveredAt, receivedAt, daysOverdue, discLines,
  items: [{ name, supplierItem, supplierSku, cat, uom, qty, unit, recv, batch, dmg }],
  grn: { receivedBy, temp, note },
  invoice: { id, status, amount, method },
  comms: [{ dir, from, time, body, attach }],
  activity: [{ tone, icon, text, time }]
}
```

**Lifecycle timeline states:** Created → Sent → Opened → Confirmed → [Delivered] → Received  
**Risk states:** Delayed, Discrepancy

**GRN tab fields:** receivedBy, temperature, note; per-item: qty ordered, qty received (`recv`), batch, damaged (`dmg`)

**Comms tab:** Thread of messages between outlet and supplier (direction `dir`, sender `from`, timestamp, body, attachment)

**Invoice tab:** Linked invoice ID, status, amount, payment method

#### 3.6.3 New Order Wizard (`new-order.html`)

**4 steps:** Setup → Items → Review → Done

**Step 1 — Setup:** Order type (PR or PO), outlet selector

**Step 2 — Items:** Three source tabs:
- Otto suggestions (par-based replenishment)
- From market list
- Re-order (repeat previous)

**Otto suggestions data:**
```javascript
const OTTO = [{ name, supplierItem, supplierSku, qty, unit, cat, uom, par: bool }];
```

**Category-to-supplier routing:**
```javascript
const CAT_SUPPLIER = {
  Proteins: 'Harbour Meats',
  Produce: 'Fresh Produce Co',
  // ...
};
```

**Supplier delivery schedules:**
```javascript
const SUPPLIER_SCHEDULES = {
  'Harbour Meats': { days: [1, 3, 5], cutoff: 15 },
  // ...
};
```

**Approval rule:** PO ≤ $500 → auto-approved; PO > $500 → requires manager approval.

---

### 3.7 Inventory — `inventory.html`, `count-session-detail.html`, `count-sheet.html`, `spot-count.html`, `new-count-session.html`

**Purpose:** Stock counts, variance tracking, transfers, and waste logging.

#### 3.7.1 Inventory List (`inventory.html`)

**Four sub-tabs:** Stock counts, Variance, Transfers, Waste

**Count sessions KPI strip:** Active sessions, Last COGS, Network variance, Pending approval

**Item master table columns:** Name, Category, UOM, Par level, Linked suppliers, Assigned groups, Last updated

**Item detail drawer** (same PIM as items.html): internalId, buyerName, category, UOM, supplierSKU table, parLevels per group

**Bulk import:** Excel upload with validation report

**Variance panel:** Bar chart per item vs network average; Vera flags items with variance > 2× network average

**Transfers sub-tab columns:** Item, From → To, Qty, Stage (Dispatched / Awaiting approval / Received)

**Waste sub-tab columns:** Item, Outlet, Qty, Reason (Spoilage / End of day / Expired), Cost

#### 3.7.2 Count Session Detail (`count-session-detail.html`)

**Sample:** CS-002, Newtown, Week ending 8 Jun 2026, Full count.

**Session fields:** Period, Outlet, Type, Created by, Created, Submitted

**Sheet cards:** Dry Store, Freezer, Bar, FOH — each showing cadence badge (Weekly / Monthly), assignee, submitted status

**Variance by category table:** expandable rows showing $ and % variance per category

**COGS Summary aside:**
```
Opening stock
+ Purchases
− Closing stock
= Actual COGS  vs  Theoretical COGS
```

**Actions:** "Approve & lock" (posts COGS to ledger), "Request re-count"

**Status lifecycle:** Pending approval → Locked

#### 3.7.3 Count Sheet (`count-sheet.html`)

**Sample:** CS-003, Bar area, Surry Hills, Week ending 15 Jun 2026, assigned to Sarah Kim.

**Items data structure:**
```javascript
{ id, name, cat, uom, expected, count /* null = not yet counted */ }
```

**Filter tabs:** Not yet counted, All, Variance

**Variance chips:**
- `ok` (green) — diff = 0 (Exact)
- `warn` (amber) — diff > 0 and pct < 20% (Over)
- `risk` (red) — diff > 0 and pct ≥ 20% (Over +X%)
- `warn` (amber) — diff < 0 (Under)

**Progress badge:** "7 / 14 items counted"

**Submit behaviour:** Warns if uncounted items exist; uses last known stock for any uncounted items.

#### 3.7.4 Spot Count (`spot-count.html`)

**Purpose:** Ad-hoc count with immediate stock level update; no period close, no COGS posting.

**2-step wizard:** Select scope → Count items → Done

**Scope options:**
- By sheet (checkboxes: Dry Store 24 items, Freezer 18, Bar 31, FOH 12)
- By category (Proteins, Produce, Dairy, Beverages, Dry goods, Cleaning)
- Specific items (typeahead search)

**Required fields:** Outlet, Counter name; optional: Notes

**Partial counts allowed** — only counted items are updated.

**On submit:** Vera agent shown as "Analysing spot count against theoretical usage…"

**Done screen:** "Stock levels updated for 14 items at Surry Hills · Bar"

#### 3.7.5 New Count Session (`new-count-session.html`)

**3-step wizard:** Session setup → Configure sheets → Review & confirm

**Step 1 fields:** Outlet (required), Count type (Full count / Spot count), Period type (Weekly / Fortnightly / Monthly / Custom), Period ending (date), Notes

**Count type distinction:**
- Full count — closes period, posts COGS to ledger
- Spot count — updates stock levels only, no period close

**Default sheets configuration:**
```javascript
[
  { name: 'Dry Store', cadence: 'Weekly',  required: true,  assignee: 'Keith Tan' },
  { name: 'Freezer',   cadence: 'Weekly',  required: true,  assignee: 'Keith Tan' },
  { name: 'Bar',       cadence: 'Weekly',  required: true,  assignee: 'Sarah Kim' },
  { name: 'FOH',       cadence: 'Monthly', required: false, assignee: 'Sarah Kim' },
]
```

**Sheet config table columns:** Include (checkbox), Sheet name, Cadence (select), Required (toggle — shows "carry-forward if skipped" hint when optional), Assignee

**Summary box:** Sheet count, Required breakdown, Estimated time (45–60 min)

**Success message:** "CS-004 has been created and assignees notified"

---

### 3.8 Invoices — `invoices.html`, `invoice-detail.html`

**Purpose:** Finance accounts payable — receive, match, approve, and export invoices.

#### 3.8.1 Invoice List (`invoices.html`)

**KPI tiles:** All invoices, No PO linked (warn), Pending match, Match failed (risk), Approved (ok), Exported (agent)

**Period switcher:** Last 7 days / Last 30 days / Last 90 days / All time

**Invoice statuses:** unlinked, pending, matched, failed, approved, exported

**Invoice sources:** Supplier email, Outlet upload, Nomni Supply (electronic EDI)

**Bulk actions:** Approve selected (for matched invoices), Export to Xero (for approved invoices)

**Xero integration chip** in header: connected, last export 2h ago, Settings link

**Cyrus agent summary** with dynamic chips: unlinked count, failed count, ready to export, matching in progress

#### 3.8.2 Invoice Data Structure

```javascript
{
  id, po, supplier, outlet,
  date, source,            // 'email' | 'upload' | 'nomni'
  amount, status,          // 'unlinked' | 'pending' | 'matched' | 'failed' | 'approved' | 'exported'
  agentNote, failReason,
  lines: [{ name, uom, poQty, grnQty, invQty, poPrice, invPrice }],
  suggestion: { po, supplier, amount, date, confidence, reason },  // for unlinked
  exportedTo, exportedAt, exportedRef
}
```

**3-way match logic:**
- Pass: `poQty === grnQty` AND `poPrice === invPrice` (per line)
- Fail: any line with qty or price variance
- Pending: GRN not yet submitted (`grnQty === null`)

**Unlinked invoice handling:**
- If Cyrus has a high-confidence suggestion → show suggested PO with Confirm button and confidence chip (High/Medium)
- If no suggestion → manual PO link input field

**Failed invoice actions:** Raise credit note, Flag for follow-up

#### 3.8.3 Invoice Detail (`invoice-detail.html`)

**Layout:** Split pane — document viewer (left 44%) + data panel (right).

**Document pane:** Renders the source document in context:
- Email invoices → styled email card + paper invoice mock
- Upload invoices → PDF wrapper label + paper invoice mock
- Nomni Supply invoices → Nomni receipt card (green "Received electronically via Nomni Supply" badge)

**Document viewer controls:** Zoom in/out, percentage display, Fit button

**Top bar:** Back to Invoices, invoice ID + supplier name, Prev/Next navigation buttons

**Data pane sections:**
- Invoice header (ID, status pill, source badge, Cyrus agent note)
- KV metadata: Supplier, Outlet, Date, Due date (calculated from payment terms), PO reference, Source
- 3-way match banner (pass / fail / pending) with Cyrus byline
- 3-way match table per line: Item, UoM, PO qty, GRN qty, Inv qty, PO price, Inv price, Result
  - Passing lines: green row tint
  - Failing lines: red row tint, failing values in risk red
  - Pending lines: neutral tint, values shown as soft italic

**Override / edit mode:** Amber banner with reason text area; allows editing invoice-level amount or per-line quantities with audit trail

**Sticky footer actions (context-dependent):**
- unlinked: Confirm PO link
- pending: no action (awaiting GRN)
- matched: Approve invoice
- failed: Raise credit note, Flag for follow-up
- approved: Export to Xero
- exported: no actions (view only)

**Supplier payment terms lookup:** `SUPPLIER_META` maps supplier name to ABN, address, phone, email, bank details, and payment terms (NET 7 / NET 14 / NET 30). Due date auto-calculated from invoice date + terms.

---

### 3.9 POS Mapping — `pos-mapping.html`

**Purpose:** Map internal recipe items to POS menu codes across all outlets.

**Screens:** One list page with push dialogs; outlet read-only banner.

**Health monitor strip (HQ only):** Mapped 312, Partial 14, Unmapped 6, Stale >90d 3

**Filter bar:** Search, Brand, Menu category, Outlet

**Table columns:** Item name, Menu category, POS code (IBM Plex Mono), Variant, Price, Assigned outlets, Mapped status (Mapped / Partial / Unmapped)

**Mapped status pills:**
- Mapped (ok — green)
- Partial (warn — amber)
- Unmapped (risk — red)
- Stale >90d (implicit risk — surfaced in health strip)

**Push actions:**
- Per-row Push button → overwrite confirm dialog (requires checkbox acknowledgment)
- Push to all → overwrite confirm for full mapping set (124 outlets)

**Sample data:**
| Item | POS code(s) | Variant | Status |
|---|---|---|---|
| Avocado Toast v3 | BRG-001 / BRG-001-L | Regular / Large | Mapped |
| Classic Cheeseburger | BRG-010 / BRG-010-D | Single / Double | Partial |
| Flat White | BRG-050 / BRG-050-L | Regular / Large | Mapped |
| Tiramisu | PST-020 | — | Unmapped |
| Caesar Salad | PST-030 | — | Mapped |

**Activity timeline:** Recent mapping change log.

**Outlet read-only banner:** "Managed by HQ — POS mappings are set centrally and can't be edited here."

**Agent touchpoints:**
- Sloan surfaces new POS items that arrive unmapped and suggests matches with confidence score (e.g. "Tiramisu" → "Tiramisu (Dessert)" at 18 outlets, 96% confidence); actions: Approve mapping, See alternatives, Dismiss

---

### 3.10 Reporting — `reporting.html`

**Purpose:** Cross-outlet performance analytics. **Phase 2 gated** — current build is a preview.

**Gate banner:** "Reporting & Analytics is coming in Phase 2. Preview the dashboard below."

**Filters:** Period (Last 30 days / This week / This month / This quarter), Outlet group, Category

**View switcher:** Chart / Table / Audit

**Pulse hero section (dark background):** All outlets · Last 30 days · LIVE
- Total revenue: $2.4M
- Live COGS: 28.4% ($681k of $2.4M)
- Stock variance: 3.2% ($21,800 unaccounted)
- Theoretical vs actual: 96.8%

**KPI strip:** Top spend item, Highest variance outlet, Recipes in use, Unresolved variances

**Chart view:**
- Stock variance by outlet bar chart — 5% dashed target line; Bondi Beach highlighted at 8.1% (risk)
- Top spend items: Chicken Breast $48.2k, Avocado $31.1k, Feta $22.4k, Sourdough $18.9k, Olive Oil $12.3k

**Table view:** Outlet performance grid — Revenue, COGS %, Variance %, Variance $

**Audit view:** Report audit log (weekly pack generated, Cyrus auto-posted 38 invoices, threshold change, export)

**Ask Nomni:** Natural language query bar with suggested chips; agent anomaly cards (Mara and Cyrus surface insights inline)

**Scheduled report packs:**
- Weekly HQ pack — Mon 6am, 4 recipients
- Monthly board pack — 1st of month, 6 recipients, P&L + trends
- New report pack option (placeholder)

**Data completeness checklist:** Invoice reconciliations (38/42 outlets, 4 pending), Unresolved variances (7), Unmapped POS items (6), POS data sync (Complete), Theoretical consumption (2 outlets pending)

**Outlet drill-down drawer:** Revenue, COGS, Variance KPIs per outlet.

---

### 3.11 Suppliers — `suppliers.html`

**Purpose:** Manage the supplier network, SKU links, and onboarding.

**KPI strip:** Total 38, Active 31, Pending approval 4, Categories 9

**Supplier categories (9):** Meat & Seafood, Produce, Dairy, Dry Goods, Beverages, Bakery, Packaging, Cleaning, Equipment

**Table columns:** Supplier (avatar + name + verified badge), Categories (pills), Contact (email + phone), Venues supplied, Status (Active / Pending / Inactive)

**Verified badge:** `ti-rosette-discount-check-filled` — shown on Sydney Butchers Co., Green Farmers Market, Artisan Bakehouse, Pacific Drinks Wholesale, Clean Pack Solutions

**Sample data:**
| Supplier | Categories | Venues | Status |
|---|---|---|---|
| Sydney Butchers Co. | Meat & Seafood | 8 | Active, verified |
| Green Farmers Market | Produce, Dairy | 12 | Active, verified |
| Artisan Bakehouse | Bakery, Dry Goods | 5 | Active, verified |
| Pacific Drinks Wholesale | Beverages | 12 | Active, verified (Nomni Supply) |
| NSW Seafood Direct | Meat & Seafood | 3 | Pending |
| Clean Pack Solutions | Packaging, Cleaning | 12 | Active, verified |

**Supplier detail drawer fields:**
- Verified badge, rating (e.g. 4.7 stars), delivery info
- Supplier SKU links table: Internal item, Pack/UOM, Price, Lead time (days), Preferred / Fallback pills
- Price benchmark: % vs network median

**Actions:** Benchmark (network price comparison), New RFQ, Add supplier

**Add supplier dialog fields:** Name (required), ABN, Category (required), Contact email

**Row overflow menu:**
- Active suppliers: Edit details, Venue assignments, View orders, Deactivate
- Pending suppliers: Approve, Reject

**Nomni Supply connection:** Pacific Drinks Wholesale shown as connected via Nomni Supply EDI (electronic invoice submission).

---

### 3.12 Venues — `venues.html`

**Purpose:** Organise outlets into venue groups with operating modes; manage procurement contacts.

**Page description:** "Organise outlets by brand, region and state. Each group runs in an operating mode — HQ-governed, Hybrid, or Standalone — and can include a Central Kitchen."

**Venue groups strip:** 4 clickable group cards (All venues, CBD Cluster, Beachside, Suburban) + dashed "New group" card

**Group card data:** Group name, venue count, area/region, Operating mode (HQ Mode / Hybrid / Standalone)

**Table columns:** Venue, Location, Group & mode, Procurement contact, Status (Active / Inactive)

**Operating mode pills:**
- HQ Mode (purple) — `ti-shield-lock`
- Hybrid (amber) — `ti-git-merge`
- Standalone (neutral) — `ti-building-store`

**Central Kitchen badge:** `ti-tools-kitchen-2` CK badge on applicable venues (e.g. Sydney Central Kitchen)

**Sample venues:**
| Venue | Group | Mode |
|---|---|---|
| Sydney Central Kitchen | CBD Cluster | HQ Mode (CK) |
| Darling Street Bistro | CBD Cluster | HQ Mode |
| Bondi Rooftop | Beachside | Hybrid |
| Manly Wharf Bar | Beachside | Hybrid |
| Parramatta Table | Suburban | Hybrid |
| Surry Hills Social | Ungrouped | Standalone (Inactive) |

**Row actions:** Configure (link), overflow (Edit details / Change group / Manage access / Deactivate; Inactive venues show Reactivate)

**Add venue dialog fields:** Venue name (required), Address, Venue group, Procurement contact

**Create group dialog:** Placeholder — "to be wired up".

---

### 3.13 Users — `users.html`

**Purpose:** Manage user accounts, roles, and outlet access scope.

**Summary:** 24 total users — 20 active, 3 invited, 1 suspended

**Table columns:** User (avatar + name + email), Role (badge), Venue access (pills), Last active, Status (Active / Invited / Suspended)

**6 roles:** HQ Administrator, HQ Approver, Outlet Manager, Outlet User, Finance User, Supplier User

**Sample users:**
| User | Role | Venue access |
|---|---|---|
| Keith Tan | HQ Administrator | All venues |
| Jane Liu | HQ Approver | All venues |
| Sarah Okonkwo | Outlet Manager | 4 venues |
| James Nguyen | Outlet User | 1 venue |
| Aisha Patel | Finance User | 2 venues |
| Mia Chen | Supplier User | Invited |

**Invite user dialog fields:** Email, Role, Venue access (All venues / cluster / Select specific)

**Permission matrix:**

| Capability | HQ Admin | HQ Approver | Outlet Mgr | Outlet User | Finance | Supplier |
|---|---|---|---|---|---|---|
| Market lists, Recipes, POS | Full | View | View | View | None | None |
| Approve recipes, mappings, high-value POs | Full | Full | None | None | None | None |
| Raise requisitions & orders | Full | None | Full | Full | None | None |
| Receive goods & stock counts | Full | None | Full | Full | None | None |
| Invoices & 3-way match | Full | View | None | None | Full | None |
| Reports & exports | Full | View | View | None | Full | None |
| Manage users | Full | None | None | None | None | None |
| Supplier catalogue & e-invoices | None | None | None | None | None | Full |

**Note:** Roles are shipped templates over a permission engine of 200+ discrete permissions, enforced at the API layer. Scope is set per outlet group (Brand → Region → State → Outlet).

---

## 4. Data Models

### 4.1 Item (Buyer Item / Catalogue)

```javascript
{
  internalId,      // e.g. "ITM-001"
  buyerName,       // canonical name: "Chicken Breast 500g"
  category,        // "Produce" | "Protein" | "Dairy" | "Dry goods" | "Beverages" | "Cleaning"
  subCategory,     // optional: "Poultry", "Root vegetables"
  uom,             // "kg" | "each" | "loaf" | "bottle" | ... (full list in 3.4)
  description,     // optional free text
  supplierSkus: [
    {
      supplier,
      supplierItem,  // supplier's product name
      supplierSku,   // supplier's SKU code (IBM Plex Mono display)
      orderIn,       // pack/UOM for ordering
      convFactor,    // conversion to internal UOM
      lastCost,      // $ per order unit
      preferred      // bool — only one per item
    }
  ],
  parLevels: {
    // keyed by outlet group name
    'NSW Metro': number,
    'VIC Metro': number,
    // ...
  },
  assignedGroups,  // array of outlet group names
  linkedRecipes,   // count + array of { recipeName, qty }
  lastUpdated
}
```

### 4.2 Purchase Order

```javascript
{
  id,           // "PO-XXXX"
  supplier, outlet, outletAddr,
  value, expected,    // expected delivery date
  created, createdBy,
  approval,           // 'auto' | 'manager'
  status,             // see lifecycle states
  sentAt, openedAt, confirmedBy, confirmedVia, confirmedAt,
  deliveredAt, receivedAt, daysOverdue, discLines,
  items: [{
    name, supplierItem, supplierSku,
    cat, uom, qty, unit,
    recv,   // received qty (GRN)
    batch,  // batch/lot number
    dmg     // damaged qty
  }],
  grn: { receivedBy, temp, note },
  invoice: { id, status, amount, method },
  comms: [{ dir, from, time, body, attach }],
  activity: [{ tone, icon, text, time }]
}
```

### 4.3 Invoice

```javascript
{
  id,           // "INV-XXXXX"
  po,           // "PO-XXXX" or null
  supplier, outlet,
  date, source, // 'email' | 'upload' | 'nomni'
  amount, status,
  agentNote, failReason,
  lines: [{
    name, uom,
    poQty, grnQty, invQty,
    poPrice, invPrice
  }],
  suggestion: {   // populated by Cyrus for unlinked invoices
    po, supplier, amount, date,
    confidence,   // 'high' | 'medium'
    reason
  },
  exportedTo,     // "Xero"
  exportedAt, exportedRef
}
```

### 4.4 Recipe

```javascript
{
  id, name, version,  // e.g. "Avocado Toast v3"
  category, brand, description, portions,
  status,             // 'active' | 'pending review' | 'draft' | 'archived'
  locked,             // bool — HQ lock prevents outlet edit
  ingredients: [{
    ingredient,       // references Item.buyerName
    qty, uom,
    unitCost, subtotal
  }],
  totalCost,          // sum of subtotals
  sellingPrice,       // two-way sync with POS
  foodCostPct,        // auto-calc: totalCost / sellingPrice
  grossMarginPct,     // auto-calc: 1 - foodCostPct
  targetMargin,
  allergens: [],      // propagated to outlets and POS on push
  nutrition: { energy, protein, carbs, fat },
  versionHistory: [{ version, description, date, author }],
  activity: [{ text, time }]
}
```

### 4.5 Count Session

```javascript
{
  id,           // "CS-XXX"
  outlet, period, periodEnding,
  type,         // 'Full count' | 'Spot count'
  createdBy, created, submitted,
  status,       // 'Pending approval' | 'Locked'
  sheets: [{
    name,       // "Dry Store" | "Freezer" | "Bar" | "FOH"
    cadence,    // 'Weekly' | 'Fortnightly' | 'Monthly'
    required,
    assignee,
    submitted
  }],
  varianceByCategory: [{ category, openingStock, purchases, closingStock, variancePct, variance$ }],
  cogs: { openingStock, purchases, closingStock, actualCogs, theoreticalCogs }
}
```

### 4.6 Supplier

```javascript
{
  name, verified,   // bool — shows rosette badge
  categories: [],
  contact: { email, phone },
  abn, address, bank, terms,  // payment terms: 'NET 7' | 'NET 14' | 'NET 30'
  rating,
  venuesSupplied,
  status,           // 'Active' | 'Pending' | 'Inactive'
  skuLinks: [{
    internalItem,   // references Item.buyerName
    packUom, price, leadTimeDays,
    preferred       // 'Preferred' | 'Fallback'
  }],
  priceBenchmarkPct  // % vs network median
}
```

### 4.7 Venue / Outlet

```javascript
{
  name, address,
  group,          // "CBD Cluster" | "Beachside" | "Suburban" | null (Ungrouped)
  operatingMode,  // 'hq' | 'hybrid' | 'standalone'
  isCentralKitchen,
  procurementContact,
  status          // 'Active' | 'Inactive'
}
```

### 4.8 User

```javascript
{
  name, email, avatar,
  role,           // one of six role types
  venueAccess,    // 'all' | group name | array of outlet names
  lastActive,
  status          // 'Active' | 'Invited' | 'Suspended'
}
```

---

## 5. Agent Features

All five agents share a common state model: `proposed` → `needs-you` → `done` | `stepped-back`.

Agents appear in:
- Dashboard morning brief strip (all five)
- Contextual surfaces within their module (inline cards, banners, drawers)
- Reporting "Ask Nomni" section (Mara, Cyrus)

---

### 5.1 Otto — Ordering Agent

**Domain:** Purchase Requisitions, par-based replenishment

**Capabilities:**
- Drafts requisitions based on current stock vs par levels
- Suggests order quantities per item: `{ name, supplierItem, supplierSku, qty, unit, cat, uom, par: bool }`
- Routes items to correct supplier by category (`CAT_SUPPLIER` map)
- Respects supplier delivery schedules (`SUPPLIER_SCHEDULES` — days of week + cutoff hour)
- Surfaces on new-order Step 2 as the default "Otto suggestions" tab

**States shown in prototype:**
- Morning brief: "N requisitions drafted — ready to review"
- Order list: drafted PRs attributed to Otto

---

### 5.2 Vera — Variance Agent

**Domain:** Inventory variance, spend anomaly detection

**Capabilities:**
- Flags items with stock variance > 2× the network average
- Surfaces anomalies on the Inventory variance panel (bar chart highlight)
- Monitors spend on order list — flags unusual order values
- Analyses spot count results against theoretical usage: "Analysing spot count against theoretical usage…" (shown on spot-count Done screen)

**States shown in prototype:**
- Inventory: agent strip at top of page with active flag count
- Reporting: anomaly card "Bondi Beach variance 2.5× average"

---

### 5.3 Sloan — Governance Agent

**Domain:** Price changes, POS mapping, supplier file processing

**Capabilities:**
- Processes incoming supplier price files and stages changes for HQ review
- Market list: surfaces 6 staged price changes pending HQ approval before push
- POS mapping: detects new unmapped POS items and suggests matches
  - Example: "Tiramisu" arrived from POS unmapped → 96% confidence match to "Tiramisu (Dessert)" at 18 outlets
  - Actions: Approve mapping, See alternatives, Dismiss

**States shown in prototype:**
- Market list: agent card with staged change count
- POS mapping: full suggestion card with confidence chip and outlet count

---

### 5.4 Mara — Margin Agent

**Domain:** Recipe costing, margin monitoring

**Capabilities:**
- Monitors `grossMarginPct` against `targetMargin` on every recipe
- Surfaces when `grossMarginPct < targetMargin` on recipe detail page
- Offers three remediation actions: Reprice to target price (calculated), Rebuild recipe, Re-source ingredients

**States shown in prototype:**
- Recipe detail: inline agent surface below Pricing & margin section
- Reporting: anomaly card calling out Bondi Beach food cost variance

---

### 5.5 Cyrus — Invoice Agent

**Domain:** Invoice processing, 3-way match, Xero export

**Capabilities:**
- Extracts line items from supplier email invoices
- Runs 3-way match: PO qty = GRN qty = Invoice qty AND PO price = Invoice price
- Auto-matches invoices to POs based on supplier, amount, timing
- Surfaces high/medium confidence PO suggestions for unlinked invoices
- Flags failed matches with specific failure reason (qty variance or price variance)
- Manages Xero export queue for approved invoices

**3-way match logic:**
- Per line: `pass` if `grnQty === invQty` AND `poPrice === invPrice`; `fail` otherwise; `pending` if `grnQty === null`
- Invoice result: `pending` if all lines pending; `fail` if any line fails; `pass` if all lines pass

**States shown in prototype:**
- Invoices list: agent summary bar with chip counts
- Invoice detail: Cyrus byline on match banner, agent note in data panel, per-line result in 3-way table
- Reporting: "3 outlets haven't reconciled invoices" anomaly card

---

## 6. Design System

### 6.1 Technology

- **Nomni Design System v1.6.0**
- `tokens.css?v=3` — design tokens (colours, spacing, typography, radii, shadows)
- `components.css?v=3` — shared component styles
- `shell.js?v=5` — persistent navigation shell, role switcher, init hook

### 6.2 Typography

| Use | Font | Weight |
|---|---|---|
| UI text, headings, body | Hanken Grotesk | 400, 600, 700 |
| Tabular / SKU / monetary data | IBM Plex Mono | 400, 600 |

Page titles: 35px / weight 700 / tracking -0.025em  
Section headings: 16–18px / weight 700  
Body text: 13–14px  
Labels / eyebrows: 11px / weight 600–700 / uppercase / tracking 0.06–0.08em

### 6.3 Colour Tokens (selected)

| Token | Usage |
|---|---|
| `--text-accent` / `--spinach` / `--fern` | Brand green; primary actions, links |
| `--mint` | Light green background; ok states, agent glow |
| `--status-ok-bg` / `--status-ok-fg` | Green pill backgrounds and text |
| `--status-warn-bg` / `--status-warn-fg` | Amber warnings |
| `--status-risk-bg` / `--status-risk-fg` | Red/pink risk states |
| `--status-info-bg` / `--status-info-fg` | Blue informational |
| `--procurement` | Purple — procurement mode badge |
| `--pos` | Blue — POS-related indicators |
| `--ordering` | Amber — ordering mode badge |
| `--surface` | Card / panel background |
| `--surface-soft` | Page background, subdued surfaces |
| `--border` | Default border |
| `--border-focus` | Input focus ring |
| `--agent-border` / `--agent-glow` | Agent surface ring: `rgba(42,200,100,0.35)` / `rgba(42,200,100,0.07)` |

### 6.4 Spacing Scale

Tokens: `--space-xs`, `--space-sm`, `--space-md`, `--space-lg`, `--space-xl`, `--space-2xl`, `--space-3xl`, `--space-5xl`  
Control height: `--control-h`

### 6.5 Key UI Patterns

**Agent surface card:**
- Background: `--surface-soft`
- Border: 1px solid `--agent-border` (green at 35% opacity)
- Box shadow: 4px glow at `--agent-glow` (green at 7%)
- Agent avatar chip with name and state badge

**Status pills:** Inline-flex with coloured dot pseudo-element (`::before`), radius `--radius-pill`

**Drawers:** Fixed right panel, 520px wide, 22% ease transform slide-in, backdrop overlay at `rgba(14,55,39,0.25)`

**Split pane (invoice detail):** 44% document pane / flex-1 data pane; full viewport height; internal scroll per pane

**Data tables:** `border-collapse: collapse`; `11px` uppercase thead; row hover `--surface-soft`; monetary cells use `font-feature-settings: 'tnum' 1`

**Overflow menus:** Absolute-positioned dropdown on `.overflow-wrap` parent; destructive items in `--status-risk-fg`

**Wizard steppers:** Step dot (28px circle) with active (primary green fill) and done (ok bg + ok fg checkmark) states; step-line connectors

**Split buttons:** Primary action + dropdown chevron for secondary options (used on Push, order creation)

**Icons:** Tabler Icons (`ti-*` class prefix) throughout

### 6.6 Responsive Breakpoints

- `≤ 900px` — 2-column grids collapse from 3–4 columns
- `≤ 768px` — page headers stack vertically, group strips wrap
- `≤ 600px` — single column layouts
- `≤ 480px` — filter bars stack vertically

---

## 7. Out of Scope / Future Work

### Phase 2 (explicitly gated in prototype)

- **Reporting & Analytics module** — full cross-outlet dashboard is preview-only; blocked by Phase 2 gate banner
- Scheduled report packs (Weekly HQ pack, Monthly board pack) — UI shown but delivery mechanism not built

### Placeholder / Not Wired Up

- Create group dialog in Venues (`alert('Create group dialog — to be wired up')`)
- Import recipes button (no upload flow built)
- Download template / Import items (toast-only, no actual file handling)
- Reporting "Ask Nomni" query bar (chips shown, no backend)
- New RFQ flow in Suppliers (button present, no wizard)
- Outlet drill-down drawer in Reporting (structure shown, data not live)

### Not Shown in Prototype

- Notification / alert centre
- Mobile / responsive app shell (all screens are desktop-first)
- Supplier portal full flow (Supplier User role implied but no dedicated supplier-facing screens)
- PO amendment / change order flow
- Contract management
- Budget setting and forecasting UI
- Integration configuration screen (Xero settings linked from invoice header but screen not built)
- Offline / service worker behaviour

---

## 8. Open Questions

1. **Approval threshold** — $500 is hardcoded in the prototype (`approval: 'auto'` for ≤$500, `'manager'` for >$500). Is this configurable per outlet group or globally?

2. **Nomni Supply onboarding** — Pacific Drinks Wholesale is the only supplier shown with an active EDI connection. What is the supplier onboarding flow for Nomni Supply? Is there a separate supplier-facing portal?

3. **Variance threshold for Vera** — the prototype shows >2× network average as the flag threshold. Is this configurable at the HQ level per category?

4. **COGS posting** — "Approve & lock" is described as posting COGS. What is the downstream system? Is this Xero, or a separate COGS ledger?

5. **Market list conflict resolution** — the push modal offers "Keep local overrides / Overwrite with HQ values." What exactly counts as a local override? Are these tracked per item or per market list?

6. **Recipe version rollback** — the Rollback button is present on v1 and v2. What happens to in-flight orders and active POS mappings when a recipe is rolled back?

7. **POS sync two-way** — selling price on recipes is described as a "two-way POS sync." What POS systems are supported, and at what cadence does the sync run?

8. **Stale POS mapping** — the health strip shows "Stale >90d" as a distinct state. What triggers a mapping to become stale — is it time-based, or tied to a POS menu change event?

9. **Consolidated orders** — the "Consolidate" button on the HQ orders view merges cross-outlet orders for volume pricing. What is the consolidation logic — by supplier, by category, by delivery date?

10. **Central Kitchen model** — Sydney Central Kitchen has a CK badge and is in HQ Mode. Does the Central Kitchen model imply a specific procurement flow (e.g. CK orders in bulk, distributes to outlets via transfers)?

11. **Reporting Phase 2 scope** — the prototype shows charts, a table view, and an audit log. Are the full interactive charts and the "Ask Nomni" AI query bar both Phase 2, or is only the AI query Phase 2?

12. **Multi-brand market lists** — the market list table shows Brand as a column and the hierarchy tree shows three brands. Can a single market list span multiple brands, or is each list brand-scoped?
