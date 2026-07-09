---
name: nomni-hq-module-ui
description: "Build, spec, and review UI screens and components for the Nomni HQ Module using the Nomni Design System (v1.6.0). Use this skill whenever you are designing, generating code, writing specs, or reviewing UI for any Nomni HQ feature — including Market List Assignment, Recipe Management, Inventory Management, POS Mapping, and the Reporting & Analytics dashboard. Also trigger for any task involving Nomni tokens, components, layout, colour, typography, or agent surfaces. If the user mentions HQ module, Nomni UI, design system, or references any feature from the BRD, use this skill immediately."
---

# Nomni HQ Module UI Skill

This skill governs all UI generation, specification, and review work for the Nomni HQ Module
enhancements described in the BRD. Every screen, component, and code snippet **must** be built
from the Nomni Design System — never from raw hex values, invented class names, or screenshots.

---

## 0 · First-read checklist (mandatory)

Before writing a single line of UI code or markup:

1. Build only from documented tokens (`shared/tokens.css`) and this SKILL.md. Never invent a token, component, or class name.
2. Do NOT work from screenshots or the rendered design-system site. Use source files.
3. After generating, self-check against §5 (Non-negotiables) and §6 (Top failure modes).
4. The prototype uses `shared/tokens.css` (ground truth for token values) + `shared/shell.js` (nav shell). All screens must import both.
5. The design system's machine-readable guide is embedded as `<script id="ai-agent-guide" type="text/markdown">` on the live site. The three authoritative artifacts are: `AGENTS.md`, `llms.txt`, and the `#ai-agent-guide` block.

---

## 1 · Design system reference

**Live URL:** https://nomni-design-system-219706529615.australia-southeast2.run.app/#/home  
**Version:** 1.6.0  
**Machine-readable artifacts:** `AGENTS.md`, `llms.txt`, `colors_and_type.css`, `component-library.js`

The system is rendered at runtime from registries. The rendered page is not a source of truth — the source files are.

---

## 2 · Foundations

### 2.1 Colour

Three tiers: Primitives → Semantic aliases (Tier 2) → Components. **Components only touch Tier 2 aliases**, never primitives directly (lint will fail).

**Primary palette**

| Name     | Hex       | Role |
|----------|-----------|------|
| Spring   | `#2AC864` | Fill only — CTA surfaces, chips, panel bg. **NEVER use as text or icon colour on light surfaces.** |
| Fern     | `#129B41` | Default accent text + primary button bg. ~3.6:1 on Porcelain. |
| Spinach  | `#076715` | Deep accent, strokes, links. |
| Seaweed  | `#0E3727` | Primary text (12.8:1 on Porcelain), dark surfaces. |

**Neutrals**

| Name       | Hex       | Role |
|------------|-----------|------|
| Porcelain  | `#FFFFFF` | Cards / panels |
| App cream  | `#F5F2EF` | Product app background |
| Cream      | `#FAF7E9` | Brand cream |
| Mint       | `#E2FFE6` | Light status tint |
| Stone      | `#BCBCBC` | Borders / placeholder |
| Ink        | `#111111` | Darkest neutral |
| Charcoal   | `#353535` | Navigation chrome |

**Key semantic aliases (Tier 2) — always use these in components**

| Token             | Light value  | Role |
|-------------------|--------------|------|
| `--surface`       | Porcelain    | Default card / panel |
| `--surface-soft`  | App cream    | App background / inset |
| `--surface-deep`  | Seaweed      | Dark / inverse surface |
| `--chrome-bg`     | Charcoal     | Persistent nav shell — does NOT flip with theme |
| `--text`          | Seaweed      | Primary text · 12.8:1 |
| `--text-soft`     | Forest 70%   | Secondary text · 6.3:1 |
| `--accent`        | Spring       | CTA surface (fill only) |
| `--text-accent`   | Fern         | Default accent text + primary button |
| `--text-link`     | Spinach      | Links |
| `--border`        | Forest 14%   | Hairlines |

**Status colours (always pair with a word or icon — never colour alone)**

- `ok` = Spinach on Mint
- `warn` = Sun (`#F5C219`)
- `risk` = Rose (`#EE4B87`)
- `info` = Sky (`#3FC3FB`)

**Expressive suite (one per surface, in-product: pictograms only)**

Procurement = Magenta `#B05EC0` · Ordering = Teal `#17B3A3` · POS = Blue `#3F8AFB` · Insights = Rose `#EE4B87`

**Navigation chrome rules**

- Chrome stays Charcoal (dark, operator default). It does NOT flip with light/dark theme.
- Primary button within Charcoal shell → Spring fill, not Fern.
- Primary button within Paper (light) shell → Forest fill; Spring is reserved for one high-intent expressive moment only.
- Tokens: `--chrome-bg`, `--chrome-fg`, `--chrome-fg-soft`, `--chrome-panel`, `--chrome-active`.

**Agent signature**

Agent-touched surfaces wear a **green border + soft green glow** (`--agent-border`, `--agent-glow`). No glow on non-agent surfaces. Named agent (avatar + name) identifies who acted.

