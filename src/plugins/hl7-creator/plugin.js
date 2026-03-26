// HL7 Message Creator Plugin

class HL7CreatorPlugin extends BasePlugin {
  constructor(services) {
    super(services);
    
    // Plugin state
    this.state = {
      patients: [],
      currentPatientIndex: -1,
      procedures: [],
      patientNames: [],
      surgeonNames: [],
      staffNames: [],
      patientAllergies: [],
      lastMRN: 999,
      additionalSurgeons: [],
      additionalStaff: [],
      selectedAllergies: []
    };

    // Default HL7 Template
    this.defaultTemplate = `MSH|^~\\&|EPIC|NC||NC|{YYYYMMDD}{eventTime}||SIU^{triggerEvent}|{patientMRN}|P|2.5
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
AIP|5||{anesthesiologistID}^{anesthesiologistLastName}^{anesthesiologistFirstName}^^^^^^^EPIC^^^^PROVID|2.139^Anesthesiologist||{YYYYMMDD}{scheduledTime}|0|M|{duration}|M`;
  }

  /**
   * Get plugin ID
   */
  getPluginId() {
    return 'hl7-creator';
  }

  /**
   * Initialize plugin
   */
  async initialize() {
    await super.initialize();
    
    // Load CSV data
    await this.loadCSVData();
    
    console.log('[HL7Creator] Initialized');
  }

  /**
   * Load CSV data files
   */
  async loadCSVData() {
    try {
      // Load procedures
      this.state.procedures = await this.csv.loadCSV('procedures.csv');
      console.log(`[HL7Creator] Loaded ${this.state.procedures.length} procedures`);

      // Load patient names
      this.state.patientNames = await this.csv.loadCSV('patient_names.csv');
      console.log(`[HL7Creator] Loaded ${this.state.patientNames.length} patient names`);

      // Load surgeon names
      this.state.surgeonNames = await this.csv.loadCSV('surgeon_names.csv');
      console.log(`[HL7Creator] Loaded ${this.state.surgeonNames.length} surgeon names`);

      // Load staff names
      this.state.staffNames = await this.csv.loadCSV('staff_names.csv');
      console.log(`[HL7Creator] Loaded ${this.state.staffNames.length} staff names`);

      // Load patient allergies
      this.state.patientAllergies = await this.csv.loadCSV('patient_allergies.csv');
      console.log(`[HL7Creator] Loaded ${this.state.patientAllergies.length} allergies`);

    } catch (error) {
      console.error('[HL7Creator] Error loading CSV data:', error);
      this.notify('Error loading data files', 'error');
    }
  }

  /**
   * Create plugin UI container
   */
  createContainer() {
    const container = document.createElement('div');
    container.className = 'plugin-content hl7-creator-content';
    container.style.height = '100%';
    container.style.overflow = 'hidden';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';

    container.innerHTML = this.getHTML();

    // Set up event listeners after DOM is ready
    setTimeout(() => {
      this.setupEventListeners(container);
      this.populateProcedureTree(container);
      this.updatePreview(container);
      this.updateNavigationButtons(container);
    }, 0);

    return container;
  }

