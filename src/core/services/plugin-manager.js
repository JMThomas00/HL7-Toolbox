// Plugin Manager - Core Plugin System

class PluginManager {
  constructor() {
    this.plugins = new Map();
    this.activePlugin = null;
    this.pluginOrder = [];
    this.services = null;
  }

  /**
   * Initialize the plugin manager
   */
  async initialize() {
    // Set up shared services for plugins
    this.services = {
      eventBus: window.EventBus,
      config: window.ConfigService,
      file: window.FileService,
      csv: window.CSVService,
      template: window.TemplateService,
      notification: window.Notification,
      modal: window.Modal
    };

    // Load plugins
    await this.discoverPlugins();
    await this.loadAllPlugins();

    console.log('[PluginManager] Initialized with', this.plugins.size, 'plugins');
  }

  /**
   * Discover available plugins
   */
  async discoverPlugins() {
    // For bundled plugins, we'll manually register them
    // In Phase 1, plugins are bundled with the app
    
    // This array will be populated as we create plugins
    this.pluginOrder = [
      // Plugins will be registered here
      // e.g., 'hl7-creator', 'hl7-editor', etc.
    ];
  }

  /**
   * Register a plugin class
   * @param {string} pluginId - Plugin identifier
   * @param {Class} PluginClass - Plugin class constructor
   * @param {Object} manifest - Plugin manifest
   */
  registerPlugin(pluginId, PluginClass, manifest) {
    this.plugins.set(pluginId, {
      id: pluginId,
      class: PluginClass,
      manifest: manifest,
      instance: null,
      loaded: false,
      active: false
    });

    // Add to load order if not already present
    if (!this.pluginOrder.includes(pluginId)) {
      this.pluginOrder.push(pluginId);
    }

    console.log(`[PluginManager] Registered plugin: ${manifest.name}`);
  }

  /**
   * Load all registered plugins
   */
  async loadAllPlugins() {
    for (const pluginId of this.pluginOrder) {
      await this.loadPlugin(pluginId);
    }
  }

  /**
   * Load a single plugin
   * @param {string} pluginId - Plugin identifier
   */
  async loadPlugin(pluginId) {
    const pluginEntry = this.plugins.get(pluginId);
    
    if (!pluginEntry) {
      console.error(`[PluginManager] Plugin not found: ${pluginId}`);
      return false;
    }

    if (pluginEntry.loaded) {
      console.log(`[PluginManager] Plugin already loaded: ${pluginId}`);
      return true;
    }

    try {
      // Create plugin instance
      pluginEntry.instance = new pluginEntry.class(this.services);

      // Load plugin configuration
      await window.ConfigService.loadPluginConfig(pluginId);

      // Initialize plugin
      if (pluginEntry.instance.initialize) {
        await pluginEntry.instance.initialize();
      }

      pluginEntry.loaded = true;

      // Add tab to UI
      window.TabBar.addTab(pluginId, pluginEntry.manifest.name, pluginEntry.manifest.icon);

      window.EventBus.emit('plugin:loaded', pluginId);
      console.log(`[PluginManager] Loaded plugin: ${pluginEntry.manifest.name}`);
      
      return true;
    } catch (error) {
      console.error(`[PluginManager] Error loading plugin ${pluginId}:`, error);
      return false;
    }
  }

  /**
   * Activate a plugin (make it visible)
   * @param {string} pluginId - Plugin identifier
   */
  async activatePlugin(pluginId) {
    const pluginEntry = this.plugins.get(pluginId);
    
    if (!pluginEntry || !pluginEntry.loaded) {
      console.error(`[PluginManager] Cannot activate unloaded plugin: ${pluginId}`);
      return false;
    }

    try {
      // Deactivate current plugin
      if (this.activePlugin) {
        await this.deactivatePlugin(this.activePlugin);
      }

      // Get plugin container element
      const container = pluginEntry.instance.getContainer();
      
      if (!container) {
        console.error(`[PluginManager] Plugin has no container: ${pluginId}`);
        return false;
      }

      // Add container to DOM
      const pluginContainer = document.getElementById('plugin-container');
      pluginContainer.innerHTML = '';
      pluginContainer.appendChild(container);

      // Call plugin's activate method
      if (pluginEntry.instance.activate) {
        await pluginEntry.instance.activate();
      }

      pluginEntry.active = true;
      this.activePlugin = pluginId;

      // Update tab UI
      window.TabBar.setActiveTab(pluginId);

      // Save last active plugin
      await window.ConfigService.setAppSetting('lastActivePlugin', pluginId);

      window.EventBus.emit('plugin:activated', pluginId);
      console.log(`[PluginManager] Activated plugin: ${pluginEntry.manifest.name}`);
      
      return true;
    } catch (error) {
      console.error(`[PluginManager] Error activating plugin ${pluginId}:`, error);
      return false;
    }
  }