**Four agent states (icon + shape + label — never colour alone):**
- **Done** (`--dur-2` · emphasized) — "by [Agent] · Undo" inline. Glow settles, no CTA.
- **Proposed** — suggestion card with Approve / Edit / Reject. Glow active.
- **Needs-you** — human decision required. Shows "Decide" CTA.
- **Stepped-back** — agent paused or offline. Shows "Review proposal".

**AI kit primitives:**
- *The mark* (orb) — "an agent can help here"; appears on Ask bar only.
- *The spark* — "this value was agent-set"; appears beside touched values.
- *Agentic glow* — green border + `--agent-glow` on the card; only on agent-initiated surfaces.
- Work is always attributed to a **named agent** (Sloan, Otto, Cyrus, Mara) — never "the AI".

**Contrast gates (enforced at build)**

| Pair | Ratio | WCAG |
|------|-------|------|
| Seaweed on Porcelain | 12.8:1 | AAA |
| KPI numerics on App cream | 11.9:1 | AAA |
| `--text-soft` on Porcelain | 6.3:1 | AA |
| `--text-accent` (Fern) on Porcelain | 3.6:1 | AA-large |

---

### 2.2 Typography

**Typefaces**

- **Hanken Grotesk** — brand voice; display, headings, UI, body. Google Fonts. Tabular figures on by default.
- **Fraunces 72pt SuperSoft** — accent serif. Maximum one instance per view. Never body.
- **IBM Plex Mono** — token names, code, literal values.

**Weights**

| Weight | Use |
|--------|-----|
| Light 300 | Display only |
| Regular 400 | Body & long-form |
| Medium 500 | UI labels, nav |
| Semibold 600 | Headings, emphasis |
| Bold 700 | The one leading element |

**Type scale**

| Step | Size | Use |
|------|------|-----|
| Display L | clamp(56→120px) | Hero anchors |
| Display S | clamp(32→50px) | Section openers |
| h1 | 35px | Page titles |
| h2 | 24px | Section headings |
| h3 | 20px | Subsection headings |
| h4 | 18px | Body-size, bold — not bigger |
| h5 | 16px | Dense card/table headings |
| h6 | 14px | Smallest heading / labels |
| Body | 18px | Default reading |
| Small | 14px | Helper, secondary |
| Caption | 13px | Metadata, timestamps |
| Overline | 12px upper | Tracked label above title |
| Eyebrow | 14px upper | Labels above title |

**Numerals rule:** Anything in a table, KPI, or figure uses **tabular figures**. Proportional figures for running prose only.

---

### 2.3 Spacing & Layout

**Scale tokens (8-based, t-shirt names)**

| Token | Value |
|-------|-------|
| `--space-xs` | 4px |
| `--space-sm` | 8px |
| `--space-md` | 12px |
| `--space-lg` | 16px |
| `--space-xl` | 24px |
| `--space-2xl` | 32px |
| `--space-3xl` | 48px |
| `--space-4xl` | 64px |
| `--space-5xl` | 96px |

Never use raw pixel values. Within a card: 12px between label/value → 24px between tiles → 32–48px between sections.

**Content measure (`data-measure` on `.napp-canvas`)**

| Token | Value | Use |
|-------|-------|-----|
| `--measure-narrow` | 720px | Forms, single-column, dialogs |
| `--measure-prose` | 880px | Long text / docs |
| `--measure-content` | 1080px | **Default** app report / detail (HQ module screens) |
| `--measure-wide` | 1280px | Data-dense dashboards |

```html
<main class="main">
  <div class="napp-canvas"> <!-- 1080 default for most HQ screens -->
    …
  </div>
</main>

<!-- For the cross-outlet dashboard (Phase 2) -->
<div class="napp-canvas" data-measure="wide">
```

**Density**

HQ admin screens default to comfortable. Dense data tables may use `data-density="compact"`.

| Token | Comfortable | Compact |
|-------|-------------|---------|
| `--control-h` | 40px | 32px |
| `--row-h` | 52px | 40px |
| `--pad-control-y` | 11px | 7px |

Rule: if a component uses a raw hex or fixed px height it won't adapt to theme/density — that's a compliance bug.

---

### 2.4 Elevation, Shadows & Radius

**Radius ladder** (deliberate, squarer-than-SaaS rhythm)

| Token | Value | Use |
|-------|-------|-----|
| `--radius-xs` | 2px | Chips, tick boxes |
| `--radius-sm` | 6px | Inputs, avatars |
| `--radius-md` | 8px | Tables, tiles, rows, **buttons** |
| `--radius-lg` | 12px | Cards, panels |
| `--radius-xl` | 12px | Drawers and modals — applied to **left corners only** on drawers |
| `--radius-pill` | 999px | Status verdicts only |

`--radius-btn` (5px) is deprecated and aliases `--radius-md`. Never write 5px.

**Shadow tokens** (all tinted with forest green, not neutral black)

