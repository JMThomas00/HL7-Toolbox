// Base Plugin Class - All plugins should extend this

class BasePlugin {
  constructor(services) {
    // Shared services available to all plugins
    this.services = services;
    this.eventBus = services.eventBus;
    this.config = services.config;
    this.file = services.file;
    this.csv = services.csv;
    this.template = services.template;
    this.notification = services.notification;
    this.modal = services.modal;

    // Plugin state
    this.container = null;
    this.initialized = false;
    this.active = false;
  }

  /**
   * Initialize plugin (called once when plugin is loaded)
   * Override this in your plugin
   */
  async initialize() {
    // Load plugin configuration
    const config = await this.config.loadPluginConfig(this.getPluginId());
    
    // Create UI container
    this.container = this.createContainer();
    
    this.initialized = true;
    console.log(`[${this.getPluginId()}] Initialized`);
  }

  /**
   * Create the plugin's main container element
   * Override this in your plugin
   */
  createContainer() {
    const container = document.createElement('div');
    container.className = 'plugin-content';
    container.innerHTML = '<p>Plugin content goes here</p>';
    return container;
  }

  /**
   * Get the plugin's container element
   * Called by plugin manager when activating plugin
   */
  getContainer() {
    return this.container;
  }

  /**
   * Activate plugin (called when tab is clicked/plugin becomes visible)
   * Override this to perform actions when plugin becomes active
   */
  async activate() {
    this.active = true;
    console.log(`[${this.getPluginId()}] Activated`);
  }

  /**
   * Deactivate plugin (called when switching to another tab)
   * Override this to save state or cleanup when plugin becomes inactive
   */
  async deactivate() {
    this.active = false;
    console.log(`[${this.getPluginId()}] Deactivated`);
  }

  /**
   * Cleanup plugin (called when plugin is being unloaded)
   * Override this to cleanup resources, event listeners, etc.
   */
  async cleanup() {
    // Remove event listeners, timers, etc.
    this.container = null;
    this.initialized = false;
    console.log(`[${this.getPluginId()}] Cleaned up`);
  }

  /**
   * Handle menu actions
   * Override this to respond to menu commands
   */
  handleMenuAction(action) {
    console.log(`[${this.getPluginId()}] Menu action: ${action}`);
    
    switch (action) {
      case 'new':
        this.onNew();
        break;
      case 'open':
        this.onOpen();
        break;
      case 'save':
        this.onSave();
        break;
      case 'saveAs':
        this.onSaveAs();
        break;
      case 'undo':
        this.onUndo();
        break;
      case 'redo':
        this.onRedo();
        break;
      default:
        console.log(`[${this.getPluginId()}] Unhandled action: ${action}`);
    }
  }

  /**
   * Handle custom messages from other plugins
   * Override this to handle inter-plugin communication
   */
  handleMessage(action, data) {
    console.log(`[${this.getPluginId()}] Message: ${action}`, data);
  }

  /**
   * Menu action handlers (override these as needed)
   */
  async onNew() {
    console.log(`[${this.getPluginId()}] New action not implemented`);
  }

  async onOpen() {
    console.log(`[${this.getPluginId()}] Open action not implemented`);
  }

  async onSave() {
    console.log(`[${this.getPluginId()}] Save action not implemented`);
  }

  async onSaveAs() {
    console.log(`[${this.getPluginId()}] Save As action not implemented`);
  }

  onUndo() {
    console.log(`[${this.getPluginId()}] Undo action not implemented`);
  }

  onRedo() {
    console.log(`[${this.getPluginId()}] Redo action not implemented`);
  }

  /**
   * Get plugin ID (must be implemented by child class)
   */
  getPluginId() {
    throw new Error('Plugin must implement getPluginId()');
  }

  /**
   * Helper: Get plugin configuration value
   */
  getConfig(key, defaultValue = null) {
    return this.config.getPluginSetting(this.getPluginId(), key, defaultValue);
  }

  /**
   * Helper: Set plugin configuration value
   */
  async setConfig(key, value) {
    await this.config.setPluginSetting(this.getPluginId(), key, value);
  }

  /**
   * Helper: Show notification
   */
  notify(message, type = 'info') {
    return this.notification.show(message, type);
  }

  /**
   * Helper: Show confirmation dialog
   */
  async confirm(message, options = {}) {
    return await this.modal.confirm(message, options);
  }

  /**
   * Helper: Emit event to other plugins
   */
  emit(eventName, data) {
    this.eventBus.emit(eventName, data);
  }

  /**
   * Helper: Listen for events from other plugins
   */
  on(eventName, callback) {
    return this.eventBus.on(eventName, callback);
  }
}

// Make available globally
window.BasePlugin = BasePlugin;
