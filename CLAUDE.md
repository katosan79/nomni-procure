# Nomni HQ Module — Clickable Prototype

## What this project is

A clickable HTML prototype for the Nomni HQ Module — a centralised procurement
management system for a hospitality group operating 100+ outlets across Australia.
The prototype covers all screens defined in the BRD (see `BRD.md`) and is built
entirely from the Nomni Design System v1.6.0.

**Before writing any UI code, read `skills/SKILL.md` in full.** It contains the complete
token system, component catalogue, role-based access rules, and a non-negotiables
checklist you must pass before returning any output.

---

## Business context (from the BRD)

Two user roles:
- **HQ Administrator** — full read/write. Creates, edits, and pushes content to
  any outlet or group. Sees all edit controls.
- **Outlet User** — read only. Cannot modify HQ-defined content. No edit controls
  rendered on HQ-pushed items.

Four core modules + one Phase 2 module:
1. Market List Assignment — distribute market lists to outlet groups
2. Recipe Management — central recipe library, locked at outlet level
3. Inventory Management — master item list, par levels, bulk import
4. POS Mapping — replicate POS mappings across outlets
5. Reporting & Analytics (Phase 2) — cross-outlet performance dashboard

Key business rules to honour in every screen:
- Propagation to outlets never affects in-flight orders
- Removing an inventory item requires showing downstream impact counts first
- Overwriting existing POS mappings requires explicit HQ confirmation
- Every HQ action must write an audit log entry (Activity timeline)
- Outlet users see a "Managed by HQ" notification on locked content

---

## Prototype scope

Build as a set of linked static HTML files (no framework needed).
Each file is a fully self-contained screen with inline CSS and JS.

### Screens to build

| File | Screen | Role shown |
|------|--------|------------|
| `screens/login.html` | Login | — |
| `screens/dashboard.html` | HQ overview dashboard | HQ admin |
| `screens/market-list.html` | Market list assignment | HQ admin |
| `screens/recipes.html` | Recipe library | HQ admin |
| `screens/recipe-detail.html` | Recipe editor + version history | HQ admin |
| `screens/inventory.html` | Inventory master list | HQ admin |
| `screens/pos-mapping.html` | POS mapping table | HQ admin |
| `screens/reporting.html` | Cross-outlet dashboard (Phase 2) | HQ admin |
| `screens/outlet-recipes.html` | Recipe view (locked) | Outlet user |

### Shared files

| File | Purpose |
|------|---------|
| `shared/tokens.css` | All Nomni CSS custom properties (extracted once, imported by every screen) |
| `shared/shell.js` | Navigation rail + top bar HTML injected into every screen |
| `shared/nav.json` | Navigation items and active states |

---

## Design decisions made in Claude Chat

These were established when building the login screen and must carry through
all other screens:

### Shell
- Charcoal (`#353535`) persistent nav rail on the left — does NOT flip with theme
- Nomni wordmark: green tile (`#2AC864` fill) + "nomni" in Cream on Charcoal
- Nav rail width: 220px
- Main content area: App cream (`#F5F2EF`) background

### Login screen (`screens/login.html`)
- Already built — use as the visual and structural reference for all other screens
- Card on App cream background, max-width 400px, centered
- Status banner (Spinach-on-Mint, dot + label) at top of card
- Fern primary button, SSO secondary button, "Contact your administrator" footer

### Typography
- Font: Hanken Grotesk from Google Fonts (weights 300, 400, 500, 600, 700)
- Page titles: 24px / semibold
- Eyebrows: 11px / uppercase / tracked / Fern
- Labels: 13px / medium
- Body/helper: 14px / regular

### Spacing
- Always use t-shirt tokens: `--space-xs` (4px) through `--space-5xl` (96px)
- Never raw pixel values in layout

### Buttons
- Primary: Fern bg (`#129B41`), white label — on Porcelain (light) shell
- Primary: Spring bg (`#2AC864`) — only on Charcoal chrome
- Secondary/outline: transparent bg, `--border` stroke

### Content canvas widths
- Forms / single-column: `--measure-narrow` 720px
- Default app screens: `--measure-content` 1080px
- Dense data tables: `--measure-wide` 1280px

---

## How to build the prototype

Work screen by screen. For each screen:

1. Read `skills/SKILL.md` (already done if you're reading this)
2. Check the table above for the correct canvas width
3. Inject the shared shell (nav rail + top bar) from `shared/shell.js`
4. Import `shared/tokens.css` — never redefine tokens inline
5. Build the screen content using only components from the Nomni component catalogue (§3 of SKILL.md)
6. Self-check against §5 (Non-negotiables) before finishing
7. Add navigation links so every screen links to all others

### Suggested build order
1. `shared/tokens.css` — extract all tokens first so every screen is consistent
2. `shared/shell.js` — build the nav rail once, inject everywhere
3. `screens/dashboard.html` — establishes the full-screen layout pattern
4. `screens/market-list.html` — Tree view + Table + Split button pattern
5. `screens/recipes.html` + `recipe-detail.html` — library + editor pattern
6. `screens/inventory.html` — table + bulk import + impact dialog pattern
7. `screens/pos-mapping.html` — dense table + overwrite confirm pattern
8. `screens/reporting.html` — dashboard + charts pattern (Phase 2)
9. `screens/outlet-recipes.html` — outlet user read-only locked view

---

## Running the prototype locally

```bash
# From the project root — any simple static server works:
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:8080/screens/login.html` in your browser.

---

## Key files to read before starting

- `skills/SKILL.md` — **mandatory first read**
- `BRD.md` — business requirements (optional, SKILL.md summarises the key rules)
- `screens/login.html` — reference screen already built
