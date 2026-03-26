// HL7 Toolbox - Main Application Controller

class HL7Toolbox {
  constructor() {
    this.initialized = false;
    this.version = '1.0.0';
  }

  /**
   * Initialize the application
   */
  async initialize() {
    console.log(`[HL7Toolbox] Initializing version ${this.version}...`);

    try {
      // Initialize services
      await this.initializeServices();

      // Initialize UI components
      await this.initializeComponents();

      // Initialize plugin system
      await this.initializePlugins();

      // Restore last state
      await this.restoreState();

      this.initialized = true;
      console.log('[HL7Toolbox] Initialization complete');

      // Emit ready event
      window.EventBus.emit('app:ready');

      // Show welcome if first run
      await this.checkFirstRun();
    } catch (error) {
      console.error('[HL7Toolbox] Initialization failed:', error);
      window.Notification.error(`Failed to initialize application: ${error.message}`);
    }
  }

  /**
   * Initialize all services
   */
  async initializeServices() {
    console.log('[HL7Toolbox] Initializing services...');

    // Initialize in order of dependencies
    await window.ConfigService.initialize();
    await window.ThemeService.initialize();
    await window.FileService.initialize();
    await window.CSVService.initialize();
    await window.TemplateService.initialize();

    console.log('[HL7Toolbox] Services initialized');
  }

  /**
   * Initialize UI components
   */
  async initializeComponents() {
    console.log('[HL7Toolbox] Initializing components...');

    window.TabBar.initialize();
    window.MenuBar.initialize();

    console.log('[HL7Toolbox] Components initialized');
  }

  /**
   * Initialize plugin system
   */
  async initializePlugins() {
    console.log('[HL7Toolbox] Initializing plugin system...');

    await window.PluginManager.initialize();

    // Register bundled plugins

    // HL7 Message Creator Plugin
    window.PluginManager.registerPlugin('hl7-creator', HL7CreatorPlugin, {
      id: 'hl7-creator',
      name: 'HL7 Creator',
      description: 'Create HL7 v2.5 surgical scheduling messages',
      icon: '✍️',
      version: '1.0.0'
    });

    // Load all registered plugins
    await window.PluginManager.loadAllPlugins();

    console.log('[HL7Toolbox] Plugin system initialized');
  }

  /**
   * Restore application state
   */
  async restoreState() {
    console.log('[HL7Toolbox] Restoring state...');

    // Restore zoom level
    const zoom = window.ConfigService.getAppSetting('zoom', 1.0);
    document.body.style.zoom = zoom;

    // Restore last active plugin
    const lastPlugin = window.ConfigService.getAppSetting('lastActivePlugin');
    
    if (lastPlugin && window.PluginManager.isPluginLoaded(lastPlugin)) {
      await window.PluginManager.activatePlugin(lastPlugin);
    } else {
      // Activate first available plugin
      const plugins = window.PluginManager.getLoadedPlugins();
      if (plugins.length > 0) {
        await window.PluginManager.activatePlugin(plugins[0].id);
      }
    }

    console.log('[HL7Toolbox] State restored');
  }

  /**
   * Check if this is first run
   */
  async checkFirstRun() {
    const firstRun = window.ConfigService.getAppSetting('firstRun', true);

    if (firstRun) {
      await this.showWelcome();
      await window.ConfigService.setAppSetting('firstRun', false);
    }
  }

  /**
   * Show welcome message
   */
  async showWelcome() {
    const html = `
      <div class="welcome-content">
        <h2 style="color: var(--brand-primary); text-align: center;">
          Welcome to HL7 <span style="color: var(--brand-secondary);">Toolbox</span>
        </h2>
        <p>
          HL7 Toolbox is a plugin-based application for healthcare HL7 testing and integration.
        </p>
        <h3>Getting Started</h3>
        <ul>
          <li>Select a plugin from the tabs above to get started</li>
          <li>Use the File menu to create, open, and save files</li>
          <li>Press <kbd>Ctrl+?</kbd> or go to Help → Keyboard Shortcuts to see all shortcuts</li>
        </ul>
        <h3>Available Plugins</h3>
        <p>
          Plugins will appear as tabs at the top of the window. Each plugin provides
          specialized functionality for your healthcare integration workflows.
        </p>
      </div>

      <style>
        .welcome-content { line-height: 1.8; }
        .welcome-content h2 { margin-bottom: 20px; }
        .welcome-content h3 { 
          color: var(--brand-secondary); 
          margin-top: 20px; 
          margin-bottom: 10px; 
        }
        .welcome-content ul { 
          margin-left: 20px; 
          margin-top: 10px; 
        }
        .welcome-content li { 
          margin: 8px 0; 
        }
        kbd {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: 3px;
          padding: 2px 6px;
          font-family: var(--font-mono);
          font-size: 11px;
        }
      </style>
    `;

    await window.Modal.custom('Welcome!', html, {
      showCancel: false,
      confirmText: 'Get Started'
    });
  }

  /**
   * Shutdown the application
   */
  async shutdown() {
    console.log('[HL7Toolbox] Shutting down...');

    // Save current state
    const activePlugin = window.PluginManager.activePlugin;
    if (activePlugin) {
      await window.ConfigService.setAppSetting('lastActivePlugin', activePlugin);
    }

    // Cleanup plugins
    const plugins = window.PluginManager.getLoadedPlugins();
    for (const plugin of plugins) {
      await window.PluginManager.unloadPlugin(plugin.id);
    }

    window.EventBus.emit('app:shutdown');
    console.log('[HL7Toolbox] Shutdown complete');
  }

  /**
   * Get application info
   */
  getInfo() {
    return {
      name: 'HL7 Toolbox',
      version: this.version,
      initialized: this.initialized,
      activePlugin: window.PluginManager.activePlugin,
      loadedPlugins: window.PluginManager.getLoadedPlugins().length
    };
  }
}

// Create global application instance
window.HL7Toolbox = new HL7Toolbox();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[HL7Toolbox] DOM ready, starting initialization...');
  await window.HL7Toolbox.initialize();
});

// Handle window close
window.addEventListener('beforeunload', async (e) => {
  // Save state before closing
  await window.HL7Toolbox.shutdown();
});

// Global error handler
window.addEventListener('error', (event) => {
  console.error('[HL7Toolbox] Global error:', event.error);
  window.Notification.error(`An error occurred: ${event.error.message}`);
});

// Global promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('[HL7Toolbox] Unhandled promise rejection:', event.reason);
  window.Notification.error(`An error occurred: ${event.reason}`);
});

// Expose API for console debugging
window.hl7toolbox = {
  app: window.HL7Toolbox,
  plugins: window.PluginManager,
  events: window.EventBus,
  config: window.ConfigService,
  theme: window.ThemeService,
  files: window.FileService,
  csv: window.CSVService,
  templates: window.TemplateService,
  tabs: window.TabBar,
  notify: window.Notification,
  modal: window.Modal
};

console.log('[HL7Toolbox] Application loaded. Type "hl7toolbox" in console for API access.');