| Token | Use |
|-------|-----|
| `--shadow-sm` | Resting cards |
| `--shadow-md` | Hover state lift, popovers |
| `--shadow-lg` | Drawers, modals, toasts |

Higher elevation = higher stacking order, literally. Use elevation sparingly — it signals layering, never decoration.

---

### 2.5 Motion

**Principle:** Motion explains change — where something came from, that an agent acted, that a value updated. Never decoration. No bounce, no parallax, no ambient loops.

**Duration tokens** (bigger = slower)

| Token | Value | Use |
|-------|-------|-----|
| `--dur-1` | 80ms | Micro: hover, press |
| `--dur-2` | 140ms | Controls: toggles, tabs |
| `--dur-3` | 220ms | Drawers, toasts |
| `--dur-4` | 360ms | Page / section transitions |

**Easing tokens**

| Token | Use |
|-------|-----|
| `--ease-standard` | Default — enters and moves |
| `--ease-emphasized` | Agent acted, a moment worth noticing |
| `--ease-exit` | Toasts, dismissals |

**Agent motion**

| Moment | Behaviour | Tokens |
|--------|-----------|--------|
| Thinking | Calm 3-dot pulse on reasoning trace | 1200ms · loop · standard |
| Proposing | Suggestion card rises into queue, stagger if several | `--dur-3` · emphasized |
| Acted | Done-state token pops in at the changed value | `--dur-2` · emphasized |
| Undone | Value slides back to prior state — not a hard cut | `--dur-2` · exit |

