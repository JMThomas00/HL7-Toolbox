// Template Service - HL7 Message Template Management

class TemplateService {
  constructor() {
    this.templates = new Map();
    this.defaultTemplates = new Map();
  }

  /**
   * Initialize the template service
   */
  async initialize() {
    await this.loadAllTemplates();
    this.loadDefaultTemplates();
    console.log('[TemplateService] Initialized');
  }

  /**
   * Load default built-in templates
   */
  loadDefaultTemplates() {
    // Default HL7 SIU^S12 template
    const defaultSurgical = {
      id: 'default-surgical',
      name: 'Default Surgical Schedule',
      description: 'Standard HL7 SIU^S12 surgical scheduling message',
      type: 'SIU^S12',
      template: `MSH|^~\\&|EPIC|NC||NC|{YYYYMMDD}{eventTime}||SIU^S12|{patientMRN}|P|2.5
SCH||{patientMRN}|||||||{duration}|M|^^^{YYYYMMDD}{scheduledTime}
ZCS||{addOn}|ORSCH_S14||||{cptCode}^{procedure}^CPT
PID|1||{patientMRN}^^^MRN^MRN||{patientLastName}^{patientFirstName}||{patientDOB}|{patientGender}|{patientLastName}^{patientFirstName}^^|||||||||{patientMRN}
PV1||{encounterType}|NC-PERIOP^^^NC|||||||{specialty}|||||||||{patientMRN}
RGS|
AIS|1||{procedureId}^{procedure}|{YYYYMMDD}{scheduledTime}|0|M|{duration}|M||||2
NTE|1||{procedureDescription}|Procedure Description|||
NTE|2||{specialNeeds}|Case Notes|||
AIL|1||^{locationOR}^^{locationDepartment}
AIP|1||{surgeonID}^{surgeonLastName}^{surgeonFirstName}^W^^^^^EPIC^^^^PROVID|1.1^Primary|{specialty}|{YYYYMMDD}{scheduledTime}|0|M|{duration}|M
AIP|2||{circulatorID}^{circulatorLastName}^{circulatorFirstName}^^^^^^EPIC^^^^PROVID|4.20^Circulator||{YYYYMMDD}{scheduledTime}|0|M|{duration}|M
AIP|3||{scrubID}^{scrubLastName}^{scrubFirstName}^^^^^^^EPIC^^^^PROVID|4.150^Scrub||{YYYYMMDD}{scheduledTime}|0|M|{duration}|M
AIP|4||{crnaID}^{crnaLastName}^{crnaFirstName}^^^^^^^EPIC^^^^PROVID|2.20^ANE CRNA||{YYYYMMDD}{scheduledTime}|0|M|{duration}|M
AIP|5||{anesthesiologistID}^{anesthesiologistLastName}^{anesthesiologistFirstName}^^^^^^^EPIC^^^^PROVID|2.139^Anesthesiologist||{YYYYMMDD}{scheduledTime}|0|M|{duration}|M`,
      isDefault: true,
      fields: [
        'patientMRN', 'patientFirstName', 'patientLastName', 'patientDOB', 'patientGender',
        'encounterType', 'YYYYMMDD', 'scheduledTime', 'eventTime', 'duration',
        'procedure', 'procedureId', 'cptCode', 'procedureDescription', 'specialNeeds',
        'locationOR', 'locationDepartment', 'addOn', 'specialty',
        'surgeonID', 'surgeonLastName', 'surgeonFirstName',
        'circulatorID', 'circulatorLastName', 'circulatorFirstName',
        'scrubID', 'scrubLastName', 'scrubFirstName',
        'crnaID', 'crnaLastName', 'crnaFirstName',
        'anesthesiologistID', 'anesthesiologistLastName', 'anesthesiologistFirstName'
      ]
    };

    this.defaultTemplates.set('default-surgical', defaultSurgical);
  }

  /**
   * Load all templates from disk
   */
  async loadAllTemplates() {
    try {
      const result = await window.hl7toolboxAPI.template.list();
      
      if (result.success && result.templates) {
        for (const filename of result.templates) {
          await this.loadTemplate(filename);
        }
      }

      console.log(`[TemplateService] Loaded ${this.templates.size} templates`);
    } catch (error) {
      console.error('[TemplateService] Error loading templates:', error);
    }
  }

  /**
   * Load single template from disk
   * @param {string} filename - Template filename
   */
  async loadTemplate(filename) {
    try {
      const result = await window.hl7toolboxAPI.template.read(filename);
      
      if (result.success) {
        this.templates.set(result.data.id, result.data);
        console.log(`[TemplateService] Loaded template: ${result.data.name}`);
      }
    } catch (error) {
      console.error(`[TemplateService] Error loading template ${filename}:`, error);
    }
  }

