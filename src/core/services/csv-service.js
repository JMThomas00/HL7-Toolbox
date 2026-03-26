// CSV Service - CSV Data Loading and Parsing

class CSVService {
  constructor() {
    this.cache = new Map();
    this.cacheEnabled = true;
  }

  /**
   * Initialize the CSV service
   */
  async initialize() {
    console.log('[CSVService] Initialized');
  }

  /**
   * Load and parse CSV file
   * @param {string} filename - CSV filename (relative to data directory)
   * @param {boolean} useCache - Whether to use cached data
   * @returns {Promise<Array<Object>>} Array of parsed objects
   */
  async loadCSV(filename, useCache = true) {
    try {
      // Check cache first
      if (useCache && this.cacheEnabled && this.cache.has(filename)) {
        console.log(`[CSVService] Using cached data for: ${filename}`);
        return this.cache.get(filename);
      }

      // Load from file
      const result = await window.hl7toolboxAPI.csv.load(filename);
      
      if (!result.success) {
        console.error(`[CSVService] Failed to load CSV: ${filename}`);
        return [];
      }

      // Parse CSV content
      const data = this.parseCSV(result.content);
      
      // Cache the result
      if (this.cacheEnabled) {
        this.cache.set(filename, data);
      }

      console.log(`[CSVService] Loaded and parsed: ${filename} (${data.length} rows)`);
      window.EventBus.emit('csv:loaded', { filename, rowCount: data.length });
      
      return data;
    } catch (error) {
      console.error(`[CSVService] Error loading CSV ${filename}:`, error);
      return [];
    }
  }

  /**
   * Parse CSV string into array of objects
   * @param {string} csvContent - CSV content
   * @returns {Array<Object>} Parsed data
   */
  parseCSV(csvContent) {
    const lines = csvContent.trim().split('\n');
    
    if (lines.length === 0) {
      return [];
    }

    // Parse header
    const headers = this.parseCSVLine(lines[0]);
    
    // Parse rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) {
        continue;
      }

      const values = this.parseCSVLine(line);
      
      // Create object from headers and values
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      data.push(row);
    }

    return data;
  }

  /**
   * Parse single CSV line (handles quoted values)
   * @param {string} line - CSV line
   * @returns {Array<string>} Array of values
   */
  parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of value
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    // Add last value
    values.push(current.trim());

    return values;
  }

  /**
   * Convert array of objects to CSV string
   * @param {Array<Object>} data - Array of objects
   * @param {Array<string>} headers - Optional header array (uses object keys if not provided)
   * @returns {string} CSV string
   */
  toCSV(data, headers = null) {
    if (!data || data.length === 0) {
      return '';
    }

    // Get headers
    const headerArray = headers || Object.keys(data[0]);
    
    // Build CSV
    const lines = [];
    
    // Add header line
    lines.push(headerArray.map(h => this.escapeCSVValue(h)).join(','));
    
    // Add data lines
    data.forEach(row => {
      const values = headerArray.map(header => {
        const value = row[header];
        return this.escapeCSVValue(value);
      });
      lines.push(values.join(','));
    });

    return lines.join('\n');
  }

  /**
   * Escape CSV value (add quotes if needed)
   * @param {*} value - Value to escape
   * @returns {string} Escaped value
   */
  escapeCSVValue(value) {
    if (value === null || value === undefined) {
      return '';
    }

    const str = String(value);
    
    // Check if value needs quoting
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      // Escape quotes by doubling them
      const escaped = str.replace(/"/g, '""');
      return `"${escaped}"`;
    }

    return str;
  }

  /**
   * Filter CSV data
   * @param {Array<Object>} data - CSV data
   * @param {Function} predicate - Filter function
   * @returns {Array<Object>} Filtered data
   */
  filter(data, predicate) {
    return data.filter(predicate);
  }

  /**
   * Search CSV data
   * @param {Array<Object>} data - CSV data
   * @param {string} searchTerm - Search term
   * @param {Array<string>} fields - Fields to search (searches all if not specified)
   * @returns {Array<Object>} Matching rows
   */
  search(data, searchTerm, fields = null) {
    const term = searchTerm.toLowerCase();
    
    return data.filter(row => {
      const fieldsToSearch = fields || Object.keys(row);
      
      return fieldsToSearch.some(field => {
        const value = String(row[field] || '').toLowerCase();
        return value.includes(term);
      });
    });
  }

  /**
   * Sort CSV data
   * @param {Array<Object>} data - CSV data
   * @param {string} field - Field to sort by
   * @param {boolean} ascending - Sort order
   * @returns {Array<Object>} Sorted data
   */
  sort(data, field, ascending = true) {
    return [...data].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      
      if (aVal < bVal) return ascending ? -1 : 1;
      if (aVal > bVal) return ascending ? 1 : -1;
      return 0;
    });
  }

  /**
   * Group CSV data by field
   * @param {Array<Object>} data - CSV data
   * @param {string} field - Field to group by
   * @returns {Object} Grouped data (key: field value, value: array of rows)
   */
  groupBy(data, field) {
    return data.reduce((groups, row) => {
      const key = row[field];
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(row);
      return groups;
    }, {});
  }

  /**
   * Get unique values for a field
   * @param {Array<Object>} data - CSV data
   * @param {string} field - Field name
   * @returns {Array} Unique values
   */
  getUniqueValues(field, data) {
    const values = data.map(row => row[field]);
    return [...new Set(values)].filter(v => v !== null && v !== undefined && v !== '');
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('[CSVService] Cache cleared');
  }

  /**
   * Clear specific cached file
   * @param {string} filename - Filename to clear from cache
   */
  clearCacheForFile(filename) {
    if (this.cache.has(filename)) {
      this.cache.delete(filename);
      console.log(`[CSVService] Cleared cache for: ${filename}`);
    }
  }

  /**
   * Enable/disable caching
   * @param {boolean} enabled - Whether to enable caching
   */
  setCacheEnabled(enabled) {
    this.cacheEnabled = enabled;
    if (!enabled) {
      this.clearCache();
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      files: Array.from(this.cache.keys()),
      enabled: this.cacheEnabled
    };
  }
}

// Create global CSV service instance
window.CSVService = new CSVService();
