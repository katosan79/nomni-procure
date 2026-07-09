/**
 * Nomni HQ Module — shared shell
 * Injects nav rail + top bar into every screen.
 * Usage: <script src="../shared/shell.js" data-active="dashboard"></script>
 */
(function () {
  const NAV = [
    { id: 'dashboard',   icon: 'ti-layout-dashboard',  label: 'Overview',     href: 'dashboard.html' },
    { id: 'orders',      icon: 'ti-shopping-cart',      label: 'Orders',       href: 'orders.html' },
    { id: 'invoices',    icon: 'ti-file-invoice',       label: 'Invoices',     href: 'invoices.html' },
    { id: 'items',       icon: 'ti-stack',              label: 'Items',        href: 'items.html' },
    { id: 'inventory', icon: 'ti-package', label: 'Inventory', children: [
      { id: 'inventory-operations', label: 'Operations', href: 'inventory.html' },
      { id: 'inventory-analytics',  label: 'Analytics',  href: 'inventory-analytics.html' },
      { id: 'inventory-governance', label: 'Governance',  href: 'inventory-governance.html' },
    ]},
    { id: 'market-list', icon: 'ti-receipt',            label: 'Market lists', href: 'market-list.html' },
    { id: 'recipes',     icon: 'ti-tools-kitchen-2',    label: 'Recipes',      href: 'recipes.html' },
    { id: 'pos-mapping', icon: 'ti-device-desktop', label: 'POS mapping', children: [
      { id: 'pos-mapping-config',     label: 'Configuration', href: 'pos-mapping.html' },
      { id: 'pos-mapping-monitoring', label: 'Monitoring',    href: 'pos-mapping-monitoring.html' },
    ]},
    { id: 'reporting',   icon: 'ti-chart-bar',          label: 'Reporting',    href: 'reporting.html' },
    { id: 'outlets',      icon: 'ti-building-store',     label: 'Outlets',       href: 'outlets.html' },
    { id: 'suppliers',   icon: 'ti-truck',              label: 'Suppliers',    href: 'suppliers.html' },
    { id: 'users',       icon: 'ti-users',              label: 'Users',        href: 'users.html' },
    { id: 'brands',      icon: 'ti-tag',                label: 'Brands',       href: 'brands.html' },
  ];

  /* ── Seller workspace nav (Supplier / Central Kitchen roles) ──
     Same platform, different workspace: the seller sees the other side of the
     same objects — a buyer's PO is the seller's incoming order. */
  const SELLER_NAV = [
    { id: 'seller-orders',    icon: 'ti-inbox',          label: 'Order inbox',      href: 'seller-orders.html' },
    { id: 'seller-dispatch',  icon: 'ti-truck-delivery', label: 'Fulfilment',       href: 'seller-dispatch.html' },
    { id: 'seller-catalog',   icon: 'ti-list-details',   label: 'Catalog & prices', href: 'seller-catalog.html' },
    { id: 'seller-customers', icon: 'ti-building-store', label: 'Customers',        href: 'seller-customers.html' },
  ];

  /* ── CK-only "Purchasing" nav ──
     A Central Kitchen is a seller to its outlets AND a buyer from real
     suppliers (raw ingredients for production, bulk stock to redistribute).
     Shown as an extra section under the seller nav for ck-operator only —
     an external Supplier User has no reason to raise POs on this platform. */
  const CK_BUYER_NAV = [
    { id: 'orders',    icon: 'ti-shopping-cart', label: 'Orders',    href: 'orders.html' },
    { id: 'invoices',  icon: 'ti-file-invoice',  label: 'Invoices',  href: 'invoices.html' },
    { id: 'suppliers', icon: 'ti-truck',         label: 'Suppliers', href: 'suppliers.html' },
  ];

  /* ── Roles (the View-as switcher) ──
     ws decides which workspace the role lands in: 'buyer' (procure) or
     'seller' (supply). CK Operator and Supplier share the seller workspace —
     a CK is an internal supplier to its own outlets. */
  const ROLES = [
    { id: 'hq-admin',    tier: 'hq',       group: 'HQ',              label: 'HQ Administrator', short: 'HQ', ws: 'buyer'  },
    { id: 'hq-approver', tier: 'hq',       group: 'HQ',              label: 'HQ Approver',      short: 'AP', ws: 'buyer'  },
    { id: 'finance',     tier: 'hq',       group: 'HQ',              label: 'Finance User',     short: 'FN', ws: 'buyer'  },
    { id: 'outlet-mgr',  tier: 'outlet',   group: 'Outlet',          label: 'Outlet Manager',   short: 'OM', ws: 'buyer'  },
    { id: 'outlet-user', tier: 'outlet',   group: 'Outlet',          label: 'Outlet Staff',     short: 'OS', ws: 'buyer'  },
    { id: 'ck-operator', tier: 'ck',       group: 'Central Kitchen', label: 'CK Operator',      short: 'CK', ws: 'seller', buys: true },
    { id: 'supplier',    tier: 'external', group: 'External',        label: 'Supplier User',    short: 'SP', ws: 'seller' },
  ];
  const ALL = ROLES.map(r => r.id);
  /* Which roles may see each nav section */
  const NAV_ROLES = {
    dashboard:     ALL,
    orders:        ['hq-admin','hq-approver','finance','outlet-mgr','outlet-user','supplier'],
    inventory:                ['hq-admin','hq-approver','outlet-mgr','outlet-user'],
    'inventory-operations':   ['hq-admin','hq-approver','outlet-mgr','outlet-user'],
    'inventory-analytics':    ['hq-admin','hq-approver','outlet-mgr'],
    'inventory-governance':   ['hq-admin','hq-approver'],
    'market-list': ['hq-admin','hq-approver','outlet-mgr','outlet-user'],
    recipes:       ['hq-admin','hq-approver','outlet-mgr','outlet-user'],
    'pos-mapping':            ['hq-admin','hq-approver','outlet-mgr'],
    'pos-mapping-config':     ['hq-admin','hq-approver','outlet-mgr'],
    'pos-mapping-monitoring': ['hq-admin','hq-approver','outlet-mgr'],
    reporting:     ['hq-admin','hq-approver','finance'],
    outlets:        ['hq-admin','hq-approver'],
    suppliers:     ['hq-admin','hq-approver','finance'],
    users:         ['hq-admin'],
  };
  function currentRole() {
    let id = 'hq-admin';
    try { id = localStorage.getItem('nomni_role') || 'hq-admin'; } catch (e) {}
    return ROLES.find(r => r.id === id) || ROLES[0];
  }

  /* ── Agents (the on/off + staged-rollout switcher) ── */
  const AGENTS = [
    { fn: 'ordering',   agent: 'otto',  short: 'Ot', name: 'Ordering',   who: 'Otto'  },
    { fn: 'governance', agent: 'sloan', short: 'Sl', name: 'Governance', who: 'Sloan' },
    { fn: 'invoice',    agent: 'cyrus', short: 'Cy', name: 'Invoice',    who: 'Cyrus' },
    { fn: 'margin',     agent: 'mara',  short: 'Ma', name: 'Margin',     who: 'Mara'  },
    { fn: 'variance',   agent: 'vera',  short: 'Ve', name: 'Variance',   who: 'Vera'  },
  ];
  function agentsMaster() {
    try { return localStorage.getItem('nomni_agents') !== 'off'; } catch (e) { return true; }
  }
  function fnState() {
    try { return JSON.parse(localStorage.getItem('nomni_fn') || '{}'); } catch (e) { return {}; }
  }

  const script   = document.currentScript;
  const activeId = script ? script.getAttribute('data-active') : '';

  /* ── Tabler Icons CDN ── */
  if (!document.querySelector('link[href*="tabler-icons"]')) {
    const link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.19.0/dist/tabler-icons.min.css';
    document.head.appendChild(link);
  }

  /* ── Shell styles ── */
  const style = document.createElement('style');
  style.textContent = `
    /* ── Base layout ── */
    .shell-layout {
      display: flex;
      min-height: 100vh;
      background: var(--surface-soft);
    }

    /* ── Nav overlay (mobile) ── */
    .shell-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(14,55,39,0.4);
      z-index: 39;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .shell-overlay.open {
      display: block;
      opacity: 1;
    }

    /* ── Nav rail (chrome) ── */
    .shell-chrome {
      width: var(--nav-width, 220px);
      flex-shrink: 0;
      background: var(--chrome-bg);
      display: flex;
      flex-direction: column;
      padding: var(--space-xl) var(--space-lg);
      gap: var(--space-3xl);
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
      z-index: 40;
      transition: transform 0.22s ease, width 0.22s ease, padding 0.22s ease;
    }

    /* ── Collapsed nav rail ── */
    .shell-chrome.nav-collapsed {
      width: 52px;
      padding: var(--space-xl) var(--space-sm);
      overflow: visible;
    }
    .shell-chrome.nav-collapsed .shell-wordmark-text { display: none; }
    .shell-chrome.nav-collapsed .shell-nav-item {
      justify-content: center;
      padding: var(--space-sm);
      gap: 0;
      position: relative;
    }
    .shell-chrome.nav-collapsed .shell-nav-label { display: none; }
    .shell-chrome.nav-collapsed .shell-nav-divider { display: none; }
    .shell-chrome.nav-collapsed .shell-nav-footer { overflow: visible; }
    .shell-chrome.nav-collapsed .shell-collapse-btn { justify-content: center; }

    /* Tooltip on hover in collapsed mode */
    .shell-chrome.nav-collapsed .shell-nav-item[data-label]:hover::before,
    .shell-chrome.nav-collapsed .shell-nav-item[data-label]:hover::after { content: ''; }
    .shell-chrome.nav-collapsed .shell-nav-item[data-label]:hover::after {
      content: attr(data-label);
      position: absolute;
      left: calc(100% + 10px);
      top: 50%;
      transform: translateY(-50%);
      background: var(--seaweed);
      color: var(--porcelain);
      font-size: 12px;
      font-weight: 500;
      padding: 4px 9px;
      border-radius: var(--radius-sm);
      white-space: nowrap;
      z-index: 200;
      pointer-events: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.18);
    }
    .shell-chrome.nav-collapsed .shell-nav-item[data-label]:hover::before {
      content: '';
      position: absolute;
      left: calc(100% + 6px);
      top: 50%;
      transform: translateY(-50%);
      border: 4px solid transparent;
      border-right-color: var(--seaweed);
      z-index: 200;
      pointer-events: none;
    }

    /* ── Sub-nav groups (expandable sections) ── */
    .shell-nav-group { display: flex; flex-direction: column; position: relative; }
    .shell-nav-group-toggle {
      display: flex; align-items: center;
      gap: var(--space-sm);
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius-sm);
      font-size: 13px; font-weight: 500;
      color: var(--chrome-fg-soft);
      background: none; border: none;
      cursor: pointer; width: 100%;
      text-align: left; font-family: inherit;
      transition: background 0.12s, color 0.12s;
    }
    .shell-nav-group-toggle:hover { background: var(--chrome-panel); color: var(--chrome-fg); }
    .shell-nav-group-toggle.active,
    .shell-nav-group-toggle.open { color: var(--chrome-fg); }
    .shell-nav-group-toggle i.ti:first-child { font-size: 16px; flex-shrink: 0; }
    .group-chevron { margin-left: auto; font-size: 11px; flex-shrink: 0; transition: transform 0.18s; }
    .shell-nav-group-toggle.open .group-chevron { transform: rotate(90deg); }
    .shell-nav-subitems {
      display: none; flex-direction: column; gap: 1px;
      padding-left: 24px;
      border-left: 1.5px solid rgba(250,247,233,0.12);
      margin-left: 20px;
      margin-top: 2px; margin-bottom: 4px;
    }
    .shell-nav-subitems.open { display: flex; }
    .shell-nav-subitem {
      display: flex; align-items: center;
      gap: var(--space-sm);
      padding: 5px var(--space-md);
      border-radius: var(--radius-sm);
      font-size: 12px; font-weight: 500;
      color: var(--chrome-fg-soft);
      text-decoration: none;
      transition: background 0.12s, color 0.12s;
      position: relative;
    }
    .shell-nav-subitem:hover { background: var(--chrome-panel); color: var(--chrome-fg); }
    .shell-nav-subitem.active { background: var(--chrome-active); color: var(--chrome-fg); font-weight: 600; }
    .shell-nav-subitem.active::before {
      content: '';
      position: absolute; left: 5px; top: 50%; transform: translateY(-50%);
      width: 4px; height: 4px; border-radius: 50%;
      background: var(--spring);
    }
    /* Collapsed nav: groups show icon only */
    .shell-chrome.nav-collapsed .shell-nav-group-toggle {
      justify-content: center; padding: var(--space-sm); gap: 0; position: relative;
    }
    .shell-chrome.nav-collapsed .shell-nav-group-toggle[data-label]:hover::after {
      content: attr(data-label);
      position: absolute; left: calc(100% + 10px); top: 50%;
      transform: translateY(-50%);
      background: var(--seaweed); color: var(--porcelain);
      font-size: 12px; font-weight: 500;
      padding: 4px 9px; border-radius: var(--radius-sm);
      white-space: nowrap; z-index: 200; pointer-events: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.18);
    }
    .shell-chrome.nav-collapsed .shell-nav-group-toggle[data-label]:hover::before {
      content: '';
      position: absolute; left: calc(100% + 6px); top: 50%;
      transform: translateY(-50%);
      border: 4px solid transparent; border-right-color: var(--seaweed);
      z-index: 200; pointer-events: none;
    }
    .shell-chrome.nav-collapsed .group-chevron { display: none; }
    .shell-chrome.nav-collapsed .shell-nav-subitems { display: none !important; }
    /* Active icon highlight when a child of this group is the current page */
    .shell-chrome.nav-collapsed .shell-nav-group-toggle.active {
      background: var(--chrome-active);
      color: var(--chrome-fg);
    }

    /* Compact flyout for collapsed nav groups */
    .shell-nav-compact-flyout {
      position: absolute;
      left: calc(100% + 8px);
      top: 0;
      min-width: 168px;
      background: var(--chrome-bg);
      border: 1px solid rgba(250,247,233,0.14);
      border-radius: var(--radius-md);
      box-shadow: 4px 6px 24px rgba(0,0,0,0.4);
      z-index: 200;
      padding: 4px;
      display: none;
      pointer-events: none;
    }
    .shell-nav-compact-flyout.open { display: block; pointer-events: all; }
    /* Hover-to-open flyout in collapsed mode — keeps it open while mousing over the flyout itself */
    .shell-chrome.nav-collapsed .shell-nav-group:hover .shell-nav-compact-flyout {
      display: block;
      pointer-events: all;
    }
    .shell-nav-compact-flyout-title {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.08em; color: rgba(250,247,233,0.4);
      padding: 6px 10px 3px;
    }
    .shell-nav-compact-flyout a {
      display: block; padding: 7px 12px;
      border-radius: var(--radius-xs);
      font-size: 13px; font-weight: 500;
      color: var(--chrome-fg-soft); text-decoration: none;
      transition: background 0.12s, color 0.12s; white-space: nowrap;
    }
    .shell-nav-compact-flyout a:hover { background: var(--chrome-panel); color: var(--chrome-fg); }
    .shell-nav-compact-flyout a.flyout-active { background: var(--chrome-active); color: var(--chrome-fg); font-weight: 600; }

    /* ── Role-gated page content ── */
    html[data-tier="outlet"]   .hq-only,
    html[data-tier="external"] .hq-only { display: none !important; }

    /* ── Collapse toggle button ── */
    .shell-collapse-btn {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: var(--space-sm);
      width: 100%;
      height: 32px;
      padding: 0 var(--space-md);
      background: none;
      border: none;
      border-radius: var(--radius-sm);
      color: var(--chrome-fg-soft);
      cursor: pointer;
      transition: background 0.12s, color 0.12s;
      margin-top: var(--space-sm);
      flex-shrink: 0;
      font-family: inherit;
    }
    .shell-collapse-btn:hover {
      background: var(--chrome-panel);
      color: var(--chrome-fg);
    }
    .shell-collapse-btn i { font-size: 15px; flex-shrink: 0; }

    /* ── Wordmark ── */
    .shell-wordmark {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      text-decoration: none;
    }
    .shell-wordmark-icon {
      width: 24px; height: 27px;
      background: none;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .shell-wordmark-icon svg { width: 24px; height: 27px; }
    .shell-wordmark-text {
      font-size: 16px; font-weight: 600;
      color: var(--chrome-fg);
      letter-spacing: -0.01em;
    }

    /* ── Nav items ── */
    .shell-nav {
      display: flex; flex-direction: column;
      gap: var(--space-xs);
      flex: 1;
    }
    .shell-nav-ws {
      display: flex; flex-direction: column;
      gap: var(--space-xs);
    }
    .shell-nav-ws-sub {
      display: flex; flex-direction: column;
      gap: var(--space-xs);
    }
    .shell-nav-section-label {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.06em; color: var(--chrome-fg-soft);
      padding: var(--space-xs) var(--space-md) 2px;
    }
    .shell-nav-item {
      display: flex; align-items: center;
      gap: var(--space-sm);
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius-sm);
      font-size: 13px; font-weight: 500;
      color: var(--chrome-fg-soft);
      text-decoration: none;
      transition: background 0.12s, color 0.12s;
    }
    .shell-nav-item:hover {
      background: var(--chrome-panel);
      color: var(--chrome-fg);
    }
    .shell-nav-item.active {
      background: var(--chrome-active);
      color: var(--chrome-fg);
    }
    .shell-nav-item i { font-size: 16px; flex-shrink: 0; }
    .shell-nav-divider {
      height: 1px;
      background: rgba(250,247,233,0.1);
      margin-block: var(--space-sm);
    }
    .shell-nav-footer {
      margin-top: auto;
      padding-top: var(--space-xl);
      border-top: 1px solid rgba(250,247,233,0.1);
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }

    /* ── Main content area ── */
    .shell-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow: hidden;
    }

    /* ── Top bar ── */
    .shell-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: var(--topbar-h, 56px);
      padding-inline: var(--space-2xl);
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 10;
      gap: var(--space-md);
    }
    .shell-topbar-left {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      min-width: 0;
    }
    .shell-topbar-title {
      font-size: 16px; font-weight: 600;
      color: var(--text);
      letter-spacing: -0.01em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .shell-topbar-actions {
      display: flex; align-items: center;
      gap: var(--space-sm);
      flex-shrink: 0;
    }
    .shell-avatar {
      width: 32px; height: 32px;
      border-radius: 50%;
      background: var(--mint);
      border: 1px solid var(--border);
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 600;
      color: var(--spinach);
      cursor: pointer;
      flex-shrink: 0;
    }
    .shell-icon-btn {
      width: 32px; height: 32px;
      border-radius: var(--radius-sm);
      background: transparent;
      border: none;
      display: flex; align-items: center; justify-content: center;
      color: var(--text-soft);
      cursor: pointer;
      transition: background 0.12s;
    }
    .shell-icon-btn:hover { background: var(--surface-soft); color: var(--text); }
    .shell-icon-btn i { font-size: 18px; }

    /* ── View-as role switcher (demo control) ── */
    .shell-roleswitch { position: relative; }
    .shell-role-btn {
      display: inline-flex; align-items: center; gap: 6px;
      height: 32px; padding: 0 10px;
      border: 1px solid var(--border); border-radius: var(--radius-md);
      background: var(--surface); color: var(--text);
      font-family: inherit; font-size: 12px; font-weight: 600; cursor: pointer;
      transition: border-color var(--dur-1) var(--ease-standard), background var(--dur-1) var(--ease-standard);
    }
    .shell-role-btn:hover { border-color: var(--text-accent); }
    .shell-role-btn .va-eye { color: var(--text-accent); font-size: 15px; }
    .shell-role-btn .va-caret { color: var(--text-soft); font-size: 14px; }
    .shell-role-btn .va-label { white-space: nowrap; }
    .shell-role-menu {
      position: absolute; top: calc(100% + 6px); right: 0; min-width: 240px;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--radius-md); box-shadow: var(--shadow-lg);
      padding: 6px; z-index: 60; display: none;
    }
    .shell-role-menu.open { display: block; }
    .shell-role-hint { font-size: 11px; color: var(--text-soft); padding: 6px 10px 8px; line-height: 1.4; border-bottom: 1px solid var(--border); margin-bottom: 4px; }
    .shell-role-group { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-soft); padding: 8px 10px 4px; }
    .shell-role-item {
      display: flex; align-items: center; gap: 8px; width: 100%;
      padding: 8px 10px; border: none; background: none; cursor: pointer;
      font-family: inherit; font-size: 13px; font-weight: 500; color: var(--text);
      text-align: left; border-radius: var(--radius-sm);
    }
    .shell-role-item:hover { background: var(--surface-soft); }
    .shell-role-item .ra { width: 24px; height: 24px; border-radius: var(--radius-pill); background: var(--surface-soft); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: var(--text-soft); flex-shrink: 0; }
    .shell-role-item .tick { margin-left: auto; color: var(--text-accent); visibility: hidden; font-size: 16px; }
    .shell-role-item[aria-checked="true"] { background: var(--mint); }
    .shell-role-item[aria-checked="true"] .tick { visibility: visible; }
    .shell-role-item[aria-checked="true"] .ra { background: var(--fern); color: var(--btn-primary-fg); }
    @media (max-width: 768px) { .shell-role-btn .va-label, .shell-role-btn .va-caret { display: none; } }

    /* ── Agents on/off control (demo) ── */
    .shell-agentswitch { position: relative; }
    .shell-agents-btn {
      display: inline-flex; align-items: center; gap: 6px;
      height: 32px; padding: 0 10px;
      border: 1px solid var(--border); border-radius: var(--radius-md);
      background: var(--surface); color: var(--text);
      font-family: inherit; font-size: 12px; font-weight: 600; cursor: pointer;
      transition: border-color var(--dur-1) var(--ease-standard);
    }
    .shell-agents-btn:hover { border-color: var(--text-accent); }
    .shell-agents-btn .va-spark { color: var(--text-accent); font-size: 15px; }
    .shell-agents-btn .agents-dot { width: 7px; height: 7px; border-radius: var(--radius-pill); background: var(--status-ok-fg); }
    html[data-agents="off"] .shell-agents-btn .agents-dot { background: var(--stone); }
    html[data-agents="off"] .shell-agents-btn .va-spark { color: var(--text-soft); }
    .shell-agents-menu {
      position: absolute; top: calc(100% + 6px); right: 0; min-width: 270px;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--radius-md); box-shadow: var(--shadow-lg);
      padding: 6px; z-index: 60; display: none;
    }
    .shell-agents-menu.open { display: block; }
    .shell-toggle-row {
      display: flex; align-items: center; gap: 10px; width: 100%;
      padding: 8px 10px; border: none; background: none; cursor: pointer;
      font-family: inherit; text-align: left; border-radius: var(--radius-sm);
    }
    .shell-toggle-row:hover { background: var(--surface-soft); }
    .shell-toggle-row .tg-icon { width: 26px; height: 26px; border-radius: var(--radius-pill); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; background: var(--surface-soft); color: var(--text-soft); }
    .shell-toggle-row[data-master] .tg-icon { background: color-mix(in srgb, var(--fern) 14%, transparent); color: var(--text-accent); }
    .shell-toggle-row .tg-label { display: flex; flex-direction: column; gap: 1px; flex: 1; min-width: 0; }
    .shell-toggle-row .tg-label strong { font-size: 13px; font-weight: 600; color: var(--text); }
    .shell-toggle-row .tg-label small { font-size: 11px; color: var(--text-soft); }
    .shell-toggle-row .tg-switch { width: 34px; height: 20px; border-radius: var(--radius-pill); background: var(--stone); position: relative; flex-shrink: 0; transition: background var(--dur-2) var(--ease-standard); }
    .shell-toggle-row .tg-switch::after { content: ''; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: var(--radius-pill); background: var(--porcelain); box-shadow: var(--shadow-sm); transition: transform var(--dur-2) var(--ease-standard); }
    .shell-toggle-row[aria-checked="true"] .tg-switch { background: var(--fern); }
    .shell-toggle-row[aria-checked="true"] .tg-switch::after { transform: translateX(14px); }
    .shell-agents-divider { height: 1px; background: var(--border); margin: 6px 4px; }
    .shell-agents-menu.master-off .shell-toggle-row:not([data-master]) { opacity: 0.4; pointer-events: none; }
    @media (max-width: 768px) { .shell-agents-btn .va-label { display: none; } }

    /* Hamburger — hidden on desktop */
    .shell-hamburger { display: none; }

    /* ── Scrollable content ── */
    .shell-content {
      flex: 1;
      padding: var(--space-2xl);
      overflow-y: auto;
      overflow-x: hidden;
    }

    /* ── napp-canvas responsive measure ── */
    .napp-canvas {
      width: 100%;
      max-width: var(--measure-content);
      margin-inline: auto;
    }
    .napp-canvas[data-measure="narrow"]  { max-width: var(--measure-narrow);  }
    .napp-canvas[data-measure="prose"]   { max-width: var(--measure-prose);   }
    .napp-canvas[data-measure="wide"]    { max-width: var(--measure-wide);    }

    /* ── Responsive: tablet (≤ 1024px) ── */
    @media (max-width: 1024px) {
      .shell-chrome {
        width: 200px;
      }
      .shell-content {
        padding: var(--space-xl);
      }
    }

    /* ── Responsive: mobile (≤ 768px) ── */
    @media (max-width: 768px) {
      .shell-chrome {
        position: fixed;
        top: 0; left: 0;
        height: 100vh;
        width: 260px;
        transform: translateX(-100%);
        box-shadow: 4px 0 24px rgba(14,55,39,0.18);
      }
      .shell-chrome.open {
        transform: translateX(0);
      }
      .shell-hamburger {
        display: flex;
      }
      .shell-topbar {
        padding-inline: var(--space-lg);
      }
      .shell-content {
        padding: var(--space-lg);
      }
      /* Search button hidden on very small screens */
      .shell-search-btn { display: none; }
    }

    @media (max-width: 480px) {
      .shell-content {
        padding: var(--space-md);
      }
      .shell-topbar-title {
        font-size: 14px;
      }
    }
  `;
  document.head.appendChild(style);

  function buildShell(pageTitle) {
    const ADMIN_IDS = new Set(['outlets', 'suppliers', 'users']);
    let dividerInserted = false;
    const buildNavItems = items => items.map(n => {
      let prefix = '';
      if (ADMIN_IDS.has(n.id) && !dividerInserted) {
        prefix = '<div class="shell-nav-divider" aria-hidden="true"></div>';
        dividerInserted = true;
      }
      if (n.children) {
        const isGroupActive = n.children.some(c => c.id === activeId);
        const childLinks = n.children.map(c =>
          `<a class="shell-nav-subitem${c.id === activeId ? ' active' : ''}" href="${c.href}" data-nav="${c.id}" data-label="${c.label}" aria-current="${c.id === activeId ? 'page' : 'false'}">${c.label}</a>`
        ).join('');
        const flyoutLinks = n.children.map(c =>
          `<a href="${c.href}" class="${c.id === activeId ? 'flyout-active' : ''}" data-nav="${c.id}">${c.label}</a>`
        ).join('');
        return `${prefix}
      <div class="shell-nav-group" data-nav="${n.id}">
        <button class="shell-nav-group-toggle${isGroupActive ? ' active open' : ''}" data-group="${n.id}" data-label="${n.label}" aria-expanded="${isGroupActive}" aria-controls="subnav-${n.id}">
          <i class="ti ${n.icon}" aria-hidden="true"></i>
          <span class="shell-nav-label">${n.label}</span>
          <i class="ti ti-chevron-right group-chevron" aria-hidden="true"></i>
        </button>
        <div class="shell-nav-compact-flyout" id="flyout-${n.id}">
          <div class="shell-nav-compact-flyout-title">${n.label}</div>
          ${flyoutLinks}
        </div>
        <div class="shell-nav-subitems${isGroupActive ? ' open' : ''}" id="subnav-${n.id}">
          ${childLinks}
        </div>
      </div>`;
      }
      return `${prefix}
      <a class="shell-nav-item${n.id === activeId ? ' active' : ''}" href="${n.href}" data-nav="${n.id}" data-label="${n.label}" aria-current="${n.id === activeId ? 'page' : 'false'}">
        <i class="ti ${n.icon}" aria-hidden="true"></i>
        <span class="shell-nav-label">${n.label}</span>
      </a>`;
    }).join('');
    const navItems = buildNavItems(NAV);
    const sellerNavItems = buildNavItems(SELLER_NAV);
    const ckBuyerNavItems = buildNavItems(CK_BUYER_NAV);

    const roleMenu = ['HQ','Outlet','Central Kitchen','External'].map(g => {
      const items = ROLES.filter(r => r.group === g).map(r =>
        `<button class="shell-role-item" role="menuitemradio" data-role="${r.id}" aria-checked="false">
           <span class="ra" aria-hidden="true">${r.short}</span>${r.label}
           <i class="ti ti-check tick" aria-hidden="true"></i>
         </button>`).join('');
      return `<div class="shell-role-group">${g}</div>${items}`;
    }).join('');

    const agentRows = AGENTS.map(a =>
      `<button class="shell-toggle-row" role="menuitemcheckbox" data-fn="${a.fn}" aria-checked="true">
         <span class="tg-icon">${a.short}</span>
         <span class="tg-label"><strong>${a.name}</strong><small>${a.who}</small></span>
         <span class="tg-switch" aria-hidden="true"></span>
       </button>`).join('');

    return `
      <div class="shell-overlay" id="shell-overlay" aria-hidden="true"></div>

      <aside class="shell-chrome" id="shell-chrome" aria-label="Main navigation">
        <a class="shell-wordmark" href="dashboard.html" aria-label="Nomni HQ home">
          <div class="shell-wordmark-icon" aria-hidden="true">
            <svg viewBox="0 0 138.195 157.144" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.941 30.552C21.157 29.542 22.148 28.896 23.158 29.111L115.484 48.735C116.494 48.951 117.14 49.942 116.925 50.952L115.362 58.322C114.801 60.941 114.043 63.467 113.107 65.89L132.117 61.849C133.128 61.634 134.12 62.279 134.335 63.289L136.683 74.336C144.849 112.732 119.085 150.482 79.635 156.412C43.253 161.874 9.472 136.152 1.838 100.254L0.042 91.826C-0.173 90.816 0.472 89.824 1.482 89.609L33.14 82.885C21.493 71.015 16.095 53.318 19.763 36.052L20.932 30.562ZM92.068 0.041C93.079-0.174 94.07 0.471 94.285 1.481L94.818 3.97C97.559 16.859 88.916 29.532 75.669 31.524C63.461 33.358 52.112 24.725 49.549 12.668L49.203 11.06C48.988 10.049 49.633 9.058 50.644 8.843Z" fill="#2AC864"/>
            </svg>
          </div>
          <span class="shell-wordmark-text">nomni <span style="font-weight:400;opacity:0.65;" id="shell-wordmark-product">procure</span></span>
        </a>
        <nav class="shell-nav" aria-label="Module navigation">
          <div class="shell-nav-ws" data-ws="buyer">${navItems}</div>
          <div class="shell-nav-ws" data-ws="seller" style="display:none">
            ${sellerNavItems}
            <div class="shell-nav-ws-sub" data-ws-sub="ck-buying" style="display:none">
              <div class="shell-nav-divider" aria-hidden="true"></div>
              <div class="shell-nav-section-label">Purchasing</div>
              ${ckBuyerNavItems}
            </div>
          </div>
          <div class="shell-nav-footer">
            <a class="shell-nav-item${typeof activeId !== 'undefined' && (activeId === 'settings' || activeId === 'seller-settings' || activeId === 'seller-settings-delivery') ? ' active' : ''}" href="settings.html" id="shell-settings-link" data-label="Settings" aria-label="Settings">
              <i class="ti ti-settings" aria-hidden="true"></i>
              <span class="shell-nav-label">Settings</span>
            </a>
            <a class="shell-nav-item" href="login.html" data-label="Sign out" aria-label="Sign out">
              <i class="ti ti-logout" aria-hidden="true"></i>
              <span class="shell-nav-label">Sign out</span>
            </a>
            <button class="shell-collapse-btn" id="shell-collapse-btn" aria-label="Collapse navigation">
              <i class="ti ti-chevron-left" id="shell-collapse-icon" aria-hidden="true"></i>
              <span class="shell-nav-label" style="font-size:12px;">Collapse</span>
            </button>
          </div>
        </nav>
      </aside>

      <div class="shell-main">
        <header class="shell-topbar">
          <div class="shell-topbar-left">
            <button class="shell-icon-btn shell-hamburger" id="shell-hamburger" aria-label="Open navigation" aria-expanded="false" aria-controls="shell-chrome">
              <i class="ti ti-menu-2" aria-hidden="true"></i>
            </button>
            <span class="shell-topbar-title">${pageTitle || 'HQ Module'}</span>
          </div>
          <div class="shell-topbar-actions">
            <div class="shell-agentswitch">
              <button class="shell-agents-btn" id="shell-agents-btn" aria-haspopup="menu" aria-expanded="false" title="Demo: turn the AI agent layer on or off">
                <i class="ti ti-sparkles va-spark" aria-hidden="true"></i>
                <span class="va-label">Agents</span>
                <span class="agents-dot" aria-hidden="true"></span>
              </button>
              <div class="shell-agents-menu" id="shell-agents-menu" role="menu" aria-label="AI agents">
                <div class="shell-role-hint">Demo control — simulate a staged agent rollout.</div>
                <button class="shell-toggle-row" id="shell-agents-master" data-master role="menuitemcheckbox" aria-checked="true">
                  <span class="tg-icon" aria-hidden="true"><i class="ti ti-robot"></i></span>
                  <span class="tg-label"><strong>AI agents</strong><small>Master switch</small></span>
                  <span class="tg-switch" aria-hidden="true"></span>
                </button>
                <div class="shell-agents-divider"></div>
                ${agentRows}
              </div>
            </div>
            <div class="shell-roleswitch">
              <button class="shell-role-btn" id="shell-role-btn" aria-haspopup="menu" aria-expanded="false" title="Demo: switch the role you're viewing as">
                <i class="ti ti-eye va-eye" aria-hidden="true"></i>
                <span class="va-label" id="shell-role-label">HQ Administrator</span>
                <i class="ti ti-chevron-down va-caret" aria-hidden="true"></i>
              </button>
              <div class="shell-role-menu" id="shell-role-menu" role="menu" aria-label="View as role">
                <div class="shell-role-hint">Demo control — preview what each role sees.</div>
                ${roleMenu}
              </div>
            </div>
            <button class="shell-icon-btn shell-search-btn" aria-label="Search (⌘K)">
              <i class="ti ti-search" aria-hidden="true"></i>
            </button>
            <button class="shell-icon-btn" aria-label="Notifications">
              <i class="ti ti-bell" aria-hidden="true"></i>
            </button>
            <div class="shell-avatar" role="img" aria-label="HQ Administrator">HQ</div>
          </div>
        </header>
        <div class="shell-content" id="shell-content">
    `;
  }

  /* ── Public API ── */
  window.NomniShell = {
    init(pageTitle) {
      document.body.innerHTML =
        `<div class="shell-layout">${buildShell(pageTitle)}${document.body.innerHTML}</div></div></div>`;

      // Wire up hamburger
      const hamburger = document.getElementById('shell-hamburger');
      const chrome    = document.getElementById('shell-chrome');
      const overlay   = document.getElementById('shell-overlay');

      function openNav() {
        chrome.classList.add('open');
        overlay.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }
      function closeNav() {
        chrome.classList.remove('open');
        overlay.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }

      if (hamburger) hamburger.addEventListener('click', openNav);
      if (overlay)   overlay.addEventListener('click', closeNav);

      // ── Role switcher ──
      const roleBtn  = document.getElementById('shell-role-btn');
      const roleMenu = document.getElementById('shell-role-menu');

      function applyRole(roleId) {
        const role = ROLES.find(r => r.id === roleId) || ROLES[0];
        document.documentElement.setAttribute('data-role', role.id);
        document.documentElement.setAttribute('data-tier', role.tier);
        document.documentElement.setAttribute('data-ws', role.ws);
        try { localStorage.setItem('nomni_role', role.id); } catch (e) {}

        // Swap workspace: buyer nav vs seller nav, wordmark follows
        document.querySelectorAll('.shell-nav-ws').forEach(b =>
          b.style.display = b.getAttribute('data-ws') === role.ws ? '' : 'none');
        // CK operator also gets a "Purchasing" sub-section under the seller nav —
        // a CK buys from real suppliers as well as selling to its own outlets.
        const ckBuying = document.querySelector('[data-ws-sub="ck-buying"]');
        if (ckBuying) ckBuying.style.display = role.buys ? '' : 'none';
        const wm = document.getElementById('shell-wordmark-product');
        if (wm) wm.textContent = role.ws === 'seller' ? 'supply' : 'procure';
        const wmLink = document.querySelector('.shell-wordmark');
        if (wmLink) wmLink.setAttribute('href', role.ws === 'seller' ? 'seller-orders.html' : 'dashboard.html');
        const settingsLink = document.getElementById('shell-settings-link');
        if (settingsLink) settingsLink.setAttribute('href', role.ws === 'seller' ? 'seller-settings.html' : 'settings.html');

        // Filter buyer nav per role (seller nav is workspace-gated, not role-filtered)
        document.querySelectorAll('.shell-nav-ws[data-ws="buyer"] [data-nav]').forEach(a => {
          const allowed = NAV_ROLES[a.getAttribute('data-nav')] || ALL;
          a.style.display = allowed.includes(role.id) ? '' : 'none';
        });
        // Hide the admin divider when no admin items are visible
        const adminVisible = ['outlets','suppliers','users'].some(id => (NAV_ROLES[id] || []).includes(role.id));
        const divider = document.querySelector('.shell-nav-divider');
        if (divider) divider.style.display = adminVisible ? '' : 'none';

        // Reflect in the switcher + avatar
        const lbl = document.getElementById('shell-role-label');
        if (lbl) lbl.textContent = role.label;
        const av = document.querySelector('.shell-avatar');
        if (av) { av.textContent = role.short; av.setAttribute('aria-label', role.label); }
        document.querySelectorAll('.shell-role-item').forEach(it =>
          it.setAttribute('aria-checked', it.dataset.role === role.id ? 'true' : 'false'));
      }

      function toggleRoleMenu(open) {
        const show = open !== undefined ? open : !roleMenu.classList.contains('open');
        roleMenu.classList.toggle('open', show);
        if (roleBtn) roleBtn.setAttribute('aria-expanded', show ? 'true' : 'false');
      }
      if (roleBtn) roleBtn.addEventListener('click', e => { e.stopPropagation(); toggleRoleMenu(); });
      document.querySelectorAll('.shell-role-item').forEach(it =>
        it.addEventListener('click', () => { applyRole(it.dataset.role); toggleRoleMenu(false); }));
      document.addEventListener('click', e => {
        if (roleMenu && !e.target.closest('.shell-roleswitch')) toggleRoleMenu(false);
      });

      // Apply persisted role on load
      applyRole(currentRole().id);

      // Public role API
      window.NomniRole = {
        get current() { return currentRole(); },
        set(id) { applyRole(id); },
        roles: ROLES,
      };

      // ── Agents on/off ──
      const agentsBtn  = document.getElementById('shell-agents-btn');
      const agentsMenu = document.getElementById('shell-agents-menu');
      const masterRow  = document.getElementById('shell-agents-master');

      function applyAgents() {
        const master = agentsMaster();
        const fns = fnState();
        document.documentElement.setAttribute('data-agents', master ? 'on' : 'off');
        AGENTS.forEach(a => {
          const on = fns[a.fn] !== false;
          document.documentElement.setAttribute('data-fn-' + a.fn, on ? 'on' : 'off');
        });
        // Reflect master switch + dim the per-agent rows when off
        if (masterRow) masterRow.setAttribute('aria-checked', master ? 'true' : 'false');
        if (agentsMenu) agentsMenu.classList.toggle('master-off', !master);
        document.querySelectorAll('.shell-toggle-row[data-fn]').forEach(row => {
          const on = fns[row.dataset.fn] !== false;
          row.setAttribute('aria-checked', on ? 'true' : 'false');
        });
      }
      function setMaster(on) { try { localStorage.setItem('nomni_agents', on ? 'on' : 'off'); } catch (e) {} applyAgents(); }
      function setFn(fn, on) {
        const fns = fnState(); fns[fn] = on;
        try { localStorage.setItem('nomni_fn', JSON.stringify(fns)); } catch (e) {}
        applyAgents();
      }
      function toggleAgentsMenu(open) {
        const show = open !== undefined ? open : !agentsMenu.classList.contains('open');
        agentsMenu.classList.toggle('open', show);
        if (agentsBtn) agentsBtn.setAttribute('aria-expanded', show ? 'true' : 'false');
      }
      if (agentsBtn) agentsBtn.addEventListener('click', e => { e.stopPropagation(); toggleAgentsMenu(); });
      if (masterRow) masterRow.addEventListener('click', () => setMaster(masterRow.getAttribute('aria-checked') !== 'true'));
      document.querySelectorAll('.shell-toggle-row[data-fn]').forEach(row =>
        row.addEventListener('click', () => setFn(row.dataset.fn, row.getAttribute('aria-checked') !== 'true')));
      document.addEventListener('click', e => {
        if (agentsMenu && !e.target.closest('.shell-agentswitch')) toggleAgentsMenu(false);
      });

      applyAgents();
      window.NomniAgents = {
        get master() { return agentsMaster(); },
        setMaster, setFn, agents: AGENTS,
      };

      // ── Nav collapse (desktop icon rail) ──
      const collapseBtn  = document.getElementById('shell-collapse-btn');
      const collapseIcon = document.getElementById('shell-collapse-icon');

      function setNavCollapsed(collapsed) {
        chrome.classList.toggle('nav-collapsed', collapsed);
        if (collapseIcon) collapseIcon.className = `ti ${collapsed ? 'ti-chevron-right' : 'ti-chevron-left'}`;
        if (collapseBtn) collapseBtn.setAttribute('aria-label', collapsed ? 'Expand navigation' : 'Collapse navigation');
        try { localStorage.setItem('nomni_nav_collapsed', collapsed ? 'true' : 'false'); } catch (e) {}
      }

      // Restore persisted preference
      try { if (localStorage.getItem('nomni_nav_collapsed') === 'true') setNavCollapsed(true); } catch (e) {}

      if (collapseBtn) collapseBtn.addEventListener('click', () => setNavCollapsed(!chrome.classList.contains('nav-collapsed')));

      // Sub-nav group toggle
      document.querySelectorAll('.shell-nav-group-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
          const groupId = btn.dataset.group;
          const subitems = document.getElementById('subnav-' + groupId);
          const flyout   = document.getElementById('flyout-' + groupId);
          if (!subitems) return;

          if (chrome.classList.contains('nav-collapsed')) {
            // Collapsed mode: show compact flyout
            if (!flyout) return;
            const isOpen = flyout.classList.contains('open');
            document.querySelectorAll('.shell-nav-compact-flyout.open').forEach(f => {
              if (f !== flyout) f.classList.remove('open');
            });
            flyout.classList.toggle('open', !isOpen);
            return;
          }

          // Normal mode: toggle subitems
          const isOpen = subitems.classList.contains('open');
          subitems.classList.toggle('open', !isOpen);
          btn.classList.toggle('open', !isOpen);
          btn.setAttribute('aria-expanded', String(!isOpen));
        });
      });

      // Close compact flyouts when clicking outside the nav group
      document.addEventListener('click', e => {
        if (!e.target.closest('.shell-nav-compact-flyout') && !e.target.closest('.shell-nav-group-toggle')) {
          document.querySelectorAll('.shell-nav-compact-flyout.open').forEach(f => f.classList.remove('open'));
        }
      });

      // Close on Escape
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') { closeNav(); toggleRoleMenu(false); toggleAgentsMenu(false); }
      });
    },

    html: buildShell,

    /* Stagger row enters on any [data-stagger] tbody in the document.
       Call after your table rows are in the DOM. */
    initStagger() {
      document.querySelectorAll('[data-stagger]').forEach(tbody => {
        tbody.querySelectorAll('tr').forEach((tr, i) => {
          tr.style.setProperty('--si', i);
        });
      });
    },
  };
})();
