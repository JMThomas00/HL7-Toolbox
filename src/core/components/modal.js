// Modal Component - Dialog System

class ModalSystem {
  constructor() {
    this.overlay = document.getElementById('modal-overlay');
    this.modal = document.getElementById('modal');
    this.title = document.getElementById('modal-title');
    this.body = document.getElementById('modal-body');
    this.footer = document.getElementById('modal-footer');
    this.closeBtn = document.getElementById('modal-close');
    this.cancelBtn = document.getElementById('modal-cancel');
    this.confirmBtn = document.getElementById('modal-confirm');

    this.currentResolve = null;
    this.isOpen = false;

    this.setupEventListeners();
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Close button
    this.closeBtn.onclick = () => this.close(false);

    // Cancel button
    this.cancelBtn.onclick = () => this.close(false);

    // Confirm button
    this.confirmBtn.onclick = () => this.close(true);

    // Click outside to close
    this.overlay.onclick = (e) => {
      if (e.target === this.overlay) {
        this.close(false);
      }
    };

    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close(false);
      }
    });
  }

  /**
   * Show modal
   * @param {Object} options - Modal options
   * @returns {Promise<boolean>} Promise that resolves with true if confirmed
   */
  show(options = {}) {
    return new Promise((resolve) => {
      this.currentResolve = resolve;
      this.isOpen = true;

      // Set content
      this.title.textContent = options.title || 'Modal';
      
      if (options.bodyHTML) {
        this.body.innerHTML = options.bodyHTML;
      } else {
        this.body.textContent = options.body || '';
      }

      // Configure buttons
      this.cancelBtn.textContent = options.cancelText || 'Cancel';
      this.confirmBtn.textContent = options.confirmText || 'Confirm';

      this.cancelBtn.className = `btn ${options.cancelClass || 'btn-secondary'}`;
      this.confirmBtn.className = `btn ${options.confirmClass || 'btn-primary'}`;

      // Show/hide buttons
      this.cancelBtn.style.display = options.showCancel !== false ? 'block' : 'none';
      this.confirmBtn.style.display = options.showConfirm !== false ? 'block' : 'none';

      // Show modal
      this.overlay.classList.add('active');

      window.EventBus.emit('modal:opened', options);
    });
  }

  /**
   * Close modal
   * @param {boolean} confirmed - Whether modal was confirmed
   */
  close(confirmed) {
    if (!this.isOpen) {
      return;
    }

    this.isOpen = false;
    this.overlay.classList.remove('active');

    if (this.currentResolve) {
      this.currentResolve(confirmed);
      this.currentResolve = null;
    }

    window.EventBus.emit('modal:closed', confirmed);
  }

  /**
   * Show confirmation dialog
   * @param {string} message - Confirmation message
   * @param {Object} options - Additional options
   * @returns {Promise<boolean>} True if confirmed
   */
  async confirm(message, options = {}) {
    return await this.show({
      title: options.title || 'Confirm',
      body: message,
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      confirmClass: options.danger ? 'btn-danger' : 'btn-primary',
      ...options
    });
  }

  /**
   * Show alert dialog (OK only)
   * @param {string} message - Alert message
   * @param {Object} options - Additional options
   * @returns {Promise<boolean>} Always true
   */
  async alert(message, options = {}) {
    return await this.show({
      title: options.title || 'Alert',
      body: message,
      showCancel: false,
      confirmText: 'OK',
      ...options
    });
  }

  /**
   * Show custom modal with HTML content
   * @param {string} title - Modal title
   * @param {string} html - HTML content
   * @param {Object} options - Additional options
   * @returns {Promise<boolean>} True if confirmed
   */
  async custom(title, html, options = {}) {
    return await this.show({
      title: title,
      bodyHTML: html,
      ...options
    });
  }

  /**
   * Show input prompt
   * @param {string} message - Prompt message
   * @param {string} defaultValue - Default input value
   * @param {Object} options - Additional options
   * @returns {Promise<string|null>} Input value or null if canceled
   */
  async prompt(message, defaultValue = '', options = {}) {
    const inputId = 'modal-prompt-input';
    const html = `
      <p>${message}</p>
      <input type="text" id="${inputId}" class="w-100" value="${defaultValue}" />
    `;

    const confirmed = await this.custom(options.title || 'Input', html, {
      confirmText: 'OK',
      cancelText: 'Cancel',
      ...options
    });

    if (!confirmed) {
      return null;
    }

    const input = document.getElementById(inputId);
    return input ? input.value : null;
  }

  /**
   * Show form modal
   * @param {string} title - Modal title
   * @param {Array} fields - Array of field definitions
   * @param {Object} options - Additional options
   * @returns {Promise<Object|null>} Form values or null if canceled
   */
  async form(title, fields, options = {}) {
    const formId = 'modal-form';
    let html = `<form id="${formId}">`;

    fields.forEach((field, index) => {
      html += `
        <div class="form-group">
          <label for="field-${index}">${field.label || field.name}</label>
          <input 
            type="${field.type || 'text'}" 
            id="field-${index}"
            name="${field.name}"
            value="${field.value || ''}"
            placeholder="${field.placeholder || ''}"
            ${field.required ? 'required' : ''}
            class="w-100"
          />
        </div>
      `;
    });

    html += '</form>';

    const confirmed = await this.custom(title, html, options);

    if (!confirmed) {
      return null;
    }

    // Collect form values
    const form = document.getElementById(formId);
    const values = {};

    fields.forEach((field, index) => {
      const input = document.getElementById(`field-${index}`);
      if (input) {
        values[field.name] = input.value;
      }
    });

    return values;
  }
}

// Create global modal instance
window.Modal = new ModalSystem();
