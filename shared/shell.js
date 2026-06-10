/**
 * Nomni HQ Module — shared shell
 * Injects nav rail + top bar into every screen.
 * Usage: <script src="../shared/shell.js" data-active="dashboard"></script>
 */
(function () {
  const NAV = [
    { id: 'dashboard',   icon: 'ti-layout-dashboard',  label: 'Overview',     href: 'dashboard.html' },
    { id: 'market-list', icon: 'ti-receipt',            label: 'Market lists', href: 'market-list.html' },
    { id: 'recipes',     icon: 'ti-tools-kitchen-2',    label: 'Recipes',      href: 'recipes.html' },
    { id: 'inventory',   icon: 'ti-package',            label: 'Inventory',    href: 'inventory.html' },
    { id: 'pos-mapping', icon: 'ti-device-desktop',     label: 'POS mapping',  href: 'pos-mapping.html' },
    { id: 'reporting',   icon: 'ti-chart-bar',          label: 'Reporting',    href: 'reporting.html' },
  ];

  const script   = document.currentScript;
  const activeId = script ? script.getAttribute('data-active') : '';

  /* ── Tabler Icons CDN (if not already loaded) ── */
  if (!document.querySelector('link[href*="tabler-icons"]')) {
    const link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.19.0/dist/tabler-icons.min.css';
    document.head.appendChild(link);
  }

  /* ── Shell styles ── */
  const style = document.createElement('style');
  style.textContent = `
    .shell-layout {
      display: flex;
      min-height: 100vh;
      background: var(--surface-soft);
    }
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
    }
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
    .shell-nav-footer {
      margin-top: auto;
      padding-top: var(--space-xl);
      border-top: 1px solid rgba(250,247,233,0.1);
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }
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
    }
    .shell-topbar-title {
      font-size: 16px; font-weight: 600;
      color: var(--text);
      letter-spacing: -0.01em;
    }
    .shell-topbar-actions {
      display: flex; align-items: center;
      gap: var(--space-sm);
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
    .shell-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .shell-content {
      flex: 1;
      padding: var(--space-2xl);
      overflow-y: auto;
    }
  `;
  document.head.appendChild(style);

  function buildShell(pageTitle) {
    const navItems = NAV.map(n => `
      <a class="shell-nav-item${n.id === activeId ? ' active' : ''}" href="${n.href}" aria-current="${n.id === activeId ? 'page' : 'false'}">
        <i class="ti ${n.icon}" aria-hidden="true"></i>
        ${n.label}
      </a>
    `).join('');

    return `
      <aside class="shell-chrome" aria-label="Main navigation">
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
          <span class="shell-topbar-title">${pageTitle || 'HQ Module'}</span>
          <div class="shell-topbar-actions">
            <button class="shell-icon-btn" aria-label="Search (⌘K)">
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
    /**
     * Wrap page body content in the shell.
     * Call after DOMContentLoaded with the page title.
     */
    init(pageTitle) {
      document.body.innerHTML =
        `<div class="shell-layout">${buildShell(pageTitle)}${document.body.innerHTML}</div></div></div>`;
    },

    /**
     * Lower-level: return raw shell HTML for manual injection.
     */
    html: buildShell,
  };
})();