  /**
   * Get HTML structure for the plugin
   */
  getHTML() {
    return `
      <style>
        ${this.getStyles()}
      </style>

      <!-- Title -->
      <div class="creator-title">
        <span class="title-hl7">HL7 Message</span>
        <span class="title-creator"> Creator</span>
      </div>

      <div class="main-layout">
        <!-- Left Panel: Procedure Browser -->
        <div class="left-panel procedure-browser-panel">
          <div class="procedure-browser-container">
            <div class="search-container">
              <label>Search:</label>
              <input type="text" id="procedure-search" placeholder="Search procedures..." class="search-input">
            </div>
            <div class="tree-controls">
              <button id="collapse-all" class="control-btn">Collapse All</button>
              <button id="expand-all" class="control-btn">Expand All</button>
              <button id="clear-search" class="control-btn">Clear Search</button>
            </div>
            <div id="procedure-tree" class="procedure-tree"></div>
            <div class="browser-actions">
              <button id="add-selected-procedure" class="action-btn" disabled>Add Selected Procedure</button>
              <button id="choose-random-procedure" class="action-btn">Choose Random</button>
            </div>
          </div>
        </div>

        <!-- Right Panel: Preview and Form -->
        <div class="right-panel">
          <!-- HL7 Message Preview at TOP -->
          <div class="preview-section">
            <textarea id="message-preview" class="message-preview" readonly></textarea>
          </div>

          <!-- Navigation and Message Type -->
          <div class="nav-message-row">
            <div class="navigation-controls">
              <button id="creator-prev" class="nav-btn">Previous</button>
              <button id="creator-next" class="nav-btn">Next</button>
              <button id="new-patient" class="nav-btn">New Patient</button>
            </div>
            <div class="message-type-controls">
              <label class="radio-label">
                <input type="radio" name="message-type" value="scheduled" checked>
                Scheduled
              </label>
              <label class="radio-label">
                <input type="radio" name="message-type" value="events">
                Scheduled & Case Events
              </label>
              <label class="radio-label">
                <input type="radio" name="message-type" value="cancelled">
                Scheduled & Canceled
              </label>
            </div>
          </div>

          <!-- Form Fields -->
          <div class="form-content">
            <!-- Patient Information -->
            <div class="form-row">
              <label>Patient First Name:</label>
              <input type="text" id="patient-first-name" class="uppercase-input">
            </div>

            <div class="form-row">
              <label>Patient Last Name:</label>
              <input type="text" id="patient-last-name" class="uppercase-input">
              <button id="random-name" class="action-btn">Random Name</button>
            </div>

            <div class="form-row">
              <label>Patient Gender (M/F):</label>
              <input type="text" id="patient-gender" class="uppercase-input" maxlength="1">
            </div>

            <div class="form-row">
              <label>Patient DOB (YYYYMMDD):</label>
              <input type="text" id="patient-dob" class="uppercase-input" placeholder="YYYYMMDD">
              <div class="button-group-inline">
                <button id="random-dob" class="action-btn">Random DOB</button>
                <span class="age-label">Age:</span>
                <input type="number" id="patient-age-input" class="age-input" placeholder="Age" min="0" max="120">
                <button id="add-age" class="action-btn">Add</button>
              </div>
            </div>

            <div class="form-row">
              <label>Patient MRN:</label>
              <input type="text" id="patient-mrn" class="uppercase-input">
            </div>

            <div class="form-row">
              <label>Encounter Type:</label>
              <div class="radio-group-inline">
                <label class="radio-label"><input type="radio" name="encounter-type" value="E"> Emergent</label>
                <label class="radio-label"><input type="radio" name="encounter-type" value="DS" checked> Day Surgery</label>
                <label class="radio-label"><input type="radio" name="encounter-type" value="OBS"> Observation</label>
                <label class="radio-label"><input type="radio" name="encounter-type" value="IP"> Inpatient</label>
                <label class="radio-label"><input type="radio" name="encounter-type" value="T"> Trauma</label>
                <label class="radio-label"><input type="radio" name="encounter-type" value="Rad"> Radiology</label>
              </div>
            </div>

            <div class="form-row">
              <label>Environment:</label>
              <div class="radio-group-inline">
                <label class="radio-label"><input type="radio" name="environment" value="US Demo" checked> US Demo</label>
                <label class="radio-label"><input type="radio" name="environment" value="UCH"> UCH</label>
              </div>
            </div>

            <!-- Scheduling Information -->
            <div class="form-row">
              <label>Scheduled Date (YYYYMMDD):</label>
              <input type="text" id="schedule-date" class="uppercase-input" placeholder="YYYYMMDD">
              <div class="button-group-inline">
                <button id="date-minus" class="action-btn">-1 Day</button>
                <button id="today-date" class="action-btn">Today</button>
                <button id="date-plus" class="action-btn">+1 Day</button>
              </div>
            </div>

            <div class="form-row">
              <label>Scheduled Time (HHMMSS):</label>
              <input type="text" id="scheduled-time" class="uppercase-input" placeholder="HHMMSS">
              <div class="button-group-inline">
                <button id="time-minus" class="action-btn">-1 Hour</button>
                <button id="now-time" class="action-btn">Now</button>
                <button id="time-plus" class="action-btn">+1 Hour</button>
              </div>
            </div>

            <div class="form-row">
              <label>Duration (minutes):</label>
              <input type="number" id="duration" value="60">
            </div>

            <div class="form-row">
              <label>ASA Score:</label>
              <input type="text" id="asa-score" class="uppercase-input" maxlength="1" placeholder="1-6">
              <span class="tooltip-icon" data-tooltip="1=Normal healthy patient, 2=Mild systemic disease, 3=Severe systemic disease, 4=Severe systemic disease that is a constant threat to life, 5=Moribund patient not expected to survive without the operation, 6=Declared brain-dead patient whose organs are being removed for donor purposes">ⓘ</span>
            </div>

            <div class="form-row">
              <label>Anesthesia Type:</label>
              <select id="anesthesia-type" class="uppercase-input">
                <option value="">Select...</option>
                <option value="GENERAL">General</option>
                <option value="MAC">MAC</option>
                <option value="REGIONAL">Regional</option>
                <option value="LOCAL">Local</option>
                <option value="SPINAL">Spinal</option>
                <option value="EPIDURAL">Epidural</option>
              </select>
              <span class="tooltip-icon" data-tooltip="Type of anesthesia used: General, MAC (Monitored Anesthesia Care), Regional, Local, Spinal, or Epidural">ⓘ</span>
            </div>

            <div class="form-row">
              <label>Isolations/Risk Factors:</label>
              <select id="isolations-uch" class="uppercase-input isolations-select" style="display:none;">
                <option value="">Select...</option>
                <option value="AIRBORNE">Airborne</option>
                <option value="DROPLET">Droplet</option>
                <option value="CONTACT">Contact</option>
                <option value="SPECIAL">Special</option>
                <option value="ENHANCED RES">Enhanced Res</option>
                <option value="OTHER">Other</option>
              </select>
              <select id="isolations-us-demo" class="uppercase-input isolations-select">
                <option value="">Select...</option>
                <option value="CONTACT">Contact</option>
                <option value="AIRBORNE">Airborne</option>
                <option value="CONTACT PLUS">Contact Plus</option>
                <option value="DROPLET">Droplet</option>
                <option value="OTHER">Other</option>
              </select>
              <input type="text" id="isolations-other" class="uppercase-input" placeholder="Enter isolation type..." style="display:none; margin-left: 5px; width: 200px;">
              <span class="tooltip-icon" data-tooltip="Patient isolation precautions or risk factors. Select from the dropdown or choose 'Other' to enter custom text.">ⓘ</span>
            </div>

            <!-- Procedure Information -->
            <div class="form-row">
              <label>Procedure:</label>
              <input type="text" id="procedure-name" class="uppercase-input">
            </div>

            <div class="form-row">
              <label>Procedure ID:</label>
              <input type="text" id="procedure-id" class="uppercase-input">
            </div>

            <div class="form-row">
              <label>CPT Code:</label>
              <input type="text" id="cpt-code" class="uppercase-input">
            </div>

            <div class="form-row">
              <label>Procedure Description:</label>
              <input type="text" id="procedure-description" class="uppercase-input">
            </div>

            <div class="form-row">
              <label>Special Needs:</label>
              <input type="text" id="special-needs" class="uppercase-input">
            </div>

            <div class="form-row">
              <label>Laterality:</label>
              <div class="radio-group-inline">
                <label class="radio-label"><input type="radio" name="laterality" value="L"> Left</label>
                <label class="radio-label"><input type="radio" name="laterality" value="R"> Right</label>
                <label class="radio-label"><input type="radio" name="laterality" value="B"> Bilateral</label>
                <label class="radio-label"><input type="radio" name="laterality" value="A" checked> N/A</label>
              </div>
            </div>

            <!-- Location Information -->
            <div class="form-row">
              <label>Location Department:</label>
              <input type="text" id="location-dept" class="uppercase-input">
            </div>

            <div class="form-row">
              <label>Location OR:</label>
              <input type="text" id="location-or" class="uppercase-input">
            </div>

            <div class="form-row">
              <label>Add On (Y/N):</label>
              <input type="text" id="add-on" class="uppercase-input" maxlength="1" value="N">
            </div>

            <!-- Allergies -->
            <div class="form-row">
              <label>Allergies:</label>
              <input type="text" id="allergies-display" class="uppercase-input" value="No Known Medical Allergies" readonly>
              <button id="browse-allergies" class="action-btn">Browse Allergies</button>
            </div>

            <!-- Staff Assignment -->
            <div class="staff-section">
              <div class="staff-row">
                <label>Primary Surgeon:</label>
                <span>Last:</span>
                <input type="text" id="surgeon-last" class="uppercase-input staff-name-input">
                <span>First:</span>
                <input type="text" id="surgeon-first" class="uppercase-input staff-name-input">
              </div>

              <div class="staff-row">
                <label>Circulator:</label>
                <span>Last:</span>
                <input type="text" id="circulator-last" class="uppercase-input staff-name-input">
                <span>First:</span>
                <input type="text" id="circulator-first" class="uppercase-input staff-name-input">
              </div>

              <div class="staff-row">
                <label>Scrub:</label>
                <span>Last:</span>
                <input type="text" id="scrub-last" class="uppercase-input staff-name-input">
                <span>First:</span>
                <input type="text" id="scrub-first" class="uppercase-input staff-name-input">
              </div>

              <div class="staff-row">
                <label>CRNA:</label>
                <span>Last:</span>
                <input type="text" id="crna-last" class="uppercase-input staff-name-input">
                <span>First:</span>
                <input type="text" id="crna-first" class="uppercase-input staff-name-input">
              </div>

              <div class="staff-row">
                <label>Anesthesiologist:</label>
                <span>Last:</span>
                <input type="text" id="anesthesiologist-last" class="uppercase-input staff-name-input">
                <span>First:</span>
                <input type="text" id="anesthesiologist-first" class="uppercase-input staff-name-input">
              </div>

              <div id="additional-surgeons-container"></div>
              <div id="additional-staff-container"></div>
            </div>

            <div id="procedures-container"></div>
          </div>

          <!-- Bottom Action Bar -->
          <div class="bottom-action-bar">
            <button id="add-surgeon" class="action-btn">Add Surgeon</button>
            <button id="remove-last-surgeon" class="action-btn">Remove Last Surgeon</button>
            <button id="random-surgeon" class="action-btn">Random Surgeon</button>
            <button id="add-staff-member" class="action-btn">Add Staff Member</button>
            <button id="remove-last-staff" class="action-btn">Remove Last Staff Member</button>
            <button id="random-staff" class="action-btn">Random Staff</button>
            <button id="add-procedure" class="action-btn">Add Procedure</button>
            <button id="remove-last-procedure" class="action-btn">Remove Last Procedure</button>
            <button id="random-patient" class="action-btn">Random Patient</button>
            <button id="clear-all" class="action-btn">Clear All</button>
          </div>

          <!-- Create Button -->
          <div class="create-button-container">
            <button id="create-message" class="btn btn-primary btn-lg">Create Message</button>
          </div>
        </div>

        <!-- Allergies Browser Modal -->
        <div id="allergies-modal" class="modal-overlay" style="display: none;">
          <div class="modal-content allergies-modal">
            <div class="modal-header">
              <h3>Browse Allergies</h3>
              <button id="close-allergies-modal" class="close-button">×</button>
            </div>
            <div class="modal-body">
              <div class="search-container">
                <label>Search:</label>
                <input type="text" id="allergies-search" placeholder="Search allergies by name or ID..." class="search-input">
              </div>
              <div class="allergies-list-container">
                <table id="allergies-table" class="allergies-table">
                  <thead>
                    <tr>
                      <th>Allergy Name (ID)</th>
                      <th>Reaction</th>
                      <th>Severity</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody id="allergies-table-body">
                    <!-- Allergies will be populated here -->
                  </tbody>
                </table>
              </div>
              <div class="selected-allergies-section">
                <h4>Selected Allergies:</h4>
                <div id="selected-allergies-list" class="selected-allergies-list">
                  <span class="no-allergies-message">No allergies selected</span>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button id="clear-allergies" class="btn btn-secondary">Clear All</button>
              <button id="done-allergies" class="btn btn-primary">Done</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Get plugin-specific styles
   */
  getStyles() {
    return `
      .hl7-creator-content {
        padding: 10px;
      }

      .creator-title {
        text-align: center;
        padding: 10px 0;
      }

      .title-hl7 {
        font-family: Georgia, serif;
        font-size: 32px;
        color: var(--brand-primary);
      }

      .title-creator {
        font-family: Georgia, serif;
        font-size: 32px;
        color: var(--brand-secondary);
      }

      .main-layout {
        display: grid;
        grid-template-columns: 300px 1fr;
        gap: 10px;
        flex: 1;
        overflow: hidden;
      }

      .left-panel {
        overflow-y: auto;
        padding-right: 5px;
      }

      .right-panel {
        overflow-y: auto;
        padding-right: 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .procedure-browser-panel {
        background-color: var(--input-bg);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 10px;
      }

      .procedure-browser-container {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .search-container {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
      }

      .search-container label {
        white-space: nowrap;
      }

      .search-input {
        flex: 1;
        margin-bottom: 0;
      }

      .tree-controls {
        display: flex;
        gap: 5px;
        margin-bottom: 10px;
      }

      .control-btn {
        background-color: var(--button-bg);
        border: none;
        border-radius: 4px;
        color: var(--text-primary);
        padding: 4px 8px;
        font-size: 11px;
        cursor: pointer;
        flex: 1;
      }

      .control-btn:hover {
        background-color: var(--button-hover);
      }

      .browser-actions {
        display: flex;
        flex-direction: column;
        gap: 5px;
        margin-top: 10px;
      }

      .browser-actions .action-btn {
        width: 100%;
      }

      .browser-actions .action-btn:disabled {
        background-color: var(--border-color);
        color: var(--text-muted);
        cursor: not-allowed;
      }

      .preview-section {
        flex-shrink: 0;
      }

      .message-preview {
        width: 100%;
        height: 200px;
        background-color: var(--preview-bg);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        color: var(--text-primary);
        padding: 10px;
        font-size: 12px;
        font-family: var(--font-mono);
        resize: vertical;
        white-space: pre;
        overflow-wrap: normal;
        overflow-x: auto;
      }

      .nav-message-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px;
        background-color: var(--input-bg);
        border: 1px solid var(--border-color);
        border-radius: 4px;
      }

      .navigation-controls {
        display: flex;
        gap: 5px;
      }

      .message-type-controls {
        display: flex;
        gap: 15px;
      }

      .form-content {
        flex: 1;
        overflow-y: auto;
        padding: 10px;
        background-color: var(--input-bg);
        border: 1px solid var(--border-color);
        border-radius: 4px;
      }

      .button-group-inline {
        display: flex;
        align-items: center;
        gap: 5px;
      }

      .button-group-inline .action-btn {
        padding: 4px 8px;
        font-size: 11px;
      }

      .button-group-inline .age-input {
        width: 60px;
      }

      .age-label {
        color: var(--text-primary);
        font-size: 13px;
        margin-left: 10px;
      }

      .radio-group-inline {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .radio-group-inline .radio-label {
        font-size: 12px;
      }

      .staff-section {
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px solid var(--border-color);
      }

      .staff-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }

      .staff-row label {
        width: 120px;
        text-align: right;
      }

      .staff-row span {
        font-size: 12px;
        color: var(--text-primary);
      }

      .staff-name-input {
        width: 100px;
      }

      .bottom-action-bar {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        padding: 10px;
        background-color: var(--input-bg);
        border: 1px solid var(--border-color);
        border-radius: 4px;
      }

      .bottom-action-bar .action-btn {
        padding: 6px 10px;
        font-size: 11px;
      }

      .create-button-container {
        display: flex;
        justify-content: center;
        padding: 10px;
      }

      .procedure-tree {
        background-color: var(--preview-bg);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        flex: 1;
        overflow-y: auto;
        padding: 5px;
        min-height: 200px;
      }

      .tree-item {
        padding: 6px 10px;
        cursor: pointer;
        border-radius: 3px;
        font-size: 13px;
        user-select: none;
      }

      .tree-item:hover {
        background-color: var(--input-bg);
      }

      .tree-item.specialty {
        font-weight: 600;
        color: var(--brand-secondary);
      }

      .tree-item.category {
        padding-left: 20px;
        font-weight: 500;
      }

      .tree-item.procedure {
        padding-left: 40px;
        color: var(--text-primary);
      }

      .tree-item.match {
        background-color: #2C3DAA;
      }

      .tree-item.procedure.selected {
        background-color: var(--brand-secondary);
        color: var(--preview-bg);
      }

      #procedures-container {
        margin-top: 10px;
      }

      .procedure-item {
        background-color: var(--preview-bg);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        padding: 10px;
        margin-bottom: 10px;
      }

      .procedure-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .procedure-number {
        font-weight: 600;
        color: var(--brand-secondary);
      }

      .remove-procedure {
        background-color: #d32f2f;
        border: none;
        border-radius: 4px;
        color: white;
        padding: 4px 10px;
        font-size: 11px;
        cursor: pointer;
      }

      .remove-procedure:hover {
        background-color: #b71c1c;
      }

      .tooltip-icon {
        display: inline-block;
        width: 18px;
        height: 18px;
        line-height: 18px;
        text-align: center;
        font-size: 13px;
        color: var(--brand-primary);
        cursor: help;
        margin-left: 5px;
        user-select: none;
      }

      .tooltip-icon:hover {
        color: var(--brand-secondary);
      }

      .custom-tooltip {
        position: fixed;
        background-color: rgba(0, 0, 0, 0.9);
        color: #fff;
        padding: 8px 12px;
        border-radius: 6px;
        max-width: 300px;
        font-size: 12px;
        line-height: 1.4;
        z-index: 10000;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        pointer-events: none;
        white-space: normal;
        word-wrap: break-word;
      }

      /* Allergies Modal */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      }