  /**
   * Save template to disk
   * @param {Object} template - Template object
   */
  async saveTemplate(template) {
    try {
      const filename = `${template.id}.json`;
      const result = await window.hl7toolboxAPI.template.write(filename, template);
      
      if (result.success) {
        this.templates.set(template.id, template);
        window.EventBus.emit('template:saved', template);
        console.log(`[TemplateService] Saved template: ${template.name}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('[TemplateService] Error saving template:', error);
      return false;
    }
  }

  /**
   * Delete template
   * @param {string} templateId - Template ID
   */
  async deleteTemplate(templateId) {
    try {
      const filename = `${templateId}.json`;
      const result = await window.hl7toolboxAPI.template.delete(filename);
      
      if (result.success) {
        this.templates.delete(templateId);
        window.EventBus.emit('template:deleted', templateId);
        console.log(`[TemplateService] Deleted template: ${templateId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('[TemplateService] Error deleting template:', error);
      return false;
    }
  }

  /**
   * Get template by ID
   * @param {string} templateId - Template ID
   * @returns {Object} Template object or null
   */
  getTemplate(templateId) {
    // Check user templates first
    if (this.templates.has(templateId)) {
      return this.templates.get(templateId);
    }
    
    // Check default templates
    if (this.defaultTemplates.has(templateId)) {
      return this.defaultTemplates.get(templateId);
    }
    
    return null;
  }

  /**
   * Get all templates
   * @returns {Array<Object>} Array of templates
   */
  getAllTemplates() {
    const all = [
      ...Array.from(this.defaultTemplates.values()),
      ...Array.from(this.templates.values())
    ];
    
    return all;
  }

  /**
   * Get templates by type
   * @param {string} type - Message type (e.g., 'SIU^S12')
   * @returns {Array<Object>} Array of templates
   */
  getTemplatesByType(type) {
    return this.getAllTemplates().filter(t => t.type === type);
  }

  /**
   * Parse template fields from template string
   * @param {string} templateStr - Template string
   * @returns {Array<string>} Array of field names
   */
  parseTemplateFields(templateStr) {
    const regex = /\{([^}]+)\}/g;
    const fields = new Set();
    let match;

    while ((match = regex.exec(templateStr)) !== null) {
      fields.add(match[1]);
    }

    return Array.from(fields);
  }

  /**
   * Apply data to template
   * @param {string} templateStr - Template string
   * @param {Object} data - Data object with field values
   * @returns {string} Rendered template
   */
  applyTemplate(templateStr, data) {
    let result = templateStr;

    for (const [key, value] of Object.entries(data)) {
      const placeholder = `{${key}}`;
      const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      result = result.replace(regex, value || '');
    }

    return result;
  }

  /**
   * Create new template
   * @param {string} name - Template name
   * @param {string} templateStr - Template string
   * @param {Object} options - Additional options
   * @returns {Object} New template object
   */
  createTemplate(name, templateStr, options = {}) {
    const template = {
      id: options.id || `template-${Date.now()}`,
      name: name,
      description: options.description || '',
      type: options.type || 'custom',
      template: templateStr,
      fields: this.parseTemplateFields(templateStr),
      isDefault: false,
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    };

    return template;
  }

  /**
   * Duplicate template
   * @param {string} templateId - Template ID to duplicate
   * @param {string} newName - Name for duplicated template
   * @returns {Object} New template object
   */
  duplicateTemplate(templateId, newName) {
    const original = this.getTemplate(templateId);
    
    if (!original) {
      return null;
    }

    const duplicate = {
      ...original,
      id: `template-${Date.now()}`,
      name: newName || `${original.name} (Copy)`,
      isDefault: false,
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    };

    return duplicate;
  }

  /**
   * Validate template data
   * @param {Object} template - Template object
   * @returns {Object} Validation result
   */
  validateTemplate(template) {
    const errors = [];

    if (!template.id) {
      errors.push('Template ID is required');
    }

    if (!template.name) {
      errors.push('Template name is required');
    }

    if (!template.template) {
      errors.push('Template string is required');
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Export template as JSON
   * @param {string} templateId - Template ID
   * @returns {string} JSON string
   */
  exportTemplate(templateId) {
    const template = this.getTemplate(templateId);
    if (!template) {
      return null;
    }
    return JSON.stringify(template, null, 2);
  }

  /**
   * Import template from JSON
   * @param {string} jsonStr - JSON string
   * @returns {Object} Imported template or null
   */
  importTemplate(jsonStr) {
    try {
      const template = JSON.parse(jsonStr);
      const validation = this.validateTemplate(template);
      
      if (!validation.valid) {
        console.error('[TemplateService] Invalid template:', validation.errors);
        return null;
      }

      // Generate new ID to avoid conflicts
      template.id = `template-${Date.now()}`;
      template.isDefault = false;
      
      return template;
    } catch (error) {
      console.error('[TemplateService] Error importing template:', error);
      return null;
    }
  }
}

// Create global template service instance
window.TemplateService = new TemplateService();
