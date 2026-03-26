// Menu Bar Component - Global Menu System

class MenuBarSystem {
  constructor() {
    this.setupMenuHandlers();
  }

  /**
   * Initialize menu bar
   */
  initialize() {
    // Set initial theme checkmark
    const currentTheme = window.ThemeService.getCurrentTheme();
    this.updateThemeCheckmarks(currentTheme);

    console.log('[MenuBar] Initialized');
  }

  /**
   * Set up menu event handlers
   */
  setupMenuHandlers() {
    // File Menu
    this.addHandler('menu-new', () => this.handleNew());
    this.addHandler('menu-open', () => this.handleOpen());
    this.addHandler('menu-save', () => this.handleSave());
    this.addHandler('menu-save-as', () => this.handleSaveAs());
    this.addHandler('menu-quit', () => this.handleQuit());

    // Edit Menu
    this.addHandler('menu-undo', () => this.handleUndo());
    this.addHandler('menu-redo', () => this.handleRedo());
    this.addHandler('menu-copy', () => this.handleCopy());
    this.addHandler('menu-paste', () => this.handlePaste());

    // View Menu
    this.addHandler('menu-zoom-in', () => this.handleZoomIn());
    this.addHandler('menu-zoom-out', () => this.handleZoomOut());
    this.addHandler('menu-zoom-reset', () => this.handleZoomReset());
    this.addHandler('menu-theme-classiq', () => this.handleThemeChange('classiq'));
    this.addHandler('menu-theme-dracula', () => this.handleThemeChange('dracula'));
    this.addHandler('menu-toggle-devtools', () => this.handleToggleDevTools());

    // Plugins Menu
    this.addHandler('menu-plugin-manager', () => this.handlePluginManager());
    this.addHandler('menu-plugin-reload', () => this.handlePluginReload());

    // Help Menu
    this.addHandler('menu-documentation', () => this.handleDocumentation());
    this.addHandler('menu-shortcuts', () => this.handleShortcuts());
    this.addHandler('menu-about', () => this.handleAbout());

    // Set up keyboard shortcuts
    this.setupKeyboardShortcuts();
  }

  /**
   * Add click handler to menu item
   */
  addHandler(elementId, handler) {
    const element = document.getElementById(elementId);
    if (element) {
      element.addEventListener('click', handler);
    }
  }

