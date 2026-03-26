// File Service - File Operations Wrapper

class FileService {
  constructor() {
    this.recentFiles = [];
    this.maxRecentFiles = 10;
  }

  /**
   * Initialize the file service
   */
  async initialize() {
    await this.loadRecentFiles();
    console.log('[FileService] Initialized');
  }

  /**
   * Save file with dialog
   * @param {string} content - File content
   * @param {string} defaultFilename - Default filename
   * @returns {Promise<Object>} Result object
   */
  async saveFile(content, defaultFilename = 'untitled.txt') {
    try {
      const result = await window.hl7toolboxAPI.file.save(content, defaultFilename);
      
      if (result.success && !result.canceled) {
        await this.addToRecentFiles(result.path);
        window.EventBus.emit('file:saved', { path: result.path });
      }
      
      return result;
    } catch (error) {
      console.error('[FileService] Error saving file:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Open file(s) with dialog
   * @param {Object} options - Open options (filters, etc.)
   * @returns {Promise<Object>} Result object with files array
   */
  async openFiles(options = {}) {
    try {
      const result = await window.hl7toolboxAPI.file.open(options);
      
      if (result.success && !result.canceled) {
        // Add files to recent files list
        for (const file of result.files) {
          await this.addToRecentFiles(file.path);
        }
        
        window.EventBus.emit('file:opened', { files: result.files });
      }
      
      return result;
    } catch (error) {
      console.error('[FileService] Error opening files:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Read file directly by path
   * @param {string} filePath - Path to file
   * @returns {Promise<Object>} Result object
   */
  async readFile(filePath) {
    try {
      const result = await window.hl7toolboxAPI.file.read(filePath);
      
      if (result.success) {
        window.EventBus.emit('file:read', { path: filePath });
      }
      
      return result;
    } catch (error) {
      console.error('[FileService] Error reading file:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Write file directly by path
   * @param {string} filePath - Path to file
   * @param {string} content - File content
   * @returns {Promise<Object>} Result object
   */
  async writeFile(filePath, content) {
    try {
      const result = await window.hl7toolboxAPI.file.write(filePath, content);
      
      if (result.success) {
        await this.addToRecentFiles(filePath);
        window.EventBus.emit('file:written', { path: filePath });
      }
      
      return result;
    } catch (error) {
      console.error('[FileService] Error writing file:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Select directory
   * @returns {Promise<Object>} Result object with path
   */
  async selectDirectory() {
    try {
      const result = await window.hl7toolboxAPI.dir.select();
      
      if (result.success && !result.canceled) {
        window.EventBus.emit('directory:selected', { path: result.path });
      }
      
      return result;
    } catch (error) {
      console.error('[FileService] Error selecting directory:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Add file to recent files list
   * @param {string} filePath - Path to add
   */
  async addToRecentFiles(filePath) {
    // Remove if already exists
    this.recentFiles = this.recentFiles.filter(f => f !== filePath);
    
    // Add to beginning
    this.recentFiles.unshift(filePath);
    
    // Trim to max size
    if (this.recentFiles.length > this.maxRecentFiles) {
      this.recentFiles = this.recentFiles.slice(0, this.maxRecentFiles);
    }
    
    // Save to config
    await window.ConfigService.setAppSetting('recentFiles', this.recentFiles);
    window.EventBus.emit('recentFiles:updated', this.recentFiles);
  }

  /**
   * Get recent files list
   * @returns {Array<string>} Array of file paths
   */
  getRecentFiles() {
    return [...this.recentFiles];
  }

  /**
   * Clear recent files
   */
  async clearRecentFiles() {
    this.recentFiles = [];
    await window.ConfigService.setAppSetting('recentFiles', []);
    window.EventBus.emit('recentFiles:updated', []);
  }

  /**
   * Load recent files from config
   */
  async loadRecentFiles() {
    const recent = window.ConfigService.getAppSetting('recentFiles', []);
    this.recentFiles = Array.isArray(recent) ? recent : [];
  }

  /**
   * Get file extension
   * @param {string} filename - Filename or path
   * @returns {string} Extension without dot
   */
  getFileExtension(filename) {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
  }

  /**
   * Get filename without extension
   * @param {string} filename - Filename or path
   * @returns {string} Filename without extension
   */
  getBasename(filename) {
    const parts = filename.split('.');
    parts.pop();
    return parts.join('.');
  }

  /**
   * Parse filename from full path
   * @param {string} filePath - Full file path
   * @returns {string} Filename
   */
  getFilename(filePath) {
    return filePath.split(/[\\/]/).pop();
  }
}

// Create global file service instance
window.FileService = new FileService();