  /**
   * Deactivate a plugin
   * @param {string} pluginId - Plugin identifier
   */
  async deactivatePlugin(pluginId) {
    const pluginEntry = this.plugins.get(pluginId);
    
    if (!pluginEntry || !pluginEntry.active) {
      return;
    }

    try {
      // Call plugin's deactivate method
      if (pluginEntry.instance.deactivate) {
        await pluginEntry.instance.deactivate();
      }

      pluginEntry.active = false;

      window.EventBus.emit('plugin:deactivated', pluginId);
      console.log(`[PluginManager] Deactivated plugin: ${pluginEntry.manifest.name}`);
    } catch (error) {
      console.error(`[PluginManager] Error deactivating plugin ${pluginId}:`, error);
    }
  }

  /**
   * Unload a plugin
   * @param {string} pluginId - Plugin identifier
   */
  async unloadPlugin(pluginId) {
    const pluginEntry = this.plugins.get(pluginId);
    
    if (!pluginEntry || !pluginEntry.loaded) {
      return;
    }

    try {
      // Deactivate if active
      if (pluginEntry.active) {
        await this.deactivatePlugin(pluginId);
      }

      // Call plugin's cleanup method
      if (pluginEntry.instance.cleanup) {
        await pluginEntry.instance.cleanup();
      }

      pluginEntry.instance = null;
      pluginEntry.loaded = false;

      // Remove tab from UI
      window.TabBar.removeTab(pluginId);

      window.EventBus.emit('plugin:unloaded', pluginId);
      console.log(`[PluginManager] Unloaded plugin: ${pluginEntry.manifest.name}`);
    } catch (error) {
      console.error(`[PluginManager] Error unloading plugin ${pluginId}:`, error);
    }
  }

  /**
   * Reload a plugin
   * @param {string} pluginId - Plugin identifier
   */
  async reloadPlugin(pluginId) {
    await this.unloadPlugin(pluginId);
    await this.loadPlugin(pluginId);
    
    // Reactivate if it was the active plugin
    if (this.activePlugin === pluginId) {
      await this.activatePlugin(pluginId);
    }
  }

  /**
   * Reload all plugins
   */
  async reloadAllPlugins() {
    const activeId = this.activePlugin;
    
    for (const pluginId of this.pluginOrder) {
      await this.reloadPlugin(pluginId);
    }

    // Restore active plugin
    if (activeId) {
      await this.activatePlugin(activeId);
    }
  }

  /**
   * Get plugin instance
   * @param {string} pluginId - Plugin identifier
   * @returns {Object} Plugin instance or null
   */
  getPlugin(pluginId) {
    const entry = this.plugins.get(pluginId);
    return entry ? entry.instance : null;
  }

  /**
   * Get active plugin
   * @returns {Object} Active plugin instance or null
   */
  getActivePlugin() {
    return this.activePlugin ? this.getPlugin(this.activePlugin) : null;
  }

  /**
   * Get all plugins
   * @returns {Array<Object>} Array of plugin entries
   */
  getAllPlugins() {
    return Array.from(this.plugins.values());
  }

  /**
   * Get loaded plugins
   * @returns {Array<Object>} Array of loaded plugin entries
   */
  getLoadedPlugins() {
    return this.getAllPlugins().filter(p => p.loaded);
  }

  /**
   * Check if plugin is loaded
   * @param {string} pluginId - Plugin identifier
   * @returns {boolean} True if loaded
   */
  isPluginLoaded(pluginId) {
    const entry = this.plugins.get(pluginId);
    return entry ? entry.loaded : false;
  }

  /**
   * Check if plugin is active
   * @param {string} pluginId - Plugin identifier
   * @returns {boolean} True if active
   */
  isPluginActive(pluginId) {
    return this.activePlugin === pluginId;
  }

  /**
   * Get plugin manifest
   * @param {string} pluginId - Plugin identifier
   * @returns {Object} Plugin manifest or null
   */
  getPluginManifest(pluginId) {
    const entry = this.plugins.get(pluginId);
    return entry ? entry.manifest : null;
  }

  /**
   * Send message to active plugin
   * @param {string} action - Action name
   * @param {*} data - Data to send
   */
  sendToActivePlugin(action, data) {
    const plugin = this.getActivePlugin();
    
    if (!plugin) {
      console.warn('[PluginManager] No active plugin to send message to');
      return;
    }

    if (typeof plugin.handleMessage === 'function') {
      plugin.handleMessage(action, data);
    }
  }

  /**
   * Handle menu action (delegate to active plugin)
   * @param {string} action - Menu action
   */
  handleMenuAction(action) {
    const plugin = this.getActivePlugin();
    
    if (!plugin) {
      console.warn('[PluginManager] No active plugin for menu action:', action);
      return;
    }

    if (typeof plugin.handleMenuAction === 'function') {
      plugin.handleMenuAction(action);
    }
  }
}

// Create global plugin manager instance
window.PluginManager = new PluginManager();