  /**
   * Set up keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+N - New
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        this.handleNew();
      }

      // Ctrl+O - Open
      if (e.ctrlKey && e.key === 'o') {
        e.preventDefault();
        this.handleOpen();
      }

      // Ctrl+S - Save
      if (e.ctrlKey && e.key === 's' && !e.shiftKey) {
        e.preventDefault();
        this.handleSave();
      }

      // Ctrl+Shift+S - Save As
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        this.handleSaveAs();
      }

      // Ctrl+Z - Undo
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        this.handleUndo();
      }

      // Ctrl+Y - Redo
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        this.handleRedo();
      }

      // Ctrl+Q - Quit
      if (e.ctrlKey && e.key === 'q') {
        e.preventDefault();
        this.handleQuit();
      }

      // Ctrl++ - Zoom In
      if (e.ctrlKey && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        this.handleZoomIn();
      }

      // Ctrl+- - Zoom Out
      if (e.ctrlKey && e.key === '-') {
        e.preventDefault();
        this.handleZoomOut();
      }

      // Ctrl+0 - Reset Zoom
      if (e.ctrlKey && e.key === '0') {
        e.preventDefault();
        this.handleZoomReset();
      }

      // F12 - Toggle DevTools
      if (e.key === 'F12') {
        e.preventDefault();
        this.handleToggleDevTools();
      }

      // Ctrl+Tab - Next Tab
      if (e.ctrlKey && e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        window.TabBar.nextTab();
      }

      // Ctrl+Shift+Tab - Previous Tab
      if (e.ctrlKey && e.shiftKey && e.key === 'Tab') {
        e.preventDefault();
        window.TabBar.previousTab();
      }
    });
  }

  // File Menu Handlers

  handleNew() {
    window.PluginManager.handleMenuAction('new');
  }

  async handleOpen() {
    window.PluginManager.handleMenuAction('open');
  }

  async handleSave() {
    window.PluginManager.handleMenuAction('save');
  }

  async handleSaveAs() {
    window.PluginManager.handleMenuAction('saveAs');
  }

  async handleQuit() {
    const confirmed = await window.Modal.confirm(
      'Are you sure you want to quit? Unsaved changes will be lost.',
      { title: 'Confirm Quit', danger: true }
    );

    if (confirmed) {
      window.close();
    }
  }

  // Edit Menu Handlers

  handleUndo() {
    window.PluginManager.handleMenuAction('undo');
  }

  handleRedo() {
    window.PluginManager.handleMenuAction('redo');
  }

  handleCopy() {
    document.execCommand('copy');
  }

  handlePaste() {
    document.execCommand('paste');
  }

  // View Menu Handlers

  handleZoomIn() {
    const currentZoom = window.ConfigService.getAppSetting('zoom', 1.0);
    const newZoom = Math.min(currentZoom + 0.1, 2.0);
    this.setZoom(newZoom);
  }

  handleZoomOut() {
    const currentZoom = window.ConfigService.getAppSetting('zoom', 1.0);
    const newZoom = Math.max(currentZoom - 0.1, 0.5);
    this.setZoom(newZoom);
  }

  handleZoomReset() {
    this.setZoom(1.0);
  }

  setZoom(zoom) {
    document.body.style.zoom = zoom;
    window.ConfigService.setAppSetting('zoom', zoom);
    window.EventBus.emit('zoom:changed', zoom);
  }

  async handleThemeChange(themeId) {
    await window.ThemeService.setTheme(themeId);
    this.updateThemeCheckmarks(themeId);
    window.Notification.success(`Theme changed to ${window.ThemeService.getTheme(themeId).name}`);
  }

  updateThemeCheckmarks(activeThemeId) {
    // Remove active class from all theme menu items
    document.querySelectorAll('.menu-item-theme').forEach(item => {
      item.classList.remove('active');
    });

    // Add active class to selected theme
    const activeItem = document.querySelector(`[data-theme="${activeThemeId}"]`);
    if (activeItem) {
      activeItem.classList.add('active');
    }
  }

  handleToggleDevTools() {
    // This would need to be implemented in the main process
    // For now, just log
    console.log('[MenuBar] Toggle DevTools (not yet implemented)');
  }

  // Plugins Menu Handlers

  async handlePluginManager() {
    const plugins = window.PluginManager.getAllPlugins();
    
    let html = '<div class="plugin-list">';
    plugins.forEach(plugin => {
      const status = plugin.loaded ? '✓ Loaded' : '✗ Not Loaded';
      const active = plugin.active ? ' (Active)' : '';
      html += `
        <div class="plugin-item">
          <strong>${plugin.manifest.name}</strong> ${active}<br>
          <small>${plugin.manifest.description || ''}</small><br>
          <small>Status: ${status}</small>
        </div>
      `;
    });
    html += '</div>';

    await window.Modal.custom('Plugin Manager', html, {
      showCancel: false,
      confirmText: 'Close'
    });
  }

  async handlePluginReload() {
    const confirmed = await window.Modal.confirm(
      'This will reload all plugins. Continue?',
      { title: 'Reload Plugins' }
    );

    if (confirmed) {
      await window.PluginManager.reloadAllPlugins();
      window.Notification.success('All plugins reloaded');
    }
  }

  // Help Menu Handlers

  handleDocumentation() {
    window.Modal.alert(
      'Documentation is coming soon. Check the project README for now.',
      { title: 'Documentation' }
    );
  }

  async handleShortcuts() {
    const html = `
      <div class="shortcuts-list">
        <h3>File</h3>
        <div><kbd>Ctrl+N</kbd> New</div>
        <div><kbd>Ctrl+O</kbd> Open</div>
        <div><kbd>Ctrl+S</kbd> Save</div>
        <div><kbd>Ctrl+Shift+S</kbd> Save As</div>
        <div><kbd>Ctrl+Q</kbd> Quit</div>

        <h3>Edit</h3>
        <div><kbd>Ctrl+Z</kbd> Undo</div>
        <div><kbd>Ctrl+Y</kbd> Redo</div>
        <div><kbd>Ctrl+C</kbd> Copy</div>
        <div><kbd>Ctrl+V</kbd> Paste</div>

        <h3>View</h3>
        <div><kbd>Ctrl++</kbd> Zoom In</div>
        <div><kbd>Ctrl+-</kbd> Zoom Out</div>
        <div><kbd>Ctrl+0</kbd> Reset Zoom</div>
        <div><kbd>F12</kbd> Toggle DevTools</div>

        <h3>Navigation</h3>
        <div><kbd>Ctrl+Tab</kbd> Next Tab</div>
        <div><kbd>Ctrl+Shift+Tab</kbd> Previous Tab</div>
      </div>

      <style>
        .shortcuts-list { line-height: 1.8; }
        .shortcuts-list h3 { margin-top: 16px; margin-bottom: 8px; color: var(--brand-secondary); }
        .shortcuts-list div { padding: 4px 0; }
        kbd {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: 3px;
          padding: 2px 6px;
          font-family: var(--font-mono);
          font-size: 11px;
          display: inline-block;
          min-width: 60px;
          text-align: center;
        }
      </style>
    `;

    await window.Modal.custom('Keyboard Shortcuts', html, {
      showCancel: false,
      confirmText: 'Close'
    });
  }

  async handleAbout() {
    const html = `
      <div class="about-content">
        <h2 style="color: var(--brand-primary); text-align: center;">
          HL7 <span style="color: var(--brand-secondary);">Toolbox</span>
        </h2>
        <p style="text-align: center; margin: 20px 0;">
          Version 1.0.0
        </p>
        <p>
          A plugin-based toolbox for healthcare HL7 testing and integration.
        </p>
        <p>
          Built with Electron and designed for extensibility.
        </p>
        <p style="margin-top: 20px; font-size: 12px; color: var(--text-secondary);">
          © 2026 JMThomas00. MIT License. All rights reserved.
        </p>
      </div>

      <style>
        .about-content { text-align: left; line-height: 1.8; }
        .about-content h2 { margin-bottom: 10px; }
        .about-content p { margin: 8px 0; }
      </style>
    `;

    await window.Modal.custom('About HL7 Toolbox', html, {
      showCancel: false,
      confirmText: 'Close'
    });
  }
}

// Create global menu bar instance
window.MenuBar = new MenuBarSystem();
