# Nomni Procure — Product Requirements Document

**Version:** 3.0  
**Last updated:** 23 Jun 2026  
**Status:** Design-validated — ready for backend estimation  
**Source:** Derived from 44 HTML prototype screens in `/screens/`  
**Live prototype:** https://katosan79.github.io/nomni-procure/  
**Audience:** Backend engineers, API architects, data engineers

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Information Architecture](#2-information-architecture)
3. [Feature Specifications](#3-feature-specifications)
4. [Data Models](#4-data-models)
5. [Agent Layer](#5-agent-layer)
6. [API Surface Summary](#6-api-surface-summary)
7. [Design System](#7-design-system)
8. [Out of Scope / Future Work](#8-out-of-scope--future-work)
9. [Open Questions](#9-open-questions)

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

Each outlet group runs in one of three modes:

- **HQ Mode** — all market lists, recipes, and POS mappings are governed centrally; outlets have read-only views
- **Hybrid** — outlets can raise orders and run counts; HQ controls pricing and recipes
- **Standalone** — individual outlet operates independently (shown as "Ungrouped" in Outlets)

### Organisational Hierarchy

HQ → Brand → Region → Outlet Group → Outlet

The prototype shows 124 outlets across four outlet groups: NSW Metro (38), VIC Metro (29), QLD Coastal (32), SA&WA (25). The Outlets screen shows a smaller 12-outlet demo dataset (CBD Cluster / Beachside / Suburban / Ungrouped) with the same structural model.

### Buyer-Primary Item Model

Internal buyer item names (e.g. "Chicken Breast 500g") are the canonical identity. Each item maps to one or more supplier-specific `supplierItem` names and `supplierSku` codes. Ordering, recipes, inventory, and POS all reference the buyer name; supplier SKUs are an implementation detail surfaced in the item drawer and order lines.

---

## 2. Information Architecture

### Navigation (shell.js v5)

The persistent left-side shell nav renders the following items:

| Nav item | Screen(s) | Access |
|---|---|---|
| Overview | `dashboard.html` | All roles |
| Orders | `orders.html`, `order-detail.html`, `new-order.html` | Ordering roles |
| Invoices | `invoices.html`, `invoice-detail.html` | HQ Admin, Finance |
| Items | `items.html`, `new-item.html` | HQ roles |
| Inventory (+ sub-nav) | `inventory.html` (Operations), `inventory-analytics.html`, `inventory-governance.html`, `count-session-detail.html`, `count-sheet.html`, `spot-count.html`, `new-count-session.html` | Ordering roles |
| Market lists | `market-list.html`, `market-list-detail.html`, `market-list-assign.html`, `market-list-new.html` | HQ roles |
| Recipes | `recipes.html`, `recipe-detail.html`, `recipe-detail-finished.html`, `recipe-detail-prep.html`, `recipe-detail-production.html`, `new-recipe.html`, `import-recipes.html`, `outlet-recipes.html` | All roles |
| POS mapping — Configuration | `pos-mapping.html` | HQ roles |
| POS mapping — Monitoring | `pos-mapping-monitoring.html` | HQ roles |
| Reporting | `reporting.html`, `spend-by-supplier.html`, `supplier-spend-detail.html` | HQ Admin, HQ Approver, Finance, Outlet Manager (view) |
| Outlets | `outlets.html`, `outlet-detail.html`, `outlet-group-detail.html` | HQ Admin |
| Suppliers | `suppliers.html`, `supplier-detail.html` | HQ Admin |
| Users | `users.html`, `user-detail.html` | HQ Admin |
| Brands | `brands.html`, `brand-detail.html` | HQ Admin |
| Settings | `settings.html` | HQ Admin |

### URL Structure (prototype filenames)

```
/screens/                          (45 screens total)
  login.html
  dashboard.html
  orders.html
  order-detail.html
  new-order.html
  invoices.html
  invoice-detail.html
  items.html
  new-item.html
  inventory.html                   ← Operations tab
  inventory-analytics.html         ← Analytics tab (Vera agent, variance heatmap)
  inventory-governance.html        ← Governance tab (Sloan+Otto, count templates, par overrides)
  count-session-detail.html
  count-sheet.html
  spot-count.html
  new-count-session.html
  market-list.html
  market-list-detail.html
  market-list-assign.html
  market-list-new.html
  recipes.html
  recipe-detail.html
  recipe-detail-finished.html
  recipe-detail-prep.html
  recipe-detail-production.html
  new-recipe.html
  import-recipes.html
  outlet-recipes.html
  pos-mapping.html                   ← Configuration (mapping table, drawers, category chart)
  pos-mapping-monitoring.html        ← Monitoring (health bar, attention cards, outlet table + drawer)
  reporting.html
  spend-by-supplier.html             ← Spend & Procurement → Spend by supplier (drill-through from reporting.html)
  supplier-spend-detail.html         ← Individual supplier spend detail (routed via ?s=slug)
  outlets.html
  outlet-detail.html
  outlet-group-detail.html
  suppliers.html
  supplier-detail.html
  users.html
  user-detail.html
  brands.html
  brand-detail.html
  settings.html
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

#### Recipe Type System

Three recipe types exist across the library; all live in the same list:

| Type | Badge colour | Purpose | Selling price | Row action |
|------|-------------|---------|---------------|------------|
| **Finished** | Blue (`#3F8AFB`) | POS-linked menu items sold to customers | Yes (POS synced) | Push split button |
| **Preparation** | Purple (`#B05EC0`) | Sub-recipes and bases used as ingredients in other recipes | None (internal) | Kebab only |
| **Production batch** | Teal (`#17B3A3`) | Bulk-made items that trigger inventory depletion when recorded | None (internal) | "Record production →" link to Inventory |

Recording a production run is handled in the **Inventory** module (same flow as an inventory adjustment), not on the recipe detail page.

#### 3.5.1 Recipe Library (`recipes.html`)

**KPI strip (4 tiles):**
- Total recipes: 346 (across all brands)
- Finished: 320 (POS-linked menu items)
- Preparations: 18 (sub-recipes & bases)
- Production batches: 8 (bulk-made, reduces inventory)

**Filter bar:** Search, Type (All types / Finished / Preparation / Production batch), Category (Breakfast / Mains / Desserts / Beverages / Sides / Sauces & Bases / Stocks & Bases / Bakery), Brand (The Burger Co / Pasta Palace / Taco Time), Status pills (All / Active / Draft / Archived)

**Table columns:** Name (with type badge sub-line), Category, Brand, Cost (with food cost % sub-value, colour-coded), Selling price (— for Preparation and Production), Status, Locked, Actions

**Food cost % colour coding:**
- `< 25%` → green (`--status-ok-fg`)
- `25–32%` → amber (`--status-warn-fg`)
- `> 32%` → red (`--status-risk-fg`)

**Per-type row actions:**
- Finished: View + Push (split button) + kebab (Edit / Duplicate / Push to outlets / Lock-Unlock / Archive / Delete)
- Preparation: View + kebab (Edit / Duplicate / Archive / Delete) — no Push
- Production batch: View + "Record production →" (links to `inventory.html`) + kebab (Edit / Duplicate / Archive / Delete)

**Sample data (visible rows):**
| Name | Type | Cost | FC% | Sell | Status |
|------|------|------|-----|------|--------|
| Avocado Toast v3 | Finished | $4.20 | 23.3% | $18.00 | Active |
| Classic Cheeseburger | Finished | $6.80 | 30.9% | $22.00 | Active |
| Tiramisu | Finished | $3.50 | 25.0% | $14.00 | Active |
| Flat White | Finished | $1.20 | 20.0% | $6.00 | Active |
| Caesar Salad | Finished | $5.10 | 26.8% | $19.00 | Pending review |
| Hollandaise Sauce | Preparation | $1.40 | — | — | Active (used in 4 recipes) |
| Burger Patty Mix | Preparation | $3.20 | — | — | Active (used in 2 recipes) |
| Caesar Dressing | Preparation | $0.85 | — | — | Active (used in 3 recipes) |
| Chicken Stock | Production batch | $0.40/L | — | — | Active (yields 10 L) |
| Brioche Bun Batch | Production batch | $0.75/bun | — | — | Active (yields 48 buns) |

**Import:** Import recipes button (placeholder).

#### 3.5.2 Recipe Detail (`recipe-detail.html`)

**Sample recipe:** Avocado Toast v3, type Finished, Breakfast, The Burger Co, status Active, locked by HQ, v3.

**Layout:** Page header + 4-tile KPI strip + tabbed main panel (1fr) + aside (280px).

**KPI strip (live-calculated):**
- Prime cost: $9.80 (ingredient cost + labour cost)
- Food cost %: 23.3% (ingredient cost only / selling price)
- Selling price: $18.00
- Gross margin: 45.6% ((selling − prime) / selling)

**Tabs: Ingredients | Costing | Outlets | Settings**

---

**Tab: Ingredients**

- *Basic details card* — name, category, brand, description, portions per batch
- *Ingredient list card* — table: Ingredient name, Qty, UOM, Waste %, Adjusted qty, Unit cost, Subtotal
  - Preparation sub-recipes shown with purple `[R]` badge (e.g. Hollandaise Sauce)
  - Waste % is an inline input per row (defaults to 0%)
  - Footer buttons: Add ingredient, Add preparation [R]
- *Method & instructions card* — textarea for method notes, yield, shelf life

---

**Tab: Costing**

- *Ingredient cost card* — line-by-line cost rows, total ingredient cost ($6.25)
- *Labour cost card* — three time inputs (Prep time, Cook time, Plating time) in minutes + Hourly rate ($35/hr); labour total auto-calculated
  - Sample: Prep 15min ($8.75) + Cook 10min ($5.83) + Plating 5min ($2.92) = $17.50 total labour... wait, stored per-recipe labour total is $3.55 at default sample values
- *Prime cost & margin card* — ingredient cost + labour cost = prime cost; selling price input; target food cost % input; three metric tiles: Food cost % (ingredient only), Prime cost %, Gross margin %
  - Food cost % tile goes red when above target
  - Target calculator: "Sell at $X to hit Y% food cost" reverse formula

---

**Tab: Outlets**

- *Outlet assignment card* — same outlet group tree (Brand → Region → Outlet) with toggles; same expand/collapse pattern as other detail pages
- *Outlet selling prices card* — per-outlet table: Outlet, POS synced price (read-only), HQ override input, Effective price
  - Override field: when a value is entered, effective price turns accent colour; when cleared, reverts to POS synced price
  - Business rule: POS synced price is the base; HQ override replaces it; effective price is override if set, otherwise POS synced

---

**Tab: Settings**

- *Lock settings card* — two toggles: "Lock ingredients (outlets cannot edit)" and "Lock pricing (outlets cannot edit selling price)"
- *Allergens card* — 12 allergen checkboxes + 6 dietary checkboxes; inherited allergens (from sub-recipe ingredients) shown with "Inherited" label; propagated to outlets and POS on push
- *Version history card* — v3 (current badge), v2 "Added feta + chilli flakes", v1 "Initial recipe" — non-current versions have Restore button
- *Activity log card* — chronological list of recipe events (recipe locked, pushed to 42 outlets, recipe created)

---

**Aside (280px):**
- *Recipe info card* — type badge, status pill, lock status, portions, outlets count, version, last updated
- *Margin agent card* — Sloan agent surface (green border + glow); shows food cost guidance; "Review costing" CTA; state: "On track" when within target, alert state when above target
- *Danger zone* — Archive recipe (destructive, red)

---

**Page header actions:** Version history (ghost), Duplicate, Push (split button — Push to outlets / Push to group / Push to selection)

**Agent touchpoints:**
- Sloan (Margin agent, renamed from Mara in this screen) appears in aside with food cost status and three remediation actions when over target: Reprice to target, Rebuild recipe, Re-source

**Business rules:**
- Lock prevents outlet edit of ingredients and/or pricing (two separate toggles)
- Allergens inherited from sub-recipe (Preparation) ingredients propagate automatically
- Selling price syncs two-way with POS; HQ override supersedes POS synced price per outlet
- Production runs are recorded in Inventory, not on this screen

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

#### 3.7.6 Actual vs Theoretical Variance Report *(Phase 1 — build next)*

**Purpose:** Close the parity gap with MarketMan and Apicbase. Surface the difference between what recipes say should have been consumed (theoretical) and what stock counts show was actually consumed (actual).

**Trigger:** Computed when a Full count session is approved and locked.

**Formula:**
```
Theoretical consumption = Σ (recipe portions sold × ingredient qty per recipe)
Actual consumption      = Opening stock + Purchases − Closing stock
Variance $              = Actual COGS − Theoretical COGS
Variance %              = Variance $ / Theoretical COGS × 100
```

**Data requirements:**
- Locked HQ recipe (ingredient list + portions) — source of theoretical
- POS unit sales data per outlet per period — multiplies against recipe portions
- GRN-confirmed purchase quantities — adds to opening stock
- Count sheet closing quantities — closes the period

**Variance thresholds (Vera-governed):**

| Range | State | Action |
|---|---|---|
| < 1% | ok | No action |
| 1–2% | warn | Vera flags for outlet review |
| 2–3% | risk | Vera flags for HQ attention |
| > 3% | urgent | Vera escalates to HQ, blocks period close until acknowledged |

**HQ cross-outlet view (new panel on `inventory.html`):**
- Heat map table: Outlet × Category; cell colour = variance tier
- Sort by worst variance %
- Click cell → drill into that outlet's count session detail
- Vera agent strip at top: "N outlets above 2% variance · worst: Bondi Beach at 8.1%"

**Outlet view (`count-session-detail.html`):**
- Existing COGS summary aside updated to show Actual vs Theoretical side by side
- Per-category variance bar chart (already in prototype — wire to live calculation)
- Vera note on session if any category exceeds 2%

**Key competitive advantage:** Because Nomni's recipes are HQ-locked, the theoretical consumption baseline is identical across all outlets using the same recipe version. No competitor can claim this data integrity — outlets in MarketMan can drift their local recipes.

---

#### 3.7.7 Structured Wastage Logging *(Phase 1)*

**Purpose:** Replace the basic waste tab with structured reason codes so Vera can attribute variance root cause.

**Updates to Waste sub-tab (`inventory.html`):**

**Wastage entry fields:**
```javascript
{
  item,           // references Item.buyerName
  outlet,
  qty, uom,
  reason,         // 'Spoilage' | 'Over-portion' | 'Breakage' | 'Theft' | 'End of day' | 'Expired' | 'Other'
  reasonNote,     // optional free text
  cost,           // auto-calc: qty × item.lastCost
  loggedBy,
  loggedAt
}
```

**Updated waste sub-tab columns:** Item, Outlet, Qty, Reason (colour-coded pill), Cost, Logged by, Date

**HQ view:** Aggregated waste by reason code across all outlets — enables chain-wide pattern detection (e.g. if spoilage spikes at 3 outlets in the same week, Vera surfaces this to HQ).

**Reason code colour coding:**
- Spoilage / Expired / End of day → warn (amber) — operational issue
- Over-portion → risk (red) — training issue
- Theft / Breakage → risk (red) — loss issue

**Vera integration:** Wastage reason codes feed Vera's variance root-cause attribution. Vera can distinguish a variance caused by spoilage (supplier quality issue) from over-portioning (staff training issue) from theft (security issue).

---

#### 3.7.8 HQ-Governed Par Levels and Count Templates *(Phase 2)*

**Purpose:** Structural differentiation — no competitor governs par levels and count templates centrally. This feature lets HQ define the inventory operating standard for every outlet.

**HQ par level governance:**
- Par levels set by HQ on Item master (already exists) now become the *default* for every outlet in the group
- Outlet Managers can request a local override; HQ approves or rejects via notification
- Items with outlet-specific overrides shown with amber "Local override" badge in HQ item view
- Governance Agent (Sloan) monitors for par levels set significantly below network average and flags to HQ

**HQ count templates:**
- HQ defines which items appear on each sheet (Dry Store / Freezer / Bar / FOH) across all outlets in a group
- Template specifies: item list, count order (by storage area / alphabetical / by supplier), required vs optional
- Outlets inherit the template when creating a new count session — cannot add or remove items without HQ approval
- HQ can push an updated template to all outlets in a group (same push model as market lists)

**Count template data structure:**
```javascript
{
  templateId,
  outletGroup,   // applies to all outlets in this group
  sheets: [{
    name,        // "Dry Store" | "Freezer" | "Bar" | "FOH"
    cadence,     // 'Weekly' | 'Fortnightly' | 'Monthly'
    required,
    items: [{
      itemId,    // references Item.internalId
      sortOrder,
      countUnit  // may differ from purchase UOM (e.g. count in mL not L)
    }]
  }],
  pushedAt, pushedBy, version
}
```

---

#### 3.7.9 Invoice Agent → GRN Pipeline *(Phase 2)*

**Purpose:** When Cyrus extracts and matches an invoice, the confirmed line items automatically update on-hand inventory stock levels as a GRN — closing the loop between procurement and inventory without manual entry.

**Flow:**
1. Invoice arrives → Cyrus extracts line items (already built)
2. Invoice matched to PO (already built)
3. On invoice approval: Cyrus emits `invoice.approved` event
4. Inventory module receives event → creates auto-GRN for each confirmed line item
5. On-hand quantity updated: `onHand += confirmedQty × convFactor`
6. GRN record created with `source: 'cyrus-auto'` and invoice reference
7. Vera re-evaluates variance with updated on-hand figures

**User-facing change:** GRN tab on `order-detail.html` shows `source: 'cyrus-auto'` rows with a Cyrus agent chip — distinguishable from manually entered GRNs.

**Business rule:** Auto-GRN only fires if `3-way match = pass`. Failed or pending invoices require manual GRN confirmation.

---

#### 3.7.10 Central Kitchen → Outlet Transfers *(Phase 3)*

**Purpose:** Multi-unit groups with a central kitchen need to track inventory dispatched from the CK to individual outlets. MarketMan is the only competitor with a verified transfer feature.

**Transfer flow:**
1. CK staff logs dispatch: item, qty, destination outlet(s), batch/lot
2. Transfer appears in Transfers sub-tab as `status: Dispatched`
3. Outlet staff confirms receipt → status becomes `Received`
4. On receipt: CK on-hand decreases; outlet on-hand increases
5. Transfer cost (at CK production cost) is attributed to the receiving outlet for COGS

**Transfer data structure:**
```javascript
{
  transferId,
  fromOutlet,    // Central Kitchen
  toOutlet,
  item,          // Item.internalId
  qty, uom,
  costPerUnit,   // CK production cost (from Production batch recipe)
  batchRef,      // optional lot/batch reference
  dispatchedAt, dispatchedBy,
  receivedAt, receivedBy,
  status         // 'Dispatched' | 'Awaiting confirmation' | 'Received' | 'Discrepancy'
}
```

---

#### 3.7.11 Dynamic Par Levels via Otto *(Phase 3)*

**Purpose:** Instead of static par levels set by HQ, Otto calculates recommended par levels per outlet per item from rolling 4-week sales cadence — adapting automatically to seasonal demand or outlet volume changes.

**Logic:**
```
Recommended par = (avg daily usage × lead time days) + safety stock buffer
Safety stock    = (max daily usage − avg daily usage) × lead time days
```

Otto surfaces par level adjustment recommendations on the Items page — HQ reviews and applies (same approval model as other Otto suggestions).

---

#### 3.7.12 Inventory Analytics — `inventory-analytics.html` *(Built)*

**Purpose:** Cross-outlet Actual vs Theoretical variance heatmap with Vera agent surfacing.

**Agent present:** Vera (Variance agent) — State: "Needs you"  
Example: "3 outlets above risk threshold — Dry goods at Bondi Beach is 25× the network average."  
CTA: "View heat map". Secondary: "Dismiss".

**KPI strip (4 tiles):**
- Outlets above risk threshold (risk colour if > 0)
- Network avg variance % (warn if elevated vs prior week)
- Unresolved anomalies (items with no log explanation)
- Estimated COGS gap ($)

**Variance heatmap table:**
- Rows: Internal items (Olive Oil 1L, Chicken Breast 500g, Avocado, Feta Cheese, Roma Tomatoes…)
- Columns: Outlets (Bondi Beach, Surry Hills, Newtown, Melbourne CBD, Brisbane CBD…)
- Each cell = variance %, colour-coded by tier: OK (<1%) | Monitor (1–2%) | Risk (2–3%) | Escalate (>3%)
- Escalate cells show triangle icon + value in bold
- Legend in header row

**Filter bar:** Period (This week / Last 2 weeks / Last month), Category, Outlet group

**Backend requirements:**  
`GET /api/v1/variance/heatmap?from=&to=&groupId=` — matrix: items × outlets, each cell = variance%  
`GET /api/v1/variance/summary` — network KPIs: outlets above risk, network avg, unresolved anomalies, COGS gap

**Variance thresholds:**  
`<1%` = OK (green) · `1–2%` = Monitor (amber) · `2–3%` = Risk (pink) · `>3%` = Escalate (dark red)

---

#### 3.7.13 Inventory Governance — `inventory-governance.html` *(Built)*

**Purpose:** HQ tools for count template management, par override approvals, and Otto-driven dynamic par recommendations.

**Agents present:**
1. **Sloan** (Governance agent) — State: "Done / Monitoring"  
   Headline: "2 items have par levels 40%+ below the network average — SA Metro is the outlier"  
   No active CTA (monitoring state).
2. **Otto** (Ordering agent) — State: "Proposed"  
   Headline: "4 par levels are out of step with 4-week sales cadence"  
   Why: Rolling usage × lead time calculation. CTA: "Review suggestions". Secondary: "Dismiss".

**Section 1 — HQ Count Templates:**
- Card grid (one card per outlet group): NSW Metro, VIC Metro, etc.
- Card shows: template name, group + outlet count, active status pill
- Sheet rows per card: sheet name (REQ badge for required), cadence tag (Weekly/Fortnightly/Monthly)
- Card footer: "Last pushed [date]" + "Push to group" button (hq-only)
- HQ-only "New template" button in section header

**Section 2 — Par Override Requests:**
- Cards per pending override request
- Fields shown: item name, outlet group, current par → requested par, reason (free text)
- Actions: "View item" (opens item drawer), "Reject", "Approve [new value]"
- On approval: par level updates, activity logged

**Section 3 — Dynamic Par Recommendations (Otto):**
- Otto-attributed cards per item recommendation
- Formula shown: `(avg daily usage × lead time days) + safety stock buffer`
- Rolling 4-week window
- Actions: "Apply" (updates par), "Dismiss"

**Item drawer** (shared across sections):
- Slide-in drawer with item detail, current par levels per group, activity log
- Edit par level inline
- "Save changes" button

**Backend requirements:**  
`GET /api/v1/count-templates?groupId=` · `POST /api/v1/count-templates` · `POST /api/v1/count-templates/:id/push`  
`GET /api/v1/par-overrides?status=pending` · `POST /api/v1/par-overrides/:id/approve` · `POST /api/v1/par-overrides/:id/reject`  
`GET /api/v1/par-recommendations?outletId=&itemId=`

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

### 3.9 POS Mapping — `pos-mapping.html` + `pos-mapping-monitoring.html`

**Purpose:** Map internal recipe/inventory items to POS PLU codes across all outlets; monitor sync health and coverage.

**Screens:** Two screens with distinct purposes — Configuration and Monitoring. The sub-nav inside POS Mapping links between them.

---

#### 3.9.1 Configuration — `pos-mapping.html`

**Purpose:** Map each POS menu item (PLU) to a recipe, sub-recipe, or inventory item. Scale: ~547 POS items for a 12-outlet chain.

**Layout:** Two-column grid — 320px sticky left panel + scrollable right column.

**Left panel (sticky):**
- 2×2 KPI strip: Total POS Items (547), Mapped (468 · 85%), Unmapped (52), Stale/Partial (27)
- Category coverage horizontal bar chart — one row per menu category (Beverages, Breakfast, Mains, Desserts, Sides, Salads, Specials, Other). Each row shows category name, bar, and % coverage. Colour-coded: ≥90% = green, 75–89% = amber, <75% = red. Category rows are **clickable** — clicking filters the right-column table to that category. Active category highlighted with `--text-accent` tinted background.

**Right column:**
- Filter tabs: All 547 · Unmapped 52 · Partial 16 · Mapped 468 · Ignored 11
- Category filter and status filter are **combined** — both apply simultaneously
- Table columns: Item name, PLU code (IBM Plex Mono), Menu category, Mapped status pill, action
- Every row is clickable → opens the **mapping detail drawer**

**Mapping detail drawer:**
- Fields: Item name, PLU, category, last seen in sales
- "Maps to" target: controlled dropdown (not free-text); type toggle switches between Recipe / Internal Item lists
- Modifier groups: each modifier row uses dropdowns for ingredient and recipe fields
- Outlet Overrides section: same dropdown treatment — target type selector + controlled target dropdown
- Business rule: all mapping targets must be selected from controlled lists; free-text is not permitted

**Mapped status pills:** Mapped (ok) · Partial (warn) · Unmapped (risk) · Ignored (muted)

**Agent touchpoints:**
- Sloan appears as an agent card when new unmapped POS items are detected, proposes matches with confidence score (e.g. "Tiramisu" → "Tiramisu (Dessert)" at 18 outlets, 96% confidence); actions: Approve mapping, See alternatives, Dismiss

**Outlet read-only banner:** "Managed by HQ — POS mappings are set centrally and can't be edited here."

---

#### 3.9.2 Monitoring — `pos-mapping-monitoring.html`

**Purpose:** Operational health check — sync status, coverage gaps, and COGS impact across all outlets. Read-only; no push/config actions.

**Page modes:** HQ View (default, shows all 12 outlets) · Standalone (single outlet connection table).

**Section 1 — System Health Bar (always visible):**
Single-line status summary: dot + "N outlets need attention · X of Y fully synced and mapped" + coloured chips (e.g. "2 dark", "2 mapping gaps"). Shows green/all-clear when no issues.

**Section 2 — Outlets Requiring Attention (HQ only):**
Cards sorted by severity: dark outlets (no POS) → sync failures → mapping gaps. Each card shows:
- 4px severity bar (red for dark, amber for gaps)
- Icon, outlet name, issue description
- **COGS impact line** — explicitly states the downstream consequence on inventory accuracy
- CTA linking to the relevant fix location (`outlet-detail.html` for POS config, `pos-mapping.html` for mapping gaps)

Current issues modelled: Brisbane CBD (dark), Gold Coast (dark), Surry Hills (30/48 mapped, 63%), St Kilda (24/48 mapped, 50%).

**Section 3 — All Outlets table (HQ only):**
Compact 6-column read-only table: Outlet · Group · POS System · Last Sync · Coverage (progress bar + X/48) · Status pill (Full / Partial / Dark). No push buttons. Every row is clickable → opens **outlet detail drawer**.

**Outlet detail drawer (from table row click):**
Width 460px, slides in from right. Content varies by outlet state:

*Connected outlet:*
- POS Connection KV: System, Connection type, Connection ID, Status pill, Last sync, Transactions today
- **14-day daily transaction bar chart** (inline SVG): bars with weekend/weekday opacity encoding, trend polyline, avg reference line, today highlighted
- Mapping Coverage: progress bar + % + status banner (green if full, amber if partial)
- Recent Sync History: last 4 entries (dot + monospace timestamp + note)
- Footer: "Outlet Settings →" (links to `outlet-detail.html`) + "View mapping →" (links to `pos-mapping.html`)

*Dark outlet (no POS):*
- Red "No POS configured" banner with COGS impact explanation
- 0% coverage section
- Footer: "Configure in Outlet Settings →" (links to `outlet-detail.html`) — primary button; note that POS config lives in outlet settings, not here

**Business rule:** POS connection configuration lives exclusively in `outlet-detail.html`. The monitoring drawer is read-only for all config.

**Agent touchpoints:**
- Sloan agent card appears above the attention section when new unmapped items are detected across outlets (same card as in Configuration)

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

**"Full breakdown →" link:** The Spend by supplier chart card on `reporting.html` links to `spend-by-supplier.html`.

---

### 3.10.1 Spend by Supplier — `spend-by-supplier.html`

**Purpose:** Full supplier spend breakdown under Reporting → Spend & Procurement tab. Linked from the "Spend by supplier" chart card on `reporting.html` via "Full breakdown →".

**Period picker:** Segmented button group — Last 30d / This month / Last quarter / YTD / Custom. Custom reveals two date inputs. Active state uses `--seaweed` fill with `--cream` text. This is a new UI pattern distinct from the dropdown used on `reporting.html`.

**Outlet filter:** Dropdown — "All outlets (124)" by default. Filterable.

**KPI strip (4 tiles):** Total spend ($681k), Avg order value ($1,596), Active suppliers (10), Spend concentration (top 3 = 48%)

**Spend concentration bar:** Full-width stacked bar divided into proportional colored segments per supplier. Each segment is clickable → navigates to `supplier-spend-detail.html?s=slug`. Hover: `filter: brightness(0.88)`. Legend below bar with supplier name + %.

**Supplier table columns:** Supplier (avatar + name + category + primary/secondary badge), Spend ($), Orders, Avg order, vs Prior period (delta chip), On-time delivery (progress bar + %), 6-month trend (SVG sparkline), View link (hover-reveal).

**Supplier data (10 suppliers, $681k total):** Harbour Meats $142k · Fresh Produce Co $107k · Italian Food Co $80k · Dairy Australia $66k · Pacific Seafood $60k · Espresso Union $47k · Green Farmers Market $46k · Veg Fresh $46k · Bakery Direct $44k · Aussie Farms $43k.

**Row click:** Entire row navigates to `supplier-spend-detail.html?s=slug`.

**SVG sparklines:** 80×28px viewBox, per-supplier gradient (unique IDs g1–g10 to prevent bleeding). Line colour: teal for up/flat trends, rose for down.

---

### 3.10.2 Supplier Spend Detail — `supplier-spend-detail.html`

**Purpose:** Individual supplier drill-down. Routed via `?s=slug`; JS resolves slug → supplier name/color/initials from `SUPPLIERS` map. Default: `?s=harbour-meats`.

**Breadcrumb:** Reporting → Spend by supplier → [Supplier name]

**Supplier header:** Large avatar (56×56px, supplier color), name, tags (Primary supplier / category / location / last order date), Export button, Supplier profile button.

**Period picker:** Same segmented pattern as `spend-by-supplier.html`.

**Outlet filter:** Same dropdown as parent page.

**KPI strip (5 tiles):** Spend this period, Prior period (comparison baseline), Orders, Avg order value, On-time delivery. Each shows a delta vs prior context line.

**Tabs:** Overview (active) · Orders (stub) · Items (stub)

**Exception callout:** Rose background banner when price exceptions exist in the period. Shows item name, invoiced price, market list price, variance %. "View in price exceptions →" link.

**Monthly spend chart:** SVG area chart, viewBox `0 0 600 190`. Y-axis `y = 150 - (val/30)*120`. Confirmed months: solid teal polyline + filled dots. Current MTD: dashed teal line + open circle. Value labels above each dot (font-size 10). Axis labels font-size 13. Area gradient: `#17B3A3` 18% → 0% opacity.

**Demo data (Harbour Meats):** Jan $18k · Feb $21k · Mar $24k · Apr $22k · May $27k · Jun MTD $30k.

**Spend by outlet panel:** Bar list — outlet name, proportional bar, spend $. Shows top 6 + "Others (N)".

**Top items by spend panel:** Bar list — item name, proportional bar, spend $. Exception items show an amber "exception" badge.

**Recent orders table:** Columns — Order #, Date, Outlets, Items, Total, Status. Row click → order detail. "View all N →" link in panel header.

**SUPPLIERS map (JS, client-side routing):**
```js
const SUPPLIERS = {
  'harbour-meats':       { name:'Harbour Meats',        initials:'HM', color:'#17B3A3', cat:'Proteins',   primary:true },
  'fresh-produce-co':    { name:'Fresh Produce Co',      initials:'FP', color:'#129B41', cat:'Produce',    primary:true },
  'italian-food-co':     { name:'Italian Food Co',       initials:'IF', color:'#B05EC0', cat:'Dry goods',  primary:true },
  'dairy-australia':     { name:'Dairy Australia',       initials:'DA', color:'#3F8AFB', cat:'Dairy',      primary:true },
  'pacific-seafood':     { name:'Pacific Seafood',       initials:'PS', color:'#EE4B87', cat:'Proteins',   primary:false },
  'espresso-union':      { name:'Espresso Union',        initials:'EU', color:'#F5C219', cat:'Beverages',  primary:true },
  'green-farmers-market':{ name:'Green Farmers Market',  initials:'GF', color:'#076715', cat:'Produce',    primary:false },
  'veg-fresh':           { name:'Veg Fresh',             initials:'VF', color:'#F5C219', cat:'Produce',    primary:false },
  'bakery-direct':       { name:'Bakery Direct',         initials:'BD', color:'#F58A19', cat:'Bakery',     primary:true },
  'aussie-farms':        { name:'Aussie Farms',          initials:'AF', color:'#BCBCBC', cat:'Produce',    primary:false },
};
```

---

### 3.11 Suppliers — `suppliers.html`, `supplier-detail.html`

**Purpose:** Manage the supplier network, SKU links, and onboarding.

**KPI strip:** Total 38, Active 31, Pending approval 4, Categories 9

**Supplier categories (9):** Meat & Seafood, Produce, Dairy, Dry Goods, Beverages, Bakery, Packaging, Cleaning, Equipment

**Table columns:** Supplier (avatar + name + verified badge + Nomni Supply badge where applicable), Categories (pills), Order activity (last order date + next expected + frequency badge), Spend YTD ($), Outlets supplied, Status (Active / Pending / Inactive)

**Verified badge:** `ti-rosette-discount-check-filled` — shown on Sydney Butchers Co., Green Farmers Market, Artisan Bakehouse, Pacific Drinks Wholesale, Clean Pack Solutions

#### Nomni Supply Differentiation

Suppliers connected to the Nomni Supply platform are visually distinguished from manually-managed suppliers. The buyer cannot edit certain fields on a Nomni Supply–connected supplier because those fields are maintained by the supplier themselves in their Nomni Supply account.

**Visual indicator:** Small green pill badge with plug icon — "Nomni Supply" — shown in the supplier list row (next to supplier name) and in the supplier detail page header.

**Connected suppliers:** Sydney Butchers Co., Green Farmers Market, Pacific Drinks Wholesale (3 of 38 in demo data)

**Read-only fields on Nomni Supply suppliers (`supplier-detail.html`):**
- ABN — "Verified by supplier on Nomni Supply" lock note
- Bank name, BSB, Account number, Account name — all locked with banner: "Managed by [Supplier] on Nomni Supply — read-only here."

**Nomni Supply connection card** (in aside, supplier detail): Connected since date, Last sync timestamp, explanatory note that supplier-managed fields are kept up to date automatically.

**Sample data:**
| Supplier | Categories | Outlets | Status | Nomni Supply |
|---|---|---|---|---|
| Sydney Butchers Co. | Meat & Seafood | 8 | Active, verified | Yes |
| Green Farmers Market | Produce, Dairy | 12 | Active, verified | Yes |
| Artisan Bakehouse | Bakery, Dry Goods | 5 | Active, verified | No |
| Pacific Drinks Wholesale | Beverages | 12 | Active, verified | Yes |
| NSW Seafood Direct | Meat & Seafood | 3 | Pending | No |
| Clean Pack Solutions | Packaging, Cleaning | 12 | Active, verified | No |

#### Add Supplier — Search-Before-Create

The system enforces a **single canonical record** per supplier. Two buyers purchasing from the same supplier (e.g. John's Premium Meats) must connect to the same shared record — no duplicate records permitted.

**3-step drawer flow:**

**Step 1 — Find:** Mandatory search through the global Nomni supplier directory before creation is allowed.
- Search input — filters against the global directory by name or ABN
- Results list — shows name, ABN, location, Nomni Supply badge, verified badge, "N buyers" count
- Selecting a result sets `asMode = 'existing'` — no profile form required (profile comes from the shared record)
- "Can't find your supplier?" → "Create new" link switches to `asMode = 'new'` and shows the profile form
- Create form fields: Company name, ABN, Category, Contact name, Email, Phone, Website, Address

**Step 2 — Outlets:** Select which outlet groups this supplier will serve (multi-select outlet group tree); if `asMode = 'existing'` a banner shows "Connecting to existing supplier record — your pricing lives in your Market List."

**Step 3 — Confirm:** Review card + confirm action. For existing: shows shared record preview. For new: shows full profile preview.

**Key business rule:** Supplier SKU prices are buyer-specific and live in **Market Lists**, not on the shared supplier record. The same SKU can be sold at different prices to different buyers.

**Actions:** Benchmark (network price comparison), New RFQ, Add supplier

**Row overflow menu:**
- Active suppliers: Edit details, Outlet assignments, View orders, Deactivate
- Pending suppliers: Approve, Reject

---

### 3.12 Outlets — `outlets.html`

**Purpose:** Organise outlets into outlet groups with operating modes; manage procurement contacts.

**Page description:** "Organise outlets by brand, region and state. Each group runs in an operating mode — HQ-governed, Hybrid, or Standalone — and can include a Central Kitchen."

**Outlet groups strip:** 4 clickable group cards (All outlets, CBD Cluster, Beachside, Suburban) + dashed "New group" card

**Group card data:** Group name, outlet count, area/region, Operating mode (HQ Mode / Hybrid / Standalone)

**Table columns:** Outlet, Location, Group & mode, Procurement contact, Status (Active / Inactive)

**Operating mode pills:**
- HQ Mode (purple) — `ti-shield-lock`
- Hybrid (amber) — `ti-git-merge`
- Standalone (neutral) — `ti-building-store`

**Central Kitchen badge:** `ti-tools-kitchen-2` CK badge on applicable outlets (e.g. Sydney Central Kitchen)

**Sample outlets:**
| Outlet | Group | Mode |
|---|---|---|
| Sydney Central Kitchen | CBD Cluster | HQ Mode (CK) |
| Darling Street Bistro | CBD Cluster | HQ Mode |
| Bondi Rooftop | Beachside | Hybrid |
| Manly Wharf Bar | Beachside | Hybrid |
| Parramatta Table | Suburban | Hybrid |
| Surry Hills Social | Ungrouped | Standalone (Inactive) |

**Row actions:** Configure (link), overflow (Edit details / Change group / Manage access / Deactivate; Inactive outlets show Reactivate)

**Add outlet dialog fields:** Outlet name (required), Address, Outlet group, Procurement contact

**Create group dialog:** Placeholder — "to be wired up".

---

### 3.13 Users — `users.html`

**Purpose:** Manage user accounts, roles, and outlet access scope.

**Summary:** 24 total users — 20 active, 3 invited, 1 suspended

**Table columns:** User (avatar + name + email), Role (badge), Outlet access (pills), Last active, Status (Active / Invited / Suspended)

**6 roles:** HQ Administrator, HQ Approver, Outlet Manager, Outlet User, Finance User, Supplier User

**Sample users:**
| User | Role | Outlet access |
|---|---|---|
| Keith Tan | HQ Administrator | All outlets |
| Jane Liu | HQ Approver | All outlets |
| Sarah Okonkwo | Outlet Manager | 4 outlets |
| James Nguyen | Outlet User | 1 outlet |
| Aisha Patel | Finance User | 2 outlets |
| Mia Chen | Supplier User | Invited |

**Invite user dialog fields:** Email, Role, Outlet access (All outlets / cluster / Select specific)

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
  id, name, version,    // e.g. "Avocado Toast v3"
  type,                 // 'finished' | 'prep' | 'production'
  category, brand, description, portions,
  status,               // 'active' | 'pending review' | 'draft' | 'archived'
  locked,               // bool — HQ lock prevents outlet edit
  lockIngredients,      // bool — separate toggle for ingredient lock
  lockPricing,          // bool — separate toggle for pricing lock

  // Ingredient list (Finished and Preparation recipes)
  ingredients: [{
    ingredient,         // references Item.buyerName or another Recipe.name (sub-recipe)
    isSubRecipe,        // bool — true for [R] Preparation type ingredients
    qty, uom,
    wastePct,           // waste % per row (0 default)
    adjustedQty,        // qty × (1 + wastePct/100)
    unitCost, subtotal
  }],
  ingredientCost,       // sum of ingredient subtotals
  yieldQty, yieldUom,   // for Production batch (e.g. 10 L, 48 buns)
  shelfLife,            // optional string

  // Labour cost (Finished recipes)
  labour: {
    prepMins, cookMins, plateMins,
    hourlyRate,         // $/hr
    labourCost          // auto-calc: (total mins / 60) × hourlyRate
  },
  primeCost,            // ingredientCost + labourCost
  targetFoodCostPct,    // user-set target food cost % (ingredient only / sell price)

  // Pricing (Finished recipes only)
  sellingPrice,         // base POS synced price (two-way sync)
  outletPricing: [{     // per-outlet overrides
    outletId,
    posSyncedPrice,     // read-only from POS
    hqOverride,         // nullable — if set, overrides POS synced price
    effectivePrice      // hqOverride ?? posSyncedPrice
  }],
  foodCostPct,          // auto-calc: ingredientCost / effectivePrice
  primeCostPct,         // auto-calc: primeCost / effectivePrice
  grossMarginPct,       // auto-calc: (effectivePrice - primeCost) / effectivePrice

  allergens: [],        // propagated to outlets and POS on push; inherited from sub-recipes
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
  // Shared global record (one per real-world supplier)
  name, verified,     // bool — shows rosette badge
  categories: [],
  contact: { email, phone },
  abn,                // read-only for buyer if nomniSupplyConnected
  address,
  bank: {             // read-only for buyer if nomniSupplyConnected
    bankName, bsb, accountNumber, accountName
  },
  terms,              // 'NET 7' | 'NET 14' | 'NET 30'
  rating,

  // Nomni Supply connection
  nomniSupplyConnected,  // bool — supplier manages their own profile on Nomni Supply
  nomniSupplyConnectedSince,
  nomniSupplyLastSync,

  // Buyer-specific fields (per connected buyer)
  outletsSupplied,
  status,             // 'Active' | 'Pending' | 'Inactive'
  skuLinks: [{        // buyer-specific SKU links and pricing
    internalItem,     // references Item.buyerName
    packUom,
    price,            // buyer-specific price (NOT shared with other buyers)
    leadTimeDays,
    preferred         // 'Preferred' | 'Fallback'
  }],
  priceBenchmarkPct   // % vs network median
}
```

**Key rule:** Supplier SKU prices are buyer-specific and live in buyer Market Lists. The same SKU can be sold at different prices to different buyers. The shared supplier record holds identity and contact information only.

### 4.7 Outlet

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
  outletAccess,   // 'all' | group name | array of outlet names
  lastActive,
  status          // 'Active' | 'Invited' | 'Suspended'
}
```

---

## 5. Agent Layer

### 5.0 Shared design principles

> **Agents execute, humans govern.** Every agent action is: attributable · auditable · reversible.

**Agent state machine:**
```
proposed  → [CTA clicked]  → done (resolved; Undo available for N minutes)
needs-you → [CTA clicked]  → done (resolved; Undo available)
proposed  → [Dismiss]      → stepped-back
needs-you → [Dismiss]      → stepped-back
done      → [Undo]         → proposed | needs-you (original state restored)
```

**Undo windows:** 15 min (ordering), 120 min (invoices), configurable per agent per group (AG-7).

**Agent card anatomy:**
- `.agent-avatar[data-agent="otto|sloan|mara|cyrus|vera"]` — 2-letter initials, colour per agent
- `.agent-state` pill — icon + label (bulb = proposed · triangle = needs-you · check = done · pause = stepped-back)
- Headline (bold)
- Why text (body)
- `.brief-actions` — CTA button (primary), secondary action (ghost), Dismiss (ghost)

**Guardrails (non-negotiable):**

| Code | Rule |
|---|---|
| AG-6 | Every action logged: `AgentAuditEntry` with agentId, rationaleeSummary, inputRefs[], outputRefs[], timestamp |
| AG-7 | Above `autoApplyThreshold` → human approval required. Below → auto-apply with undo window. |
| AG-8 | Agent for Outlet A cannot read or act on Outlet B's data |
| AG-9 | Per-group on/off switch + autonomy thresholds (HQ Admin configurable) |
| AG-10 | Compute cost monitored per group; alert at soft limit; block at hard limit |

**Agent presence by module:**

| Module | Agent | State | Action |
|---|---|---|---|
| Dashboard | All 5 | Daily rotation (Proposed / Needs you) | Approve / Dismiss |
| Orders | Otto | Proposed — "drafted N requisitions" | Approve all N |
| Orders anomaly | Vera | Needs you — spend anomaly | Investigate |
| Invoices | Cyrus | Needs you / Ready to export / All clear | Review / Export |
| Inventory — Analytics | Vera | Needs you — variance outliers | View heatmap |
| Inventory — Governance | Sloan | Done — monitoring | (none) |
| Inventory — Governance | Otto | Proposed — par suggestions | Review suggestions |
| Market List | Sloan | Proposed / Needs you | Push all / Fix mapping |
| Recipes | Mara | Proposed — margin breach list | Reprice / See recipes |
| Reporting | Vera / Cyrus | Proposed — anomaly cards | Drill down |

**Cross-agent event bus (agents communicate via events, not direct calls):**

```typescript
{ type: 'invoice.price_changed'; internalItemId; previousUnitPrice; newUnitPrice; invoiceId }
{ type: 'market_list.propagated'; draftId; outletId; changesApplied }
{ type: 'stock_count.submitted'; countId; outletId; quality: 'full'|'partial'|'estimated' }
{ type: 'order_draft.approved'; draftId; outletId; totalValue }
```

**Dashboard daily brief rotation:** Each agent has 7 variants (Sun–Sat) generated server-side from real data. Brief shape:
```typescript
interface AgentBrief {
  agentId: string;
  state: 'proposed' | 'needs-you';
  headline: string;
  why: string;
  ctaLabel: string;
  ctaAction: string;
  updateTime: string;
}
```

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

**Domain:** Inventory variance, spend anomaly detection, wastage root-cause attribution

**Capabilities (current prototype):**
- Flags items with stock variance > 2× the network average
- Surfaces anomalies on the Inventory variance panel (bar chart highlight)
- Monitors spend on order list — flags unusual order values
- Analyses spot count results against theoretical usage: "Analysing spot count against theoretical usage…" (shown on spot-count Done screen)

**Capabilities (Phase 1 additions — §3.7.6, §3.7.7):**
- Computes Actual vs Theoretical variance per outlet per period on count session lock
- Applies 4-tier variance thresholds: <1% ok · 1–2% warn · 2–3% risk · >3% urgent
- Surfaces HQ heat map of variance across all outlets (worst offenders sorted first)
- Attributes variance root cause from wastage reason codes (spoilage vs over-portion vs theft)
- Blocks period close for outlets with >3% variance until HQ acknowledges
- Chain-wide pattern detection: if the same wastage reason spikes across 3+ outlets in the same week, Vera escalates to HQ as a systemic issue

**Capabilities (Phase 2 addition — §3.7.9):**
- Re-evaluates outlet variance figures after an auto-GRN fires from a Cyrus-approved invoice

**States shown in prototype:**
- Inventory: agent strip at top of page with active flag count
- Reporting: anomaly card "Bondi Beach variance 2.5× average"
- Spot count: "Analysing spot count against theoretical usage…" on Done screen

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

## 6. API Surface Summary

> Scoping reference for backend engineers. All endpoints are REST/JSON unless noted. Auth: Bearer JWT. All timestamps ISO 8601 UTC.

### 6.1 Core entity endpoints

| Resource | Key endpoints | Notes |
|---|---|---|
| Items | `GET /items`, `POST /items`, `GET /items/:id`, `PATCH /items/:id` | Buyer-primary; `internalItemId` is the join key |
| Supplier SKU links | `GET /items/:id/sku-links`, `POST /items/:id/sku-links`, `PATCH /items/:id/sku-links/:linkId` | One preferred per group |
| Market lists | `GET /market-lists`, `POST /market-lists`, `GET /market-lists/:id`, `PATCH /market-lists/:id` | 1:1 with supplier; named after supplier |
| Market list items | `GET /market-lists/:id/items`, `POST /market-lists/:id/items`, `PATCH /market-lists/:id/items/:itemId` | Price, UoM, min qty |
| Suppliers | `GET /suppliers`, `POST /suppliers`, `GET /suppliers/:id` | Status: active/inactive/onboarding |
| Recipes | `GET /recipes`, `POST /recipes`, `GET /recipes/:id`, `PATCH /recipes/:id` | Includes ingredient cost snapshot |
| Recipe versions | `GET /recipes/:id/versions`, `POST /recipes/:id/versions/:versionId/rollback` | Immutable version history |
| Purchase orders | `GET /orders`, `POST /orders`, `GET /orders/:id`, `PATCH /orders/:id` | Lifecycle: draft→submitted→confirmed→partial→received→closed |
| Order line items | `GET /orders/:id/lines`, `PATCH /orders/:id/lines/:lineId` | GRN qty updates here |
| GRNs | `POST /orders/:id/grn`, `PATCH /orders/:id/grn` | Triggers Vera re-eval on count sessions |
| Invoices | `GET /invoices`, `GET /invoices/:id`, `PATCH /invoices/:id` | State: pending→matched/failed→approved→exported |
| Invoice lines | `GET /invoices/:id/lines` | 3-way match result per line |
| Count sessions | `GET /count-sessions`, `POST /count-sessions`, `GET /count-sessions/:id`, `PATCH /count-sessions/:id` | Types: full/rolling/spot |
| Count sheets | `GET /count-sessions/:id/sheets`, `PATCH /count-sessions/:id/sheets/:sheetId` | Per-area item counts |
| Inventory items | `GET /inventory`, `GET /inventory/:itemId`, `PATCH /inventory/:itemId` | On-hand, par level, UoM |
| Par override requests | `GET /par-override-requests`, `POST /par-override-requests`, `PATCH /par-override-requests/:id` | States: pending→approved/rejected |
| Count templates | `GET /count-templates`, `POST /count-templates`, `PATCH /count-templates/:id` | HQ-governed; pushed to outlet groups |
| POS mappings | `GET /pos-mappings`, `POST /pos-mappings`, `PATCH /pos-mappings/:id` | Health states: mapped/stale/unmapped |
| Outlets | `GET /outlets`, `POST /outlets`, `GET /outlets/:id`, `PATCH /outlets/:id` | Groups, mode, CK flag |
| Users | `GET /users`, `POST /users`, `GET /users/:id`, `PATCH /users/:id`, `DELETE /users/:id` | Role-scoped |

### 6.2 Agent endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/agents/briefs` | GET | Daily brief for all agents for the calling outlet; returns `AgentBrief[]` |
| `/agents/briefs/:agentId` | GET | Brief for a specific agent |
| `/agents/:agentId/actions/:actionId/approve` | POST | Execute agent-proposed action (Otto draft approval, Sloan push, etc.) |
| `/agents/:agentId/actions/:actionId/dismiss` | POST | Dismiss agent proposal → `stepped-back` |
| `/agents/:agentId/actions/:actionId/undo` | POST | Undo auto-applied action within undo window |
| `/agents/audit` | GET | Paginated agent audit log (`AgentAuditEntry[]`); filters: agentId, outletId, dateRange |
| `/agents/otto/suggestions` | GET | Otto's current item-level ordering suggestions for the outlet |
| `/agents/vera/variance-heatmap` | GET | HQ-only; cross-outlet variance heatmap data |
| `/agents/sloan/staged-changes` | GET | Pending HQ price changes awaiting approval |
| `/agents/sloan/par-recommendations` | GET | Dynamic par recommendations per item per outlet (requires 4+ weeks sales data) |
| `/agents/mara/margin-alerts` | GET | Recipes currently below target margin |
| `/agents/cyrus/match-queue` | GET | Invoices pending 3-way match or needing manual review |
| `/agents/cyrus/export-queue` | GET | Approved invoices ready for Xero export |

### 6.3 Reporting endpoints

| Endpoint | Description |
|---|---|
| `GET /reporting/summary` | Outlet-level KPI snapshot: total spend, outstanding invoices, pending approvals |
| `GET /reporting/spend-by-category` | Spend breakdown by item category for date range |
| `GET /reporting/top-items` | Top N items by spend, qty ordered, or variance for period |
| `GET /reporting/variance-summary` | Count session variance results per outlet per period |
| `GET /reporting/invoice-reconciliation` | Per-outlet invoice match status and outstanding amounts |
| `GET /reporting/agent-performance` | Count of agent actions by type (auto-applied, approved, dismissed, undone) |

### 6.4 HQ propagation endpoints

| Endpoint | Description |
|---|---|
| `POST /hq/market-lists/:id/push` | Push market list to outlet group(s); body: `{ scope: 'all'|'group'|'selection', groupIds?, outletIds? }` |
| `POST /hq/count-templates/:id/push` | Push count template to outlet group(s) |
| `POST /hq/pos-mappings/push` | Push POS mapping set to outlet group(s) with overwrite confirmation |
| `GET /hq/propagation-status/:jobId` | Poll async propagation job status |
| `POST /hq/recipes/:id/push` | Push locked recipe to outlet group(s) |

### 6.5 Key shared types

```typescript
// Agent brief (Dashboard + agent module cards)
interface AgentBrief {
  agentId: 'otto' | 'vera' | 'sloan' | 'mara' | 'cyrus';
  state: 'proposed' | 'needs-you' | 'done' | 'stepped-back';
  headline: string;
  why: string;
  ctaLabel: string;
  ctaActionId: string;
  updateTime: string;        // ISO 8601
  undoWindowExpiresAt?: string;
}

// Audit entry (all agents)
interface AgentAuditEntry {
  entryId: string;
  agentId: string;
  runId: string;
  outletId: string | null;
  groupId: string | null;
  actionType: string;
  rationaleeSummary: string;
  inputDataRefs: string[];
  outputRefs: string[];
  autoApplied: boolean;
  undoWindowExpiresAt: string | null;
  undoneAt: string | null;
  undoneBy: string | null;
  timestamp: string;
}

// Par override request
interface ParOverrideRequest {
  requestId: string;
  itemId: string;
  outletId: string;
  currentPar: number;
  requestedPar: number;
  reason: string;
  requestedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
}
```

---

## 7. Design System

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

## 8. Out of Scope / Future Work

### Inventory Roadmap

**Built — v3.0 (44 screens):**
- §3.7.1–§3.7.11 Core inventory: count sessions, session detail, count sheet, spot count, new session wizard
- §3.7.12 Inventory Analytics — Vera agent, variance heatmap, COGS trend, top wastage items
- §3.7.13 Inventory Governance — Sloan monitoring, Otto par suggestions, count templates, par override requests, dynamic par recommendations

**Next to build — Backend scoping priority:**
- §3.7.9 Invoice Agent → auto-GRN pipeline (Cyrus approved invoice → on-hand quantity update, Vera re-eval)
- Mobile-first count flow — outlet staff count on mobile; results sync to HQ in real time

**Phase 3 — Strategic moat:**
- §3.7.10 Central Kitchen → outlet inventory transfer module
- §3.7.11 Dynamic par levels via Otto (demand-forecast par from rolling 4-week sales) — prototype shown as "Coming soon" tile

### Phase 2 (explicitly gated in prototype)

- **Reporting & Analytics module** — full cross-outlet dashboard is preview-only; blocked by Phase 2 gate banner
- Scheduled report packs (Weekly HQ pack, Monthly board pack) — UI shown but delivery mechanism not built

### Placeholder / Not Wired Up

- Create group dialog in Outlets (`alert('Create group dialog — to be wired up')`)
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

## 9. Open Questions

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

13. **POS sales data source for theoretical consumption** — §3.7.6 requires POS unit sales per outlet per period. Which POS systems are in scope for Phase 1? Is a manual sales upload fallback required for outlets without a POS integration?

14. **Variance period alignment** — Full count sessions close a period (weekly / fortnightly / monthly). Does theoretical consumption use the same period, or does it use a rolling daily calculation? What happens when a count period is missed?

15. **HQ par level overrides** — §3.7.8 allows outlets to request local par level overrides. Who approves — HQ Admin only, or HQ Approver too? Is there a time limit on override validity (e.g. overrides expire after 90 days)?

16. **Count template versioning** — if HQ updates a count template and pushes it to 50 outlets, what happens to count sessions already in progress at those outlets? Do they use the old template or pick up the new one?

17. **Auto-GRN conflict resolution** — §3.7.9 fires an auto-GRN when Cyrus approves an invoice. If the outlet has already manually entered a GRN for the same PO, does the auto-GRN merge, replace, or create a duplicate?

18. **CK transfer pricing** — §3.7.10 attributes CK transfer cost at the CK production cost. How is production cost calculated for Production batch recipes (e.g. Sourdough Bread Batch)? Does it use the latest ingredient costs from the most recent invoice?

19. **Variance threshold configurability** — the 4-tier thresholds in §3.7.6 (<1% / 1–2% / 2–3% / >3%) are defaults. Are these configurable per outlet group? Per category? Or platform-wide only?

20. **Wastage logging access** — §3.7.7 requires outlet staff to log wastage. Can Outlet User role (lowest outlet access) log wastage, or is it Outlet Manager only?