**Reduced motion (non-negotiable)**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
  }
}
```

**Motion rules:**
- Motion has a job. If it doesn't explain a change of state or position, cut it.
- Bigger = slower. Tie duration to how many pixels move.
- No bounce, no parallax, no ambient loops. The only looping motion allowed is an agent's "thinking" pulse.
- Never inform by motion alone — state must also read from colour, icon and text.

---

### 2.6 Interaction States

Nine states cover every interactive element with the same tokens everywhere:

| State | Visual treatment |
|-------|-----------------|
| Rest | Default |
| Hover | `--shadow-md` lift (translateY(-1px)) or `--surface-soft` wash |
| Focus | `--focus-ring` (3px spring halo) on `:focus-visible` — non-negotiable |
| Pressed | Settles to translateY(0) + slight darken via `--dur-1` |
| Selected | `--nomni-green` 7% tint + `--border-focus` edge |
| Disabled | Reduced opacity; never interactive |
| Loading | Skeleton / spinner |
| Error | `--status-risk-fg` border + message — never colour alone |
| Agent | Agentic glow (`--agent-border` + `--agent-glow`) |

**State tokens:**
- `--focus-ring` — 3px spring halo (box-shadow) on `:focus-visible`
- `--border-focus` — focus edge colour (spinach)
- `--surface-soft` — hover wash background
- `--shadow-md` — hover lift
- `--status-risk-fg` — error border

**State precedence** (highest to lowest): error → loading → selected → pressed → focus → hover → disabled → rest

**Segmented toggle / pill switch rollover (non-negotiable):** Any segmented control — a two-or-more-option switch where the active segment gets a solid fill (`--surface-deep`, `--fern`, `--seaweed`, etc.) — must give every *inactive* segment a hover wash. Never ship a toggle where only the active segment has visual feedback.

```css
.toggle-btn { transition: background var(--dur-1) var(--ease-standard), color var(--dur-1) var(--ease-standard); }
.toggle-btn:not(.active):hover { background: var(--surface-soft); color: var(--text); }
.toggle-btn.active { background: var(--surface-deep); color: var(--cream); } /* or --fern / --seaweed per surface */
```

Reference implementation: `spend-by-supplier.html`'s `.period-btn` (also handles `.active:hover` explicitly so the selected segment doesn't visually shift on hover). Applies to `view-switch`/`view-btn` (list/calendar, grid/list toggles), `role-switch`/`role-btn` (acting-as switches), and any fill-style `.tab-btn` variant — not to underline-style tabs, which already carry their own `:hover { color: var(--text) }` convention.

**The focus contract:** Focus visibility is non-negotiable — the product is run on a keyboard at POS and back office. Never `outline: none` without a visible replacement. Both `--focus-ring` and `--border-focus` resolve to spring green.

Agent states are four additional first-class states:
- **Done** — agent acted; shows "by [Agent] · Undo"
- **Proposed** — suggestion with Approve / Edit / Reject
- **Needs-you** — requires a human decision ("Decide")
- **Stepped-back** — paused or offline; shows review action

---

### 2.7 Grid System

12-column fluid grid, 24px gutters, 1440px max content width.

**Breakpoints**

| Name | Min width | Behaviour |
|------|-----------|-----------|
| Mobile | 0 | Single column; nav rail → bottom sheet; drawer → full-screen |
| Tablet | 768px | Two columns; touch-first 44px hit targets |
| Desktop | 1024px | Full 12-col grid; persistent nav + drawer side by side |
| Wide | 1440px | Content capped; grid stays at max width |

**Span guidance:** KPI tiles span 3 columns. Primary table spans 8–9 with detail rail on remainder. Detail is always a right drawer, never a modal for row-level content.

---

## 3 · Component catalogue for HQ module features

All 88 components are in `component-library.js`. Below are the components most relevant to HQ module screens.

### 3.1 Core components

| Component | Key props | HQ usage |
|-----------|-----------|----------|
| `Button` | `variant` · `size` · `frame` · `disabled` | Primary actions (Save, Push to outlets, Confirm). Primary variant = Fern bg. |
| `Split button` | `variant` · `label` · `menu` | Push actions with options (Push all / Push to group / Push to selection). |
| `Status pill` | `tone` · `label` · `dot` · `live` | Market list status, recipe lock state, propagation status. |
| `KPI tile` | `label` · `value` · `context` | Reporting dashboard — stock variance, top spend. |
| `Key-value list` | `rows` · `total` | Recipe ingredients, inventory par levels. |
| `Tag` | `tone` · `label` · `removable` | Outlet group labels, brand/region/state tags. |
| `Stat card` | `label` · `value` · `delta` · `trend` | Phase 2 dashboard cards. |
| `Panel` | `eyebrow` · `title` · `action` | Group of outlet assignments, recipe library entries. |
| `Link` | `variant` · `label` | In-table view actions. |
| `Code snippet` | `variant` · `language` | (Dev-facing) markup references. |
| `Pulse hero` | `scope` · `value` · `target` | Phase 2 — cross-outlet summary. |

### 3.2 Autonomy (agent) components

| Component | Key props | HQ usage |
|-----------|-----------|----------|
| `Suggestion card` | `agent` · `headline` · `why` · from/to | AI-surfaced recommendations (e.g. recipe cost anomalies). |
| `Agent card` | `state` · `level` · `agent` | Agent-driven propagation or approval flow. |
| `Anomaly callout` | `agent` · `headline` | Flag inconsistencies across outlets. |
| `Agent state token` | `state` · `agent` | Inline "by [Agent] · Undo" on any pushed change. |
| `AI ask bar` | `variant` · `placeholder` | Phase 2 AI insight query. |
| `Trust level` | `level` · `showNext` | Showing outlet-level or HQ-level trust tiers. |

### 3.3 Forms

| Component | Key props | HQ usage |
|-----------|-----------|----------|
| `Text input` | `label` · `value` · `helper` · `error` | Recipe name, inventory item name, UOM. |
| `Select` | `label` · `value` · `options` | Outlet group selector, brand/region/state filter. |
| `Multi-select` | `label` · `options` · `selected` | Assign to multiple outlets or groups. |
| `Combo box` | `label` · `value` · `suggestions` | Search + assign market list items. |
| `Number input` | `label` · `value` · `step` · `error` | Par levels, quantities, recipe portions. |
| `Slider` | `value` · `min` · `max` · `guardrail` | Auto-approve threshold for propagation. |
| `Toggle` | `on` · `label` · `disabled` | Lock/unlock recipe editing; enable propagation. |
| `Checkbox` | `checked` · `label` · `indeterminate` | Bulk select outlets for push. |
| `Radio group` | `options` · `value` | Propagation scope (All outlets / By group / Selection). |
| `File upload` | `state` · `accept` | Bulk import inventory via Excel template. |
| `Tag input` | `label` · `tags` · `placeholder` | Assign tags (brand, region, state) to outlet groups. |
| `Textarea` | `label` · `value` · `counter` · `error` | Recipe notes, propagation change description. |
| `Inline edit` | `label` · `value` · `editing` · `error` | Quick-edit par level in table row. |

### 3.4 Feedback

| Component | HQ usage |
|-----------|----------|
| `Toast` | Confirm propagation success / failure. |
| `Notification` | Warn about downstream impact before HQ removes an item. |
| `Page banner` | System-level alerts (e.g. POS sync issues). |
| `Confirm dialog` | Overwrite warning before pushing POS mappings to existing outlets. |
| `Progress` | Showing propagation progress across 100+ outlets. |
| `Empty state` | No outlets assigned, no recipes in library yet. |
| `Save bar` | Unsaved changes on market list / recipe editor. |
| `Skeleton` | Loading state for outlet lists and dashboards. |
| `Accordion` | Collapsible outlet group details, recipe version history. |
| `Gating chip` | Pro-plan gate on Phase 2 reporting features. |

### 3.5 Overlays

| Component | HQ usage |
|-----------|----------|
| `Confirm dialog` | "Overwrite existing outlet mappings?" — requires explicit confirmation. |
| `Detail drawer` | Outlet impact preview before removing an inventory item. Width md=360px (detail/read), lg=420–480px (forms/editing). Header 64px sticky, footer 68px sticky. Elevation `--shadow-lg`. Enter from right · `--dur-3` · emphasized. `--radius-xl` on left corners only. Focus trap — Tab cycles within drawer only; Escape closes. |
| `Popover` | Filter by outlet group, brand, region, state. |
| `Tooltip` | Explain propagation rules, rollback options, downstream impact counts. |
| `Toggletip` | Inline help on recipe lock state, UOM rules. |
| `Bottom sheet` | Mobile — outlet selection sheet. |

### 3.6 Data / tables

| Component | Key props | HQ usage |
|-----------|-----------|----------|
| `Table interactions` | `sort` · `select` · `filter` · `paginate` | Outlet list, inventory item list, recipe library. |
| `Structured list` | `variant` · `rows` | Recipe ingredient list with quantities. |
| `Activity timeline` | `variant` · `items` | Audit log — market list / recipe / inventory / POS changes. |
| `Key-value list` | `rows` | Outlet details, recipe metadata. |

### 3.7 Navigation

| Component | HQ usage |
|-----------|----------|
| `Tabs` | Market list / Recipe / Inventory / POS Mapping module tabs. |
| `Breadcrumb` | HQ → Group → Outlet drill-down. |
| `Pagination` | Outlet lists, recipe library (100+ rows). |
| `Menu` | Row-level actions (Edit / Duplicate / Push / Delete). |
| `Content switcher` | List view / Dashboard view toggle. |
| `Tree view` | Brand → Region → State → Outlet hierarchy. |
| `Venue picker` | Switch active outlet group scope. |
| `Navigation rail` | HQ module main nav. |
| `Top bar` | HQ app shell header. |
| `Command menu` | ⌘K — jump to outlet, recipe, or item. |
| `Stepper` | Guided workflow (e.g. Create recipe → Set selling price → Assign to group → Push). |

### 3.8 Data viz (Phase 2)

| Component | HQ usage |
|-----------|----------|
| `Bar chart` | Stock variance by outlet. |
| `Line chart` | Trend over time. |
| `Donut chart` | Proportion / category split. |
| `Gauge` | Single KPI vs target. |
| `Ranking bars` | Top spending items by cost. |
| `KPI tile` | Cross-outlet totals. |
| `Stacked bar` | Category breakdown. |
| `Sparkline` | Trend on KPI tiles. |
| `Meter` | Actual vs theoretical consumption. |
| `Waterfall` | Cost breakdown. |
| `Heatmap` | Time/day coverage or variance matrix. |
| `Gantt` | Schedule / prep timelines. |
| `Menu matrix` | Menu item × outlet grid. |

**Bar chart spec:**
- Bar fill: `--nomni-green` at 58% opacity
- Highlight bar: `--nomni-green-dark`
- Target line: `--nomni-forest`, 1.4px dashed
- Gridlines: 1px `--border` at 70% opacity
- Axis labels: `--text-soft`
- Bar max width: 34px; bar radius: 3px
- Default size: 360×190px, responsive width
- One series = one colour. Colour means "look here", not category — never a rainbow of bars.
- Hover/focus reveals tooltip with precise value (axis labels are quiet/abbreviated).

---

## 4 · HQ module screen patterns

### 4.1 Role-based access model

**HQ Administrator** — full read/write. Can create, edit, push to any outlet or group.  
**Outlet User** — read only. All HQ-pushed content is locked (no edit/delete controls rendered).

In component terms:
- HQ admin sees: `Button` (primary), `Split button`, `Inline edit`, `Toggle`, `Menu` with destructive items.
- Outlet user sees: read-only `Structured list`, `Status pill`, locked `Key-value list`. No edit controls.
- Locked recipe ingredients → use `Status pill` with lock icon + `Notification` explaining "Managed by HQ".

### 4.2 Market list assignment

**Page canvas:** `data-measure="content"` (1080px default).

Key patterns:
- Outlet group tree: `Tree view` (Brand → Region → State → Outlet).
- Assign scope: `Radio group` (All in group / Selected subset) + `Multi-select` for subset.
- Propagation status: `Status pill` (ok = propagated · warn = pending · risk = error).
- Change propagation: automatic — show `Toast` on success. If ongoing orders contain modified items, do NOT affect them (no `Confirm dialog` needed for this case; it is silent).
- Audit trail: `Activity timeline` with HQ actor, timestamp, change description.

### 4.3 Recipe management

**Page canvas:** `data-measure="narrow"` (720px) for the recipe editor form; `data-measure="content"` for the library list.

Key patterns:
- Central recipe library: `Table interactions` + `Panel` cards.
- Locked recipes at outlet: all ingredient `Inline edit` controls hidden; show `Status pill` ("Locked · HQ") + tooltip explaining lock.
- Version history: `Accordion` or `Activity timeline` with rollback `Button` (secondary/outline).
- Selling price sync: `Text input` (price field) with helper text "Synced with POS selling price".
- Push recipe: `Split button` ("Push to group" / "Push to selection").
- Agent-assisted: `Agent state token` ("by Sloan · Undo") on auto-suggested recipe updates.

### 4.4 Inventory management

**Page canvas:** `data-measure="content"` for list; `data-measure="narrow"` for item detail.

Key patterns:
- Master item list: `Table interactions` with columns (Name, Category, UOM, Par level, Assigned groups).
- Outlet par levels: `Number input` with `--space-sm` between label and input.
- Bulk import: `File upload` with `.xlsx` accept type + download link for standardised template.
- Remove item warning: `Confirm dialog` ("This will remove the item from N outlet inventories and affect X recipes and Y POS mappings. Continue?") with downstream impact counts.
- Items in multiple lists: `Tag` chips on each item showing which outlet lists it appears in.

### 4.5 POS mapping

The POS mapping module has **two screens** with distinct purposes:

#### 4.5.1 Configuration (`pos-mapping.html`)

**Page canvas:** `data-measure="wide"` (1280px).

**Two-column layout** — sticky left panel (320px) + scrollable right column:

```css
display: grid;
grid-template-columns: 320px 1fr;
gap: var(--space-xl);
align-items: start;
```

Left panel (sticky): 2×2 KPI strip (Total / Mapped / Unmapped / Stale) + horizontal category coverage bar chart. Category rows are clickable — click filters the right-column table to that category. Active category row uses `color-mix(in srgb, var(--text-accent) 10%, transparent)` background.

Right column: filter tabs (All / Unmapped / Partial / Mapped / Ignored) + table of menu items. Filters are **combined** — category filter AND status filter both apply simultaneously via `applyFilters()`. Status tabs show counts.

**Coverage bar chart** (left panel):
- One row per category: name + horizontal bar (flex:1) + percentage
- Colour thresholds: ≥90% = `--text-accent`, 75–89% = `#D97706`, <75% = `#DC2626`
- Bar shows `fill-opacity` at 30% with full-colour border-left indicator

