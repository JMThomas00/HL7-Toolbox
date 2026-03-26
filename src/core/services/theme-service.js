// Theme Service - Manages application themes

class ThemeService {
  constructor() {
    this.currentTheme = 'classiq';
    this.themes = {
      classiq: {
        name: 'Classiq',
        colors: {
          // Core Colors
          '--bg-color': '#1F2139',
          '--bg-secondary': '#2A2D4A',
          '--bg-tertiary': '#1E1E1E',

          // Brand Colors
          '--brand-primary': '#465BE7',
          '--brand-secondary': '#7DCAE3',
          '--brand-hover': '#5A6FF7',

          // Text Colors
          '--text-primary': '#FFFFFF',
          '--text-secondary': '#B0B3C8',
          '--text-muted': '#808080',

          // Border Colors
          '--border-color': '#3A3D5A',
          '--border-light': '#4A4D6A',

          // Status Colors
          '--success': '#4CAF50',
          '--warning': '#FF9800',
          '--error': '#F44336',
          '--info': '#2196F3',

          // Interactive Elements
          '--button-bg': '#465BE7',
          '--button-hover': '#5A6FF7',
          '--input-bg': '#2A2D4A',
          '--preview-bg': '#1E1E1E',

          // Tab Colors
          '--tab-active': '#465BE7',
          '--tab-inactive': 'transparent',
          '--tab-hover': 'rgba(70, 91, 231, 0.3)'
        }
      },
      dracula: {
        name: 'Dracula',
        colors: {
          // Core Colors
          '--bg-color': '#282A36',
          '--bg-secondary': '#44475A',
          '--bg-tertiary': '#21222C',

          // Brand Colors
          '--brand-primary': '#BD93F9',
          '--brand-secondary': '#8BE9FD',
          '--brand-hover': '#C9A8FF',

          // Text Colors
          '--text-primary': '#F8F8F2',
          '--text-secondary': '#B8B8B2',
          '--text-muted': '#6272A4',

          // Border Colors
          '--border-color': '#44475A',
          '--border-light': '#6272A4',

          // Status Colors
          '--success': '#50FA7B',
          '--warning': '#FFB86C',
          '--error': '#FF5555',
          '--info': '#8BE9FD',

          // Interactive Elements
          '--button-bg': '#BD93F9',
          '--button-hover': '#C9A8FF',
          '--input-bg': '#44475A',
          '--preview-bg': '#21222C',

          // Tab Colors
          '--tab-active': '#BD93F9',
          '--tab-inactive': 'transparent',
          '--tab-hover': 'rgba(189, 147, 249, 0.3)'
        }
      }
    };
  }

  /**
   * Initialize theme service
   */
  async initialize() {
    // Load saved theme preference
    const savedTheme = window.ConfigService.getAppSetting('theme', 'classiq');
    await this.setTheme(savedTheme);

    console.log('[ThemeService] Initialized with theme:', this.currentTheme);
  }

  /**
   * Set active theme
   * @param {string} themeId - Theme identifier
   */
  async setTheme(themeId) {
    if (!this.themes[themeId]) {
      console.error(`[ThemeService] Theme not found: ${themeId}`);
      return false;
    }

    const theme = this.themes[themeId];
    const root = document.documentElement;

    // Apply theme colors
    Object.entries(theme.colors).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    this.currentTheme = themeId;

    // Save theme preference
    await window.ConfigService.setAppSetting('theme', themeId);

    // Emit theme changed event
    window.EventBus.emit('theme:changed', themeId);

    console.log(`[ThemeService] Applied theme: ${theme.name}`);
    return true;
  }

  /**
   * Get current theme ID
   * @returns {string} Current theme identifier
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Get all available themes
   * @returns {Array<Object>} Array of theme info
   */
  getAvailableThemes() {
    return Object.entries(this.themes).map(([id, theme]) => ({
      id,
      name: theme.name
    }));
  }

  /**
   * Get theme info
   * @param {string} themeId - Theme identifier
   * @returns {Object} Theme info or null
   */
  getTheme(themeId) {
    return this.themes[themeId] || null;
  }

  /**
   * Check if theme exists
   * @param {string} themeId - Theme identifier
   * @returns {boolean} True if theme exists
   */
  hasTheme(themeId) {
    return !!this.themes[themeId];
  }
}

// Create global instance
window.ThemeService = new ThemeService();