      .modal-content {
        background-color: var(--bg-primary);
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        max-width: 800px;
        width: 90%;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
      }

      .allergies-modal {
        max-width: 900px;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid var(--border-color);
      }

      .modal-header h3 {
        margin: 0;
        color: var(--brand-secondary);
        font-size: 20px;
      }

      .close-button {
        background: none;
        border: none;
        font-size: 32px;
        color: var(--text-primary);
        cursor: pointer;
        padding: 0;
        line-height: 1;
        width: 32px;
        height: 32px;
      }

      .close-button:hover {
        color: var(--brand-secondary);
      }

      .modal-body {
        padding: 20px;
        overflow-y: auto;
        flex: 1;
      }

      .allergies-list-container {
        max-height: 300px;
        overflow-y: auto;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        margin-top: 10px;
      }

      .allergies-table {
        width: 100%;
        border-collapse: collapse;
      }

      .allergies-table thead {
        background-color: var(--input-bg);
        position: sticky;
        top: 0;
        z-index: 1;
      }

      .allergies-table th {
        padding: 10px;
        text-align: left;
        font-weight: 600;
        color: var(--brand-secondary);
        border-bottom: 2px solid var(--border-color);
      }

      .allergies-table td {
        padding: 8px 10px;
        border-bottom: 1px solid var(--border-color);
      }