**Mapping drawer** (opens from any table row):
- All "Maps to" fields are **controlled dropdowns**, never free-text inputs
- Three target types: Recipe, Internal Item, Inventory Item — switching type swaps dropdown list
- Modifier rows also use dropdowns for ingredient/recipe fields
- Outlet Overrides section uses the same dropdown treatment for consistency

**Data model for mapping drawer:** `MAPPING_DATA` object keyed by item slug; every row in the table must have an entry — non-clickable rows are a UX defect.

Key patterns:
- Master mapping set: `Table interactions` with sort/filter by outlet, variant, menu category.
- Push to outlets: `Split button` ("Push to all" / "Push to selection").
- Overwrite warning: `Confirm dialog` (tone = warn) — required before overwriting existing mappings.
- Outlets cannot modify: outlet view shows read-only `Structured list` + `Notification` ("Managed by HQ — contact your administrator").
- Variant replication: `Multi-select` to choose which variants to push for outlets with partial menu differences.

#### 4.5.2 Monitoring (`pos-mapping-monitoring.html`)

**Page canvas:** `data-measure="wide"` (1280px).

Three focused sections — in this order, no deviation:

**Section 1 — System Health Bar** (always visible, above everything):
```html
<div class="health-bar">  <!-- flex row, single line -->
  <div class="health-dot ok/warn/risk"></div>
  <div class="health-text"><strong>N outlets need attention</strong> <span>· X of Y fully synced</span></div>
  <div class="health-chips">  <!-- pill-style chips, rightmost -->
    <span class="h-chip risk">N dark</span>
    <span class="h-chip warn">N mapping gaps</span>
  </div>
</div>
```
Shows `ok` dot when all clear, `warn` or `risk` with issue counts otherwise. HQ-only — hide in Standalone mode.

