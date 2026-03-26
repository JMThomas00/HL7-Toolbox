// Config Service - Application and Plugin Configuration Management

class ConfigService {
  constructor() {
    this.cache = new Map();
    this.appConfig = {};
    this.pluginConfigs = new Map();
  }

  /**
   * Initialize the config service
   */
  async initialize() {
    try {
      await this.loadAppConfig();
      console.log('[ConfigService] Initialized');
    } catch (error) {
      console.error('[ConfigService] Initialization error:', error);
    }
  }

  /**
   * Load application configuration
   */
  async loadAppConfig() {
    try {
      const result = await window.hl7toolboxAPI.config.read('app-settings.json');
      
      if (result.success) {
        this.appConfig = result.data;
        
        // Apply default settings if not present
        this.appConfig = {
          theme: 'dark',
          zoom: 1.0,
          lastActivePlugin: null,
          windowSize: { width: 1400, height: 900 },
          enableDevTools: false,
          ...this.appConfig
        };
        
        console.log('[ConfigService] App config loaded');
      }
    } catch (error) {
      console.error('[ConfigService] Error loading app config:', error);
      this.appConfig = this.getDefaultAppConfig();
    }
  }

  /**
   * Save application configuration
   */
  async saveAppConfig() {
    try {
      const result = await window.hl7toolboxAPI.config.write('app-settings.json', this.appConfig);
      
      if (result.success) {
        console.log('[ConfigService] App config saved');
        return true;
      }
      return false;
    } catch (error) {
      console.error('[ConfigService] Error saving app config:', error);
      return false;
    }
  }

  /**
   * Get default app configuration
   */
  getDefaultAppConfig() {
    return {
      theme: 'dark',
      zoom: 1.0,
      lastActivePlugin: null,
      windowSize: { width: 1400, height: 900 },
      enableDevTools: false
    };
  }

  /**
   * Get app setting
   * @param {string} key - Setting key
   * @param {*} defaultValue - Default value if not found
   */
  getAppSetting(key, defaultValue = null) {
    return this.appConfig[key] ?? defaultValue;
  }

  /**
   * Set app setting
   * @param {string} key - Setting key
   * @param {*} value - Setting value
   */
  async setAppSetting(key, value) {
    this.appConfig[key] = value;
    await this.saveAppConfig();
    window.EventBus.emit('config:app:changed', { key, value });
  }

  /**
   * Load plugin configuration
   * @param {string} pluginId - Plugin identifier
   */
  async loadPluginConfig(pluginId) {
    try {
      const configName = `plugins/${pluginId}.json`;
      const result = await window.hl7toolboxAPI.config.read(configName);
      
      if (result.success) {
        this.pluginConfigs.set(pluginId, result.data);
        console.log(`[ConfigService] Plugin config loaded: ${pluginId}`);
        return result.data;
      }
      
      // Return empty config if file doesn't exist
      const emptyConfig = {};
      this.pluginConfigs.set(pluginId, emptyConfig);
      return emptyConfig;
    } catch (error) {
      console.error(`[ConfigService] Error loading plugin config for ${pluginId}:`, error);
      return {};
    }
  }

  /**
   * Save plugin configuration
   * @param {string} pluginId - Plugin identifier
   * @param {Object} config - Configuration object
   */
  async savePluginConfig(pluginId, config) {
    try {
      const configName = `plugins/${pluginId}.json`;
      const result = await window.hl7toolboxAPI.config.write(configName, config);
      
      if (result.success) {
        this.pluginConfigs.set(pluginId, config);
        console.log(`[ConfigService] Plugin config saved: ${pluginId}`);
        window.EventBus.emit('config:plugin:changed', { pluginId, config });
        return true;
      }
      return false;
    } catch (error) {
      console.error(`[ConfigService] Error saving plugin config for ${pluginId}:`, error);
      return false;
    }
  }

  /**
   * Get plugin setting
   * @param {string} pluginId - Plugin identifier
   * @param {string} key - Setting key
   * @param {*} defaultValue - Default value if not found
   */
  getPluginSetting(pluginId, key, defaultValue = null) {
    const config = this.pluginConfigs.get(pluginId) || {};
    return config[key] ?? defaultValue;
  }

  /**
   * Set plugin setting
   * @param {string} pluginId - Plugin identifier
   * @param {string} key - Setting key
   * @param {*} value - Setting value
   */
  async setPluginSetting(pluginId, key, value) {
    let config = this.pluginConfigs.get(pluginId) || {};
    config[key] = value;
    await this.savePluginConfig(pluginId, config);
  }

  /**
   * Delete plugin configuration
   * @param {string} pluginId - Plugin identifier
   */
  async deletePluginConfig(pluginId) {
    this.pluginConfigs.delete(pluginId);
    // Note: We don't delete the file, just clear from cache
    console.log(`[ConfigService] Plugin config cleared from cache: ${pluginId}`);
  }

  /**
   * Get all plugin configurations
   */
  getAllPluginConfigs() {
    return Object.fromEntries(this.pluginConfigs);
  }

  /**
   * Clear all cached configs
   */
  clearCache() {
    this.cache.clear();
    console.log('[ConfigService] Cache cleared');
  }

  /**
   * Export all configurations
   */
  async exportConfig() {
    return {
      app: this.appConfig,
      plugins: Object.fromEntries(this.pluginConfigs),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Import configurations
   * @param {Object} configData - Configuration data to import
   */
  async importConfig(configData) {
    try {
      if (configData.app) {
        this.appConfig = { ...this.appConfig, ...configData.app };
        await this.saveAppConfig();
      }

      if (configData.plugins) {
        for (const [pluginId, config] of Object.entries(configData.plugins)) {
          await this.savePluginConfig(pluginId, config);
        }
      }

      console.log('[ConfigService] Configuration imported successfully');
      window.EventBus.emit('config:imported');
      return true;
    } catch (error) {
      console.error('[ConfigService] Error importing config:', error);
      return false;
    }
  }
}

// Create global config service instance
window.ConfigService = new ConfigService();
