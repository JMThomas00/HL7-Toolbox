// Tab Bar Component - Plugin Navigation

class TabBarSystem {
  constructor() {
    this.container = document.getElementById('tab-bar');
    this.tabs = new Map();
    this.activeTab = null;
  }

  /**
   * Initialize tab bar
   */
  initialize() {
    console.log('[TabBar] Initialized');
  }

  /**
   * Add tab
   * @param {string} pluginId - Plugin identifier
   * @param {string} name - Tab name
   * @param {string} icon - Optional icon HTML or emoji
   */
  addTab(pluginId, name, icon = null) {
    if (this.tabs.has(pluginId)) {
      console.warn(`[TabBar] Tab already exists: ${pluginId}`);
      return;
    }

    const tab = this.createTabElement(pluginId, name, icon);
    this.container.appendChild(tab);

    this.tabs.set(pluginId, {
      element: tab,
      name: name,
      icon: icon
    });

    window.EventBus.emit('tab:added', pluginId);
  }

  /**
   * Create tab DOM element
   */
  createTabElement(pluginId, name, icon) {
    const tab = document.createElement('button');
    tab.className = 'tab';
    tab.dataset.pluginId = pluginId;

    if (icon) {
      const iconSpan = document.createElement('span');
      iconSpan.className = 'tab-icon';
      
      if (icon.startsWith('<')) {
        iconSpan.innerHTML = icon;
      } else {
        iconSpan.textContent = icon;
      }
      
      tab.appendChild(iconSpan);
    }

    const nameSpan = document.createElement('span');
    nameSpan.textContent = name;
    tab.appendChild(nameSpan);

    // Click handler
    tab.onclick = () => {
      this.activateTab(pluginId);
    };

    return tab;
  }

  /**
   * Remove tab
   * @param {string} pluginId - Plugin identifier
   */
  removeTab(pluginId) {
    const tabData = this.tabs.get(pluginId);
    
    if (!tabData) {
      return;
    }

    // Remove from DOM
    if (tabData.element.parentNode) {
      tabData.element.parentNode.removeChild(tabData.element);
    }

    this.tabs.delete(pluginId);

    // If this was the active tab, activate another
    if (this.activeTab === pluginId) {
      this.activeTab = null;
      const remaining = Array.from(this.tabs.keys());
      if (remaining.length > 0) {
        this.activateTab(remaining[0]);
      }
    }

    window.EventBus.emit('tab:removed', pluginId);
  }

  /**
   * Activate tab
   * @param {string} pluginId - Plugin identifier
   */
  activateTab(pluginId) {
    const tabData = this.tabs.get(pluginId);
    
    if (!tabData) {
      console.warn(`[TabBar] Tab not found: ${pluginId}`);
      return;
    }

    // Deactivate all tabs
    this.tabs.forEach((data, id) => {
      data.element.classList.remove('active');
    });

    // Activate this tab
    tabData.element.classList.add('active');
    this.activeTab = pluginId;

    // Tell plugin manager to activate the plugin
    window.PluginManager.activatePlugin(pluginId);

    window.EventBus.emit('tab:activated', pluginId);
  }

  /**
   * Set active tab programmatically
   * @param {string} pluginId - Plugin identifier
   */
  setActiveTab(pluginId) {
    const tabData = this.tabs.get(pluginId);
    
    if (!tabData) {
      return;
    }

    // Deactivate all tabs
    this.tabs.forEach((data, id) => {
      data.element.classList.remove('active');
    });

    // Activate this tab
    tabData.element.classList.add('active');
    this.activeTab = pluginId;
  }

  /**
   * Get active tab
   * @returns {string|null} Active plugin ID
   */
  getActiveTab() {
    return this.activeTab;
  }

  /**
   * Get all tabs
   * @returns {Array<string>} Array of plugin IDs
   */
  getAllTabs() {
    return Array.from(this.tabs.keys());
  }

  /**
   * Update tab name
   * @param {string} pluginId - Plugin identifier
   * @param {string} name - New name
   */
  updateTabName(pluginId, name) {
    const tabData = this.tabs.get(pluginId);
    
    if (!tabData) {
      return;
    }

    const nameSpan = tabData.element.querySelector('span:last-child');
    if (nameSpan) {
      nameSpan.textContent = name;
      tabData.name = name;
    }
  }

  /**
   * Highlight tab (e.g., for notifications)
   * @param {string} pluginId - Plugin identifier
   * @param {boolean} highlight - Whether to highlight
   */
  highlightTab(pluginId, highlight = true) {
    const tabData = this.tabs.get(pluginId);
    
    if (!tabData) {
      return;
    }

    if (highlight) {
      tabData.element.classList.add('highlighted');
    } else {
      tabData.element.classList.remove('highlighted');
    }
  }

  /**
   * Navigate to next tab
   */
  nextTab() {
    const tabs = this.getAllTabs();
    if (tabs.length === 0) return;

    const currentIndex = tabs.indexOf(this.activeTab);
    const nextIndex = (currentIndex + 1) % tabs.length;
    this.activateTab(tabs[nextIndex]);
  }

  /**
   * Navigate to previous tab
   */
  previousTab() {
    const tabs = this.getAllTabs();
    if (tabs.length === 0) return;

    const currentIndex = tabs.indexOf(this.activeTab);
    const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
    this.activateTab(tabs[prevIndex]);
  }

  /**
   * Clear all tabs
   */
  clearAll() {
    const pluginIds = Array.from(this.tabs.keys());
    pluginIds.forEach(id => this.removeTab(id));
  }
}

// Create global tab bar instance
window.TabBar = new TabBarSystem();