**Section 2 — Outlets Requiring Attention** (HQ only, below Sloan agent card if present):
Attention cards prioritised: dark outlets (🔴) → sync failures (🟠) → mapping gaps (🟡).

Each card uses a 4-column grid: `4px severity bar | 40px icon | 1fr body | auto CTA`
```css
.attn-card { display: grid; grid-template-columns: 4px 40px 1fr auto; }
.attn-severity.risk { background: #DC2626; }  /* full-height left strip */
```
Body must include: title (outlet name + issue), detail line, and **COGS impact line** — the implication of the dark/gap state on inventory accuracy. CTA always links to `outlet-detail.html` for POS config or `pos-mapping.html` for mapping gaps.

**Section 3 — All Outlets table** (HQ only):
Compact 6-column table: Outlet · Group · POS System · Last Sync · Coverage (bar + X/Y) · Status pill. No push buttons, no bulk select checkboxes — this is a read surface.

Every row is clickable → opens **outlet detail drawer** (see §4.7).

**What to remove from Monitoring:** trend sparkline tiles, Active Issues section (consolidate into attention cards), Connection Health section (consolidate into outlet table), push confirm dialog, push buttons.

#### 4.5.3 Outlet detail drawer (from Monitoring table row click)

Width: 460px. Slides in from right, `transform: translateX(100%) → translateX(0)`, `transition: 240ms cubic-bezier(0.32,0,0.15,1)`. Backdrop overlay at z-index 400, drawer at z-index 401. ESC key closes.

Three-part content based on outlet state:

