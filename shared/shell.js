/**
 * Nomni HQ Module — shared shell
 * Injects nav rail + top bar into every screen.
 * Usage: <script src="../shared/shell.js" data-active="dashboard"></script>
 */
(function () {
  const NAV = [
    { id: 'dashboard',   icon: 'ti-layout-dashboard',  label: 'Overview',     href: 'dashboard.html' },
    { id: 'orders',      icon: 'ti-shopping-cart',      label: 'Orders',       href: 'orders.html' },
    { id: 'inventory',   icon: 'ti-package',            label: 'Inventory',    href: 'inventory.html' },
    { id: 'market-list', icon: 'ti-receipt',            label: 'Market lists', href: 'market-list.html' },
    { id: 'recipes',     icon: 'ti-tools-kitchen-2',    label: 'Recipes',      href: 'recipes.html' },
    { id: 'pos-mapping', icon: 'ti-device-desktop',     label: 'POS mapping',  href: 'pos-mapping.html' },
    { id: 'reporting',   icon: 'ti-chart-bar',          label: 'Reporting',    href: 'reporting.html' },
    { id: 'venues',      icon: 'ti-building-store',     label: 'Venues',       href: 'venues.html' },
    { id: 'suppliers',   icon: 'ti-truck',              label: 'Suppliers',    href: 'suppliers.html' },
    { id: 'users',       icon: 'ti-users',              label: 'Users',        href: 'users.html' },
  ];

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
      transition: transform 0.22s ease;
    }

    /* ── Wordmark ── */
    .shell-wordmark {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      text-decoration: none;
    }
    .shell-wordmark-icon {
      width: 28px; height: 28px;
      background: var(--accent);
      border-radius: var(--radius-sm);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .shell-wordmark-icon svg { width: 16px; height: 16px; fill: var(--seaweed); }
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
    const ADMIN_IDS = new Set(['venues', 'suppliers', 'users']);
    let dividerInserted = false;
    const navItems = NAV.map(n => {
      let prefix = '';
      if (ADMIN_IDS.has(n.id) && !dividerInserted) {
        prefix = '<div class="shell-nav-divider" aria-hidden="true"></div>';
        dividerInserted = true;
      }
      return `${prefix}
      <a class="shell-nav-item${n.id === activeId ? ' active' : ''}" href="${n.href}" aria-current="${n.id === activeId ? 'page' : 'false'}">
        <i class="ti ${n.icon}" aria-hidden="true"></i>
        ${n.label}
      </a>`;
    }).join('');

    return `
      <div class="shell-overlay" id="shell-overlay" aria-hidden="true"></div>

      <aside class="shell-chrome" id="shell-chrome" aria-label="Main navigation">
        <a class="shell-wordmark" href="dashboard.html" aria-label="Nomni HQ home">
          <div class="shell-wordmark-icon" aria-hidden="true">
            <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H3zM9 9h4v4H9z" opacity="0.9"/>
            </svg>
          </div>
          <span class="shell-wordmark-text">nomni</span>
        </a>
        <nav class="shell-nav" aria-label="Module navigation">
          ${navItems}
          <div class="shell-nav-footer">
            <a class="shell-nav-item" href="#settings" aria-label="Settings">
              <i class="ti ti-settings" aria-hidden="true"></i>Settings
            </a>
            <a class="shell-nav-item" href="login.html" aria-label="Sign out">
              <i class="ti ti-logout" aria-hidden="true"></i>Sign out
            </a>
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

      // Close on Escape
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeNav();
      });
    },

    html: buildShell,
  };
})();