      .allergies-table tbody tr:hover {
        background-color: var(--input-bg);
      }

      .allergies-table tbody tr.hidden {
        display: none;
      }

      .allergy-add-btn {
        background-color: var(--brand-primary);
        color: white;
        border: none;
        padding: 4px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }

      .allergy-add-btn:hover {
        background-color: var(--brand-secondary);
      }

      .allergy-add-btn:disabled {
        background-color: #555;
        cursor: not-allowed;
        opacity: 0.5;
      }

      .selected-allergies-section {
        margin-top: 20px;
        padding-top: 15px;
        border-top: 1px solid var(--border-color);
      }

      .selected-allergies-section h4 {
        margin: 0 0 10px 0;
        color: var(--text-primary);
        font-size: 14px;
      }

      .selected-allergies-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        min-height: 40px;
      }

      .no-allergies-message {
        color: var(--text-secondary);
        font-style: italic;
        font-size: 13px;
      }

      .allergy-tag {
        background-color: var(--brand-primary);
        color: white;
        padding: 6px 12px;
        border-radius: 16px;
        font-size: 12px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .allergy-tag-remove {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 16px;
        line-height: 1;
        padding: 0;
        width: 16px;
        height: 16px;
      }

      .allergy-tag-remove:hover {
        color: #ff6b6b;
      }

      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        padding: 16px 20px;
        border-top: 1px solid var(--border-color);
      }

      .btn-secondary {
        background-color: #555;
      }

      .btn-secondary:hover {
        background-color: #666;
      }
    `;
  }

  /**
   * Activate plugin
   */
  async activate() {
    await super.activate();

    // Set today's date as default if empty
    const container = this.getContainer();
    const scheduleDate = container.querySelector('#schedule-date');
    if (scheduleDate && !scheduleDate.value) {
      scheduleDate.value = this.formatDate(new Date());
      this.updatePreview(container);
    }

    // Initialize isolations dropdown visibility based on default environment
    this.handleEnvironmentChange(container);
  }

  // Utility functions
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}${minutes}${seconds}`;
  }

  validateDate(dateStr) {
    if (!dateStr || dateStr.length !== 8) return false;
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6));
    const day = parseInt(dateStr.substring(6, 8));

    if (year < 1900 || year > 2100) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;

    return true;
  }

  validateTime(timeStr) {
    if (!timeStr || timeStr.length !== 6) return false;
    const hours = parseInt(timeStr.substring(0, 2));
    const minutes = parseInt(timeStr.substring(2, 4));
    const seconds = parseInt(timeStr.substring(4, 6));

    if (hours < 0 || hours > 23) return false;
    if (minutes < 0 || minutes > 59) return false;
    if (seconds < 0 || seconds > 59) return false;

    return true;
  }

  getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  generateRandomMRN() {
    this.state.lastMRN++;
    return String(this.state.lastMRN).padStart(6, '0');
  }

  generateRandomDOB() {
    const year = 1940 + Math.floor(Math.random() * 60);
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  calculateAgeFromDOB(dobStr) {
    if (!dobStr || dobStr.length !== 8) return '';

    const year = parseInt(dobStr.substring(0, 4));
    const month = parseInt(dobStr.substring(4, 6));
    const day = parseInt(dobStr.substring(6, 8));

    if (isNaN(year) || isNaN(month) || isNaN(day)) return '';

    const birthDate = new Date(year, month - 1, day);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= 0 ? age : '';
  }

  // Due to token limits, I'll create a second file for event handlers and remaining functionality
}

window.HL7CreatorPlugin = HL7CreatorPlugin;