**Connected outlet:**
1. POS Connection KV list (System, Connection type, Connection ID, Status pill, Last sync, Transactions today)
2. **14-day transaction bar chart** (SVG inline — see §4.8)
3. Mapping Coverage section (progress bar + pct + status banner)
4. Recent Sync History (last 4 entries: dot + monospace timestamp + note)

**Dark outlet (no POS):**
1. Red banner "No POS configured" with COGS impact explanation
2. 0% coverage section with red "No mapping data available" banner
3. No sync history

**Footer always:**
- Dark outlet: `"POS config is managed in Outlet Settings" + btn-primary "Configure in Outlet Settings →"` linking to `outlet-detail.html`
- Connected outlet: `btn-secondary "Outlet Settings →"` + `btn-secondary "View mapping →"` linking to respective pages

**Rule:** POS configuration lives in `outlet-detail.html`. The monitoring drawer is read-only for config — never inline editing of POS settings.

#### 4.5.4 Inline SVG transaction chart

Used in the outlet drawer to show 14-day daily transaction volume.

```js
function renderTxChart(history) {
  // history: array of 14 daily tx counts (oldest → today)
  // Returns HTML string with SVG + labels
  const barW = 20, gap = 5, chartH = 56, labelH = 18;
  // bars: weekends at 50% opacity, regular days at 28%, today at 100%
  // overlay: polyline connecting bar tops at 45% stroke opacity
  // avg line: dashed 1px --border horizontal
  // today dot: filled circle at 3px radius on the line
  // x-axis labels: date numbers, today in --text-accent bold
}
```

Chart anatomy:
- **Bars**: `fill="var(--text-accent)"` with `fill-opacity` — full for today, 50% for weekends, 28% for weekdays
- **Trend line**: `<polyline>` connecting midpoints of bars, `stroke="var(--text-accent)"` at 45% opacity
- **Average line**: dashed `<line>` at `stroke="var(--border)"` — quiet reference, not a focal element
- **Today dot**: `<circle r="3">` at line endpoint
- **Labels**: date numbers below bars; "Today" label in footer via `justify-content: space-between` flex row

`preserveAspectRatio="none"` + `width="100%"` makes the chart fill the drawer width responsively.

### 4.6 Phase 2 — Reporting dashboard

**Page canvas:** `data-measure="wide"` (1280px).

Key patterns:
- Cross-outlet `Pulse hero` (scope = group, value = total sales/variance).
- Stock variance: `Bar chart` (actual vs theoretical) + `Ranking bars` (top spend items).
- Filters: `Popover` (outlet, group, category) + `Content switcher` (Chart / Table / Audit).
- Data completeness checklist: `Structured list` with `Status pill` per item (invoice reconciliations, unresolved variances).
- Export: `Button` ("Export XLSX") — triggers file download.
- AI insights: `AI ask bar` + `Anomaly callout` cards (agent = Sloan or Cyrus).

---

## 5 · Non-negotiables (§1 — block output if any apply)

These rules must hold in every generated screen and snippet:

1. **No raw hex values** in component code. Every colour is a CSS variable (`--text`, `--accent`, etc.).
2. **No invented component names.** Only components in `component-library.js` are valid.
3. **Spring (`#2AC864`) is fill-only.** Never use it as text, icon stroke, or border colour on a light surface.
4. **Primary button = Fern on Porcelain shell** (not Spring). Spring primary only on Charcoal chrome.
5. **Status = word/icon + colour.** Never colour alone (accessibility requirement).
6. **Outlet user sees no edit controls** on HQ-pushed content. Read-only rendering is mandatory.
7. **Overwrite confirmation required** before pushing POS mappings to outlets with existing mappings.
8. **Downstream impact shown** before HQ removes an inventory item. `Confirm dialog` must include counts (N outlets, X recipes, Y POS mappings).
9. **Propagation does not affect ongoing orders.** No UI must imply or trigger disruption to in-flight orders.
10. **Full audit log** required on all HQ actions (market list, recipe, inventory, POS). Use `Activity timeline`.
11. **No `--space-N` deprecated aliases** in new code. Use t-shirt tokens (`--space-xs` through `--space-5xl`).
12. **Tabular figures** on all KPI values, prices, quantities, and table columns.

---

## 6 · Top failure modes (§2 — check before returning)

| Failure | What it looks like | Fix |
|---------|-------------------|-----|
| Spring as text | `color: #2AC864` on a label | Replace with `--text-accent` (Fern) |
| Invented component | `<OutletCard>`, `<HQTable>` | Use `Panel` + `Table interactions` |
| Raw spacing | `margin: 20px` | Use `--space-xl` (24px) or `--space-2xl` (32px) |
| Outlet user can edit | Edit button visible to outlet role | Gate on `role === 'hq_admin'` |
| Missing overwrite confirm | Push to mapped outlets with no dialog | Add `Confirm dialog` before push |
| Missing downstream impact | Remove inventory item with no count | Fetch and display impact counts in `Confirm dialog` |
| Colour-only status | Red dot with no label | Add label text alongside status colour |
| Audit trail missing | HQ push with no log entry | Always write to `Activity timeline` on HQ actions |
| Measure too wide for form | Recipe editor at 1280px | Switch to `data-measure="narrow"` (720px) |
| Agent glow on non-agent surface | Green glow on a manual HQ action | Only agent-initiated surfaces get the glow |
| Raw duration | `transition: 0.3s ease` | Use `--dur-2` + `--ease-standard` |
| Missing focus ring | `outline: none` with no replacement | Add `box-shadow: var(--focus-ring)` on `:focus-visible` |
| Wrong radius token | `border-radius: 12px` hardcoded | Use `--radius-xl` for drawers/modals, `--radius-lg` for cards |
| Shadow invented | `box-shadow: 0 4px 10px rgba(0,0,0,0.2)` | Use `--shadow-sm/md/lg` tokens |
| Agent state unnamed | "the AI suggested..." | Always name the agent: "by Sloan · Undo" |
| Toggle segment missing rollover | Inactive segment in a view-switch/role-switch/pill-tab has no hover feedback | Add `:not(.active):hover { background: var(--surface-soft); color: var(--text); }` (see §2.6) |

---

## 7 · Approval workflows

For sensitive changes (recipes, POS mappings), the system must support an approval step:

- Pre-push: `Save bar` ("N unsaved changes · Discard / Save changes").
- Submit for approval: `Button` (secondary) → `Confirm dialog` → `Toast` ("Submitted for approval").
- Approval surface: `Agent card` or `Suggestion card` with Approve / Edit / Reject.
- Post-approval: `Agent state token` ("by [Name] · Undo") on the changed record.
- Audit: entry in `Activity timeline`.

---

## 8 · Design system navigation

Key pages to reference for specific guidance:

| Topic | URL fragment |
|-------|-------------|
| Colour | `#/foundations/color` |
| Typography | `#/foundations/typography` |
| Spacing | `#/foundations/spacing` |
| Grid | `#/foundations/grid` |
| Motion | `#/foundations/motion` |
| Interaction states | `#/foundations/states` |
| Elevation & radius | `#/foundations/elevation` |
| Theme & density | `#/foundations/themes` |
| Token reference | `#/foundations/tokens-reference` |
| Components overview | `#/components` |
| AI design language | `#/ai/design-language` |
| For AI models | `#/get-started/ai-models` |
| Principles | `#/get-started/principles` |
| Detail drawer | `#/components/drawer` |
| Bar chart | `#/components/barchart` |
| Patterns: dialog vs drawer | `#/patterns/dialog-drawer` |
| Autonomy approvals | `#/patterns/autonomy-approval` |
| Constitution: OS model | `#/constitution/os-model` |

All fragments are relative to:  
`https://nomni-design-system-219706529615.australia-southeast2.run.app`

---

## 9 · Quick reference — BRD module → component mapping

| BRD module | Primary components |
|------------|-------------------|
| Market list assignment | `Tree view`, `Multi-select`, `Table interactions`, `Status pill`, `Split button`, `Activity timeline` |
| Recipe management | `Table interactions`, `Panel`, `Structured list`, `Number input`, `Toggle` (lock), `Accordion` (versions), `Split button`, `Agent state token` |
| Inventory management | `Table interactions`, `Number input`, `File upload`, `Confirm dialog` (impact), `Tag`, `Notification` |
| POS mapping | `Table interactions`, `Confirm dialog` (overwrite), `Split button`, `Multi-select` (variants), `Notification` (outlet locked) |
| Phase 2 reporting | `Pulse hero`, `Bar chart`, `Ranking bars`, `Structured list`, `AI ask bar`, `Anomaly callout`, `KPI tile`, `Button` (export) |
| Audit logs | `Activity timeline` across all modules |
| Role access (HQ admin) | Full edit controls rendered |
| Role access (outlet user) | Read-only; `Notification` ("Managed by HQ") on locked records |

---

## 10 · New design system sections (v1.6.0+)

Sections added to the live design system not covered by earlier specs. Relevant for future HQ module features.

**Constitution** (`#/constitution/*`) — hospitality-specific mental models:
- Nomni OS mental model — how the product thinks about operators + automation
- Hospitality Operating Model (Guest-led) — the guest experience hierarchy
- Capability taxonomy — how features are classified and prioritised

**Operating Patterns** (`#/operating/*`) — hospitaliy-specific interaction patterns:
- Action Object (`#/operating/action-object`) — the core unit of work in Nomni
- Today · Fire/Fuel/Flywheel (`#/operating/today-fff`) — daily operational rhythm
- Hospitality Opportunity Card (`#/operating/guest-opportunity`) — guest-driven prompts
- Recovery Action (`#/operating/recovery`) — handling service failures
- Surprise & Delight (`#/operating/surprise-delight`) — proactive guest moments
- Growth Experiment (`#/operating/growth-experiment`) — structured operator experiments

These patterns are surface-level guidance for HQ module design decisions (prioritisation, CTA framing) rather than component specs.
