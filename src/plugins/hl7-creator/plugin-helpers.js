// HL7 Creator Plugin - Event Handlers and Additional Methods
// This extends the HL7CreatorPlugin class with all event handlers

HL7CreatorPlugin.prototype.setupEventListeners = function(container) {
  // Navigation buttons
  container.querySelector('#creator-prev').addEventListener('click', () => this.creatorPrevPatient(container));
  container.querySelector('#creator-next').addEventListener('click', () => this.creatorNextPatient(container));
  container.querySelector('#new-patient').addEventListener('click', () => this.clearAll(container));

  // Random Name button
  container.querySelector('#random-name').addEventListener('click', () => {
    if (this.state.patientNames.length > 0) {
      const randomPerson = this.getRandomElement(this.state.patientNames);
      container.querySelector('#patient-first-name').value = randomPerson['First Name'].toUpperCase();
      container.querySelector('#patient-last-name').value = randomPerson['Last Name'].toUpperCase();
      this.updatePreview(container);
    }
  });

  // Random DOB button
  container.querySelector('#random-dob').addEventListener('click', () => {
    container.querySelector('#patient-dob').value = this.generateRandomDOB();
    this.updateAgeFromDOB(container);
    this.updatePreview(container);
  });

  // Add age button
  container.querySelector('#add-age').addEventListener('click', () => this.generateDOBFromAge(container));

  // Date buttons
  container.querySelector('#date-minus').addEventListener('click', () => this.adjustDate(container, -1));
  container.querySelector('#today-date').addEventListener('click', () => {
    container.querySelector('#schedule-date').value = this.formatDate(new Date());
    this.updatePreview(container);
  });
  container.querySelector('#date-plus').addEventListener('click', () => this.adjustDate(container, 1));

  // Time buttons
  container.querySelector('#time-minus').addEventListener('click', () => this.adjustTime(container, -1));
  container.querySelector('#now-time').addEventListener('click', () => {
    container.querySelector('#scheduled-time').value = this.formatTime(new Date());
    this.updatePreview(container);
  });
  container.querySelector('#time-plus').addEventListener('click', () => this.adjustTime(container, 1));

  // Procedure browser buttons
  container.querySelector('#collapse-all').addEventListener('click', () => this.collapseAllProcedures(container));
  container.querySelector('#expand-all').addEventListener('click', () => this.expandAllProcedures(container));
  container.querySelector('#clear-search').addEventListener('click', () => this.clearSearch(container));
  container.querySelector('#add-selected-procedure').addEventListener('click', () => this.addSelectedProcedure(container));
  container.querySelector('#choose-random-procedure').addEventListener('click', () => this.chooseRandomProcedure(container));

  // Bottom action bar buttons
  container.querySelector('#add-surgeon').addEventListener('click', () => this.addSurgeon(container));
  container.querySelector('#remove-last-surgeon').addEventListener('click', () => this.removeLastSurgeon(container));
  container.querySelector('#random-surgeon').addEventListener('click', () => this.randomSurgeon(container));
  container.querySelector('#add-staff-member').addEventListener('click', () => this.addStaffMember(container));
  container.querySelector('#remove-last-staff').addEventListener('click', () => this.removeLastStaff(container));
  container.querySelector('#random-staff').addEventListener('click', () => this.randomStaff(container));
  container.querySelector('#add-procedure').addEventListener('click', () => this.addProcedure(container));
  container.querySelector('#remove-last-procedure').addEventListener('click', () => this.removeLastProcedure(container));
  container.querySelector('#random-patient').addEventListener('click', () => this.randomPatient(container));
  container.querySelector('#clear-all').addEventListener('click', () => this.clearAll(container));

  // Browse allergies
  container.querySelector('#browse-allergies').addEventListener('click', () => this.browseAllergies(container));

  // Create message button
  container.querySelector('#create-message').addEventListener('click', () => this.createMessage(container));

  // Procedure search
  container.querySelector('#procedure-search').addEventListener('input', () => this.filterProcedures(container));

  // Real-time preview updates - Patient Information
  const updatePreview = () => this.updatePreview(container);
  container.querySelector('#patient-mrn').addEventListener('input', updatePreview);
  container.querySelector('#patient-first-name').addEventListener('input', updatePreview);
  container.querySelector('#patient-last-name').addEventListener('input', updatePreview);
  container.querySelector('#patient-dob').addEventListener('input', () => {
    this.updateAgeFromDOB(container);
    updatePreview();
  });
  container.querySelector('#patient-gender').addEventListener('input', updatePreview);

  // Age input
  container.querySelector('#patient-age-input').addEventListener('input', () => {
    const ageInput = container.querySelector('#patient-age-input').value;
    const currentDOB = container.querySelector('#patient-dob').value;
    if (ageInput && (!currentDOB || this.calculateAgeFromDOB(currentDOB) != ageInput)) {
      this.generateDOBFromAge(container);
    }
  });

  container.querySelector('#patient-age-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      this.generateDOBFromAge(container);
    }
  });

  // Encounter Type radio buttons
  container.querySelectorAll('input[name="encounter-type"]').forEach(radio => {
    radio.addEventListener('change', updatePreview);
  });

  // Environment radio buttons
  container.querySelectorAll('input[name="environment"]').forEach(radio => {
    radio.addEventListener('change', () => {
      this.handleEnvironmentChange(container);
      updatePreview();
    });
  });

  // Isolations dropdown handlers
  container.querySelector('#isolations-uch').addEventListener('change', () => {
    this.handleIsolationsChange(container);
    updatePreview();
  });
  container.querySelector('#isolations-us-demo').addEventListener('change', () => {
    this.handleIsolationsChange(container);
    updatePreview();
  });
  container.querySelector('#isolations-other').addEventListener('input', updatePreview);

  // ASA Score and Anesthesia Type
  container.querySelector('#asa-score').addEventListener('input', updatePreview);
  container.querySelector('#anesthesia-type').addEventListener('change', updatePreview);

  // Scheduling Information
  container.querySelector('#schedule-date').addEventListener('input', updatePreview);
  container.querySelector('#scheduled-time').addEventListener('input', updatePreview);
  container.querySelector('#duration').addEventListener('input', updatePreview);

  // Procedure Information
  container.querySelector('#procedure-name').addEventListener('input', updatePreview);
  container.querySelector('#procedure-id').addEventListener('input', updatePreview);
  container.querySelector('#cpt-code').addEventListener('input', updatePreview);
  container.querySelector('#procedure-description').addEventListener('input', updatePreview);
  container.querySelector('#special-needs').addEventListener('input', updatePreview);

  // Laterality radio buttons
  container.querySelectorAll('input[name="laterality"]').forEach(radio => {
    radio.addEventListener('change', updatePreview);
  });

  // Location
  container.querySelector('#location-or').addEventListener('input', updatePreview);
  container.querySelector('#location-dept').addEventListener('input', updatePreview);
  container.querySelector('#add-on').addEventListener('input', updatePreview);

  // Staff Assignment
  container.querySelector('#surgeon-last').addEventListener('input', updatePreview);
  container.querySelector('#surgeon-first').addEventListener('input', updatePreview);
  container.querySelector('#circulator-last').addEventListener('input', updatePreview);
  container.querySelector('#circulator-first').addEventListener('input', updatePreview);
  container.querySelector('#scrub-last').addEventListener('input', updatePreview);
  container.querySelector('#scrub-first').addEventListener('input', updatePreview);
  container.querySelector('#crna-last').addEventListener('input', updatePreview);
  container.querySelector('#crna-first').addEventListener('input', updatePreview);
  container.querySelector('#anesthesiologist-last').addEventListener('input', updatePreview);
  container.querySelector('#anesthesiologist-first').addEventListener('input', updatePreview);

  // Message Type
  container.querySelectorAll('input[name="message-type"]').forEach(radio => {
    radio.addEventListener('change', updatePreview);
  });

  // Setup tooltips
  this.setupTooltips(container);
};

HL7CreatorPlugin.prototype.setupTooltips = function(container) {
  const tooltipIcons = container.querySelectorAll('.tooltip-icon[data-tooltip]');

  tooltipIcons.forEach(icon => {
    icon.addEventListener('mouseenter', (e) => {
      const tooltipText = icon.getAttribute('data-tooltip');
      if (!tooltipText) return;

      // Create tooltip element
      const tooltip = document.createElement('div');
      tooltip.className = 'custom-tooltip';
      tooltip.textContent = tooltipText;
      document.body.appendChild(tooltip);

      // Calculate position
      const iconRect = icon.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();

      // Position above the icon by default
      let left = iconRect.left + (iconRect.width / 2) - (tooltipRect.width / 2);
      let top = iconRect.top - tooltipRect.height - 10;

      // Check if tooltip would go off the left edge
      if (left < 10) {
        left = 10;
      }

      // Check if tooltip would go off the right edge
      if (left + tooltipRect.width > window.innerWidth - 10) {
        left = window.innerWidth - tooltipRect.width - 10;
      }

      // Check if tooltip would go off the top edge
      if (top < 10) {
        // Position below the icon instead
        top = iconRect.bottom + 10;
        tooltip.classList.add('tooltip-below');
      }

      tooltip.style.left = left + 'px';
      tooltip.style.top = top + 'px';

      // Store reference for removal
      icon._tooltip = tooltip;
    });

    icon.addEventListener('mouseleave', (e) => {
      if (icon._tooltip) {
        icon._tooltip.remove();
        icon._tooltip = null;
      }
    });
  });
};

HL7CreatorPlugin.prototype.updateAgeFromDOB = function(container) {
  const dob = container.querySelector('#patient-dob').value;
  const age = this.calculateAgeFromDOB(dob);
  container.querySelector('#patient-age-input').value = age;
};

HL7CreatorPlugin.prototype.generateDOBFromAge = function(container) {
  const ageInput = container.querySelector('#patient-age-input').value;

  if (!ageInput || ageInput < 0 || ageInput > 120) {
    return;
  }

  const age = parseInt(ageInput);
  const today = new Date();
  const birthYear = today.getFullYear() - age;
  const randomMonth = Math.floor(Math.random() * 12) + 1;
  const randomDay = Math.floor(Math.random() * 28) + 1;

  let adjustedYear = birthYear;
  const birthDate = new Date(birthYear, randomMonth - 1, randomDay);
  if (birthDate > today) {
    adjustedYear--;
  }

  const dob = `${adjustedYear}${String(randomMonth).padStart(2, '0')}${String(randomDay).padStart(2, '0')}`;
  container.querySelector('#patient-dob').value = dob;

  this.updatePreview(container);
};

HL7CreatorPlugin.prototype.adjustDate = function(container, days) {
  const dateStr = container.querySelector('#schedule-date').value;
  if (!dateStr || dateStr.length !== 8) return;

  try {
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));

    const date = new Date(year, month, day);
    date.setDate(date.getDate() + days);

    container.querySelector('#schedule-date').value = this.formatDate(date);
    this.updatePreview(container);
  } catch (e) {
    console.error('Error adjusting date:', e);
  }
};

HL7CreatorPlugin.prototype.adjustTime = function(container, hours) {
  const timeStr = container.querySelector('#scheduled-time').value;
  if (!timeStr || timeStr.length !== 6) {
    const now = new Date();
    now.setHours(now.getHours() + hours);
    container.querySelector('#scheduled-time').value = this.formatTime(now);
    this.updatePreview(container);
    return;
  }

  try {
    const h = parseInt(timeStr.substring(0, 2));
    const m = parseInt(timeStr.substring(2, 4));
    const s = parseInt(timeStr.substring(4, 6));

    const date = new Date();
    date.setHours(h + hours, m, s);

    container.querySelector('#scheduled-time').value = this.formatTime(date);
    this.updatePreview(container);
  } catch (e) {
    console.error('Error adjusting time:', e);
  }
};

HL7CreatorPlugin.prototype.saveCurrentPatient = function(container) {
  // Collect all form data
  const formData = this.collectFormData(container);
  const procedures = this.collectProcedures(container);

  // Collect message type
  const messageTypeInput = container.querySelector('input[name="message-type"]:checked');
  const messageType = messageTypeInput ? messageTypeInput.value : 'scheduled';

  // Collect additional staff
  const additionalSurgeons = [];
  const surgeonElements = container.querySelectorAll('[id^="surgeon-"][id$="-last"]');
  surgeonElements.forEach((elem) => {
    const match = elem.id.match(/surgeon-(\d+)-last/);
    if (match) {
      const num = match[1];
      const last = container.querySelector(`#surgeon-${num}-last`).value;
      const first = container.querySelector(`#surgeon-${num}-first`).value;
      if (last || first) {
        additionalSurgeons.push({ last, first });
      }
    }
  });

  const additionalStaff = [];
  const staffElements = container.querySelectorAll('[id^="staff-"][id$="-last"]');
  staffElements.forEach((elem) => {
    const match = elem.id.match(/staff-(\d+)-last/);
    if (match) {
      const num = match[1];
      const last = container.querySelector(`#staff-${num}-last`).value;
      const first = container.querySelector(`#staff-${num}-first`).value;
      const role = container.querySelector(`#staff-${num}-role`).value;
      if (last || first || role) {
        additionalStaff.push({ last, first, role });
      }
    }
  });

  // Create patient object
  const patientData = {
    formData,
    procedures,
    messageType,
    additionalSurgeons,
    additionalStaff,
    allergies: [...this.state.selectedAllergies]
  };

  // Save to patients array
  if (this.state.currentPatientIndex >= 0) {
    this.state.patients[this.state.currentPatientIndex] = patientData;
  } else {
    // First patient, add to array and set index
    this.state.patients.push(patientData);
    this.state.currentPatientIndex = this.state.patients.length - 1;
  }
};

HL7CreatorPlugin.prototype.loadPatientData = function(container, patientIndex) {
  if (patientIndex < 0 || patientIndex >= this.state.patients.length) {
    return;
  }

  const patient = this.state.patients[patientIndex];
  const formData = patient.formData;

  // Populate patient demographics
  container.querySelector('#patient-mrn').value = formData.patientMRN === '{patientMRN}' ? '' : formData.patientMRN;
  container.querySelector('#patient-first-name').value = formData.patientFirstName === '{patientFirstName}' ? '' : formData.patientFirstName;
  container.querySelector('#patient-last-name').value = formData.patientLastName === '{patientLastName}' ? '' : formData.patientLastName;
  container.querySelector('#patient-dob').value = formData.patientDOB === '{patientDOB}' ? '' : formData.patientDOB;
  container.querySelector('#patient-gender').value = formData.patientGender === '{patientGender}' ? '' : formData.patientGender;

  // Populate encounter type
  const encounterRadio = container.querySelector(`input[name="encounter-type"][value="${formData.encounterType}"]`);
  if (encounterRadio) encounterRadio.checked = true;

  // Populate environment
  const environmentRadio = container.querySelector(`input[name="environment"][value="${formData.environment}"]`);
  if (environmentRadio) {
    environmentRadio.checked = true;
    // Trigger environment change to show correct isolations dropdown
    this.handleEnvironmentChange(container);
  }

  // Populate scheduling
  container.querySelector('#schedule-date').value = formData.YYYYMMDD === '{YYYYMMDD}' ? '' : formData.YYYYMMDD;
  container.querySelector('#scheduled-time').value = formData.scheduledTime === '{scheduledTime}' ? '' : formData.scheduledTime;
  container.querySelector('#duration').value = formData.duration === '{duration}' ? '60' : formData.duration;

  // Populate ASA Score, Anesthesia, Isolations
  container.querySelector('#asa-score').value = formData.asaScore || '';
  container.querySelector('#anesthesia-type').value = formData.anesthesiaType || '';

  // Set isolations based on environment
  if (formData.environment === 'UCH') {
    const uchSelect = container.querySelector('#isolations-uch');
    if (uchSelect.querySelector(`option[value="${formData.isolations}"]`)) {
      uchSelect.value = formData.isolations;
    } else if (formData.isolations) {
      uchSelect.value = 'OTHER';
      container.querySelector('#isolations-other').value = formData.isolations;
    }
  } else {
    const usDemoSelect = container.querySelector('#isolations-us-demo');
    if (usDemoSelect.querySelector(`option[value="${formData.isolations}"]`)) {
      usDemoSelect.value = formData.isolations;
    } else if (formData.isolations) {
      usDemoSelect.value = 'OTHER';
      container.querySelector('#isolations-other').value = formData.isolations;
    }
  }

  // Populate location
  container.querySelector('#location-dept').value = formData.locationDepartment === '{locationDepartment}' ? '' : formData.locationDepartment;
  container.querySelector('#location-or').value = formData.locationOR === '{locationOR}' ? '' : formData.locationOR;
  container.querySelector('#add-on').value = formData.addOn === '{addOn}' ? 'N' : formData.addOn;

  // Populate primary staff
  container.querySelector('#surgeon-last').value = formData.surgeonLastName === '{surgeonLastName}' ? '' : formData.surgeonLastName;
  container.querySelector('#surgeon-first').value = formData.surgeonFirstName === '{surgeonFirstName}' ? '' : formData.surgeonFirstName;
  container.querySelector('#circulator-last').value = formData.circulatorLastName === '{circulatorLastName}' ? '' : formData.circulatorLastName;
  container.querySelector('#circulator-first').value = formData.circulatorFirstName === '{circulatorFirstName}' ? '' : formData.circulatorFirstName;
  container.querySelector('#scrub-last').value = formData.scrubLastName === '{scrubLastName}' ? '' : formData.scrubLastName;
  container.querySelector('#scrub-first').value = formData.scrubFirstName === '{scrubFirstName}' ? '' : formData.scrubFirstName;
  container.querySelector('#crna-last').value = formData.crnaLastName === '{crnaLastName}' ? '' : formData.crnaLastName;
  container.querySelector('#crna-first').value = formData.crnaFirstName === '{crnaFirstName}' ? '' : formData.crnaFirstName;
  container.querySelector('#anesthesiologist-last').value = formData.anesthesiologistLastName === '{anesthesiologistLastName}' ? '' : formData.anesthesiologistLastName;
  container.querySelector('#anesthesiologist-first').value = formData.anesthesiologistFirstName === '{anesthesiologistFirstName}' ? '' : formData.anesthesiologistFirstName;

  // Clear and repopulate additional surgeons
  container.querySelector('#additional-surgeons-container').innerHTML = '';
  this.state.additionalSurgeons = [];
  patient.additionalSurgeons.forEach((surgeon) => {
    this.addSurgeon(container);
    const num = this.state.additionalSurgeons.length;
    container.querySelector(`#surgeon-${num}-last`).value = surgeon.last;
    container.querySelector(`#surgeon-${num}-first`).value = surgeon.first;
  });

  // Clear and repopulate additional staff
  container.querySelector('#additional-staff-container').innerHTML = '';
  this.state.additionalStaff = [];
  patient.additionalStaff.forEach((staff) => {
    this.addStaff(container);
    const num = this.state.additionalStaff.length;
    container.querySelector(`#staff-${num}-last`).value = staff.last;
    container.querySelector(`#staff-${num}-first`).value = staff.first;
    container.querySelector(`#staff-${num}-role`).value = staff.role;
  });

  // Clear and repopulate procedures
  container.querySelector('#procedures-container').innerHTML = '';
  if (patient.procedures && patient.procedures.length > 0) {
    // Load first procedure into main form
    const firstProc = patient.procedures[0];
    container.querySelector('#procedure-name').value = firstProc.name || '';
    container.querySelector('#procedure-id').value = firstProc.id || '';
    container.querySelector('#cpt-code').value = firstProc.cpt || '';
    container.querySelector('#procedure-description').value = firstProc.description || '';
    container.querySelector('#special-needs').value = firstProc.specialNeeds || '';

    // Set laterality for first procedure
    const lateralityRadio = container.querySelector(`input[name="laterality"][value="${firstProc.laterality || 'A'}"]`);
    if (lateralityRadio) lateralityRadio.checked = true;

    // Load additional procedures
    for (let i = 1; i < patient.procedures.length; i++) {
      const proc = patient.procedures[i];
      this.addProcedure(container);
      const procNum = i + 1;
      container.querySelector(`#proc-${procNum}-name`).value = proc.name || '';
      container.querySelector(`#proc-${procNum}-id`).value = proc.id || '';
      container.querySelector(`#proc-${procNum}-cpt`).value = proc.cpt || '';
      container.querySelector(`#proc-${procNum}-description`).value = proc.description || '';
      container.querySelector(`#proc-${procNum}-special-needs`).value = proc.specialNeeds || '';

      // Set laterality for additional procedure
      const procLateralityRadio = container.querySelector(`input[name="proc-${procNum}-laterality"][value="${proc.laterality || 'A'}"]`);
      if (procLateralityRadio) procLateralityRadio.checked = true;
    }
  }

  // Load allergies
  this.state.selectedAllergies = [...patient.allergies];
  if (this.state.selectedAllergies.length > 0) {
    const allergyNames = this.state.selectedAllergies.map(a => a.allergy_name).join(', ');
    container.querySelector('#allergies-display').value = allergyNames;
  } else {
    container.querySelector('#allergies-display').value = 'No Known Medical Allergies';
  }

  // Set message type
  const messageTypeRadio = container.querySelector(`input[name="message-type"][value="${patient.messageType}"]`);
  if (messageTypeRadio) messageTypeRadio.checked = true;

  // Update preview
  this.updatePreview(container);

  // Update navigation buttons
  this.updateNavigationButtons(container);
};

HL7CreatorPlugin.prototype.updateNavigationButtons = function(container) {
  const prevBtn = container.querySelector('#creator-prev');
  const nextBtn = container.querySelector('#creator-next');

  // Enable/disable Previous button
  if (this.state.currentPatientIndex <= 0) {
    prevBtn.disabled = true;
    prevBtn.style.opacity = '0.5';
    prevBtn.style.cursor = 'not-allowed';
  } else {
    prevBtn.disabled = false;
    prevBtn.style.opacity = '1';
    prevBtn.style.cursor = 'pointer';
  }

  // Enable/disable Next button
  if (this.state.currentPatientIndex < 0 || this.state.currentPatientIndex >= this.state.patients.length - 1) {
    nextBtn.disabled = true;
    nextBtn.style.opacity = '0.5';
    nextBtn.style.cursor = 'not-allowed';
  } else {
    nextBtn.disabled = false;
    nextBtn.style.opacity = '1';
    nextBtn.style.cursor = 'pointer';
  }
};

HL7CreatorPlugin.prototype.creatorPrevPatient = function(container) {
  if (this.state.patients.length > 0 && this.state.currentPatientIndex > 0) {
    // Save current patient before navigating
    this.saveCurrentPatient(container);

    // Navigate to previous patient
    this.state.currentPatientIndex--;

    // Load previous patient data
    this.loadPatientData(container, this.state.currentPatientIndex);
  }
};

HL7CreatorPlugin.prototype.creatorNextPatient = function(container) {
  if (this.state.patients.length > 0 && this.state.currentPatientIndex < this.state.patients.length - 1) {
    // Save current patient before navigating
    this.saveCurrentPatient(container);

    // Navigate to next patient
    this.state.currentPatientIndex++;

    // Load next patient data
    this.loadPatientData(container, this.state.currentPatientIndex);
  }
};

HL7CreatorPlugin.prototype.addSurgeon = function(container) {
  const surgeonContainer = container.querySelector('#additional-surgeons-container');
  const num = this.state.additionalSurgeons.length + 1;

  const surgeonDiv = document.createElement('div');
  surgeonDiv.className = 'staff-row';
  surgeonDiv.dataset.surgeonNum = num;
  surgeonDiv.innerHTML = `
    <label>Surgeon ${num + 1}:</label>
    <span>Last:</span>
    <input type="text" id="add-surgeon-${num}-last" class="uppercase-input staff-name-input">
    <span>First:</span>
    <input type="text" id="add-surgeon-${num}-first" class="uppercase-input staff-name-input">
  `;

  surgeonContainer.appendChild(surgeonDiv);
  this.state.additionalSurgeons.push(num);

  const updatePreview = () => this.updatePreview(container);
  container.querySelector(`#add-surgeon-${num}-last`).addEventListener('input', updatePreview);
  container.querySelector(`#add-surgeon-${num}-first`).addEventListener('input', updatePreview);
};

HL7CreatorPlugin.prototype.removeLastSurgeon = function(container) {
  if (this.state.additionalSurgeons.length > 0) {
    const surgeonContainer = container.querySelector('#additional-surgeons-container');
    surgeonContainer.removeChild(surgeonContainer.lastChild);
    this.state.additionalSurgeons.pop();
    this.updatePreview(container);
  }
};

HL7CreatorPlugin.prototype.randomSurgeon = function(container) {
  if (this.state.surgeonNames.length > 0) {
    const surgeon = this.getRandomElement(this.state.surgeonNames);
    container.querySelector('#surgeon-last').value = surgeon['Last Name'].toUpperCase();
    container.querySelector('#surgeon-first').value = surgeon['First Name'].toUpperCase();
    this.updatePreview(container);
  }
};

HL7CreatorPlugin.prototype.addStaffMember = function(container) {
  const staffContainer = container.querySelector('#additional-staff-container');
  const num = this.state.additionalStaff.length + 1;

  const staffDiv = document.createElement('div');
  staffDiv.className = 'staff-row';
  staffDiv.dataset.staffNum = num;
  staffDiv.innerHTML = `
    <label>Staff ${num}:</label>
    <span>Last:</span>
    <input type="text" id="add-staff-${num}-last" class="uppercase-input staff-name-input">
    <span>First:</span>
    <input type="text" id="add-staff-${num}-first" class="uppercase-input staff-name-input">
  `;

  staffContainer.appendChild(staffDiv);
  this.state.additionalStaff.push(num);

  const updatePreview = () => this.updatePreview(container);
  container.querySelector(`#add-staff-${num}-last`).addEventListener('input', updatePreview);
  container.querySelector(`#add-staff-${num}-first`).addEventListener('input', updatePreview);
};

HL7CreatorPlugin.prototype.removeLastStaff = function(container) {
  if (this.state.additionalStaff.length > 0) {
    const staffContainer = container.querySelector('#additional-staff-container');
    staffContainer.removeChild(staffContainer.lastChild);
    this.state.additionalStaff.pop();
    this.updatePreview(container);
  }
};

HL7CreatorPlugin.prototype.randomStaff = function(container) {
  if (this.state.staffNames.length > 0) {
    const staff1 = this.getRandomElement(this.state.staffNames);
    container.querySelector('#circulator-last').value = staff1['Last Name'].toUpperCase();
    container.querySelector('#circulator-first').value = staff1['First Name'].toUpperCase();

    const staff2 = this.getRandomElement(this.state.staffNames);
    container.querySelector('#scrub-last').value = staff2['Last Name'].toUpperCase();
    container.querySelector('#scrub-first').value = staff2['First Name'].toUpperCase();

    const staff3 = this.getRandomElement(this.state.staffNames);
    container.querySelector('#crna-last').value = staff3['Last Name'].toUpperCase();
    container.querySelector('#crna-first').value = staff3['First Name'].toUpperCase();

    const staff4 = this.getRandomElement(this.state.staffNames);
    container.querySelector('#anesthesiologist-last').value = staff4['Last Name'].toUpperCase();
    container.querySelector('#anesthesiologist-first').value = staff4['First Name'].toUpperCase();

    this.updatePreview(container);
  }
};

HL7CreatorPlugin.prototype.randomPatient = function(container) {
  if (this.state.patientNames.length > 0) {
    const randomPerson = this.getRandomElement(this.state.patientNames);
    container.querySelector('#patient-first-name').value = randomPerson['First Name'].toUpperCase();
    container.querySelector('#patient-last-name').value = randomPerson['Last Name'].toUpperCase();
  }

  container.querySelector('#patient-gender').value = Math.random() > 0.5 ? 'M' : 'F';
  container.querySelector('#patient-dob').value = this.generateRandomDOB();
  container.querySelector('#patient-mrn').value = this.generateRandomMRN();

  this.randomSurgeon(container);
  this.randomStaff(container);
  this.chooseRandomProcedure(container);

  this.updatePreview(container);
};

HL7CreatorPlugin.prototype.clearAll = function(container) {
  // Save current patient before clearing (if there is one)
  if (this.state.currentPatientIndex >= 0) {
    this.saveCurrentPatient(container);
  }

  // Clear patient demographics
  container.querySelector('#patient-first-name').value = '';
  container.querySelector('#patient-last-name').value = '';
  container.querySelector('#patient-gender').value = '';
  container.querySelector('#patient-dob').value = '';
  container.querySelector('#patient-mrn').value = '';

  // Reset encounter type and environment to defaults
  const encounterRadio = container.querySelector('input[name="encounter-type"][value="DS"]');
  if (encounterRadio) encounterRadio.checked = true;

  const environmentRadio = container.querySelector('input[name="environment"][value="US Demo"]');
  if (environmentRadio) {
    environmentRadio.checked = true;
    this.handleEnvironmentChange(container);
  }

  // Clear scheduling
  container.querySelector('#schedule-date').value = this.formatDate(new Date());
  container.querySelector('#scheduled-time').value = '';
  container.querySelector('#duration').value = '60';

  // Clear new fields
  container.querySelector('#asa-score').value = '';
  container.querySelector('#anesthesia-type').value = '';
  container.querySelector('#isolations-us-demo').value = '';
  container.querySelector('#isolations-uch').value = '';
  container.querySelector('#isolations-other').value = '';

  // Clear procedure
  container.querySelector('#procedure-name').value = '';
  container.querySelector('#procedure-id').value = '';
  container.querySelector('#cpt-code').value = '';
  container.querySelector('#procedure-description').value = '';
  container.querySelector('#special-needs').value = '';

  // Reset laterality to N/A
  const lateralityRadio = container.querySelector('input[name="laterality"][value="A"]');
  if (lateralityRadio) lateralityRadio.checked = true;

  // Clear location
  container.querySelector('#location-dept').value = '';
  container.querySelector('#location-or').value = '';
  container.querySelector('#add-on').value = 'N';

  // Clear allergies
  container.querySelector('#allergies-display').value = 'No Known Medical Allergies';
  this.state.selectedAllergies = [];

  // Clear staff
  container.querySelector('#surgeon-last').value = '';
  container.querySelector('#surgeon-first').value = '';
  container.querySelector('#circulator-last').value = '';
  container.querySelector('#circulator-first').value = '';
  container.querySelector('#scrub-last').value = '';
  container.querySelector('#scrub-first').value = '';
  container.querySelector('#crna-last').value = '';
  container.querySelector('#crna-first').value = '';
  container.querySelector('#anesthesiologist-last').value = '';
  container.querySelector('#anesthesiologist-first').value = '';

  // Clear additional staff and surgeons
  container.querySelector('#additional-surgeons-container').innerHTML = '';
  container.querySelector('#additional-staff-container').innerHTML = '';
  this.state.additionalSurgeons = [];
  this.state.additionalStaff = [];

  // Clear additional procedures
  container.querySelector('#procedures-container').innerHTML = '';

  // Reset message type to scheduled
  const messageTypeRadio = container.querySelector('input[name="message-type"][value="scheduled"]');
  if (messageTypeRadio) messageTypeRadio.checked = true;

  // Increment patient index for new patient
  this.state.currentPatientIndex = this.state.patients.length;

  // Update preview and navigation buttons
  this.updatePreview(container);
  this.updateNavigationButtons(container);
};

HL7CreatorPlugin.prototype.browseAllergies = function(container) {
  const modal = container.querySelector('#allergies-modal');
  const tableBody = container.querySelector('#allergies-table-body');
  const searchInput = container.querySelector('#allergies-search');
  const selectedList = container.querySelector('#selected-allergies-list');

  // Show modal
  modal.style.display = 'flex';

  // Populate allergies table
  this.populateAllergiesTable(container);

  // Setup event listeners
  const closeBtn = container.querySelector('#close-allergies-modal');
  const doneBtn = container.querySelector('#done-allergies');
  const clearBtn = container.querySelector('#clear-allergies');

  const closeModal = () => {
    modal.style.display = 'none';
    searchInput.value = '';
    this.updateAllergiesDisplay(container);
  };

  closeBtn.onclick = closeModal;
  doneBtn.onclick = closeModal;

  clearBtn.onclick = () => {
    this.state.selectedAllergies = [];
    this.updateSelectedAllergiesList(container);
  };

  // Search functionality
  searchInput.oninput = () => this.filterAllergies(container, searchInput.value);

  // ESC key to close
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  // Update selected allergies display
  this.updateSelectedAllergiesList(container);
};

HL7CreatorPlugin.prototype.populateAllergiesTable = function(container) {
  const tableBody = container.querySelector('#allergies-table-body');
  tableBody.innerHTML = '';

  if (!this.state.patientAllergies || this.state.patientAllergies.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">No allergies data loaded</td></tr>';
    return;
  }

  this.state.patientAllergies.forEach((allergy) => {
    const row = document.createElement('tr');
    row.dataset.allergyId = allergy.allergy_id;
    row.dataset.allergyName = allergy.allergy_name;
    row.dataset.allergyReaction = allergy.reaction || '';
    row.dataset.allergySeverity = allergy.severity || '';

    const isSelected = this.state.selectedAllergies.some(
      a => a.allergyID === allergy.allergy_id
    );

    row.innerHTML = `
      <td>${allergy.allergy_name} (${allergy.allergy_id})</td>
      <td>${allergy.reaction || '-'}</td>
      <td>${allergy.severity || '-'}</td>
      <td>
        <button class="allergy-add-btn" data-allergy-id="${allergy.allergy_id}" ${isSelected ? 'disabled' : ''}>
          ${isSelected ? 'Added' : 'Add'}
        </button>
      </td>
    `;

    const addBtn = row.querySelector('.allergy-add-btn');
    addBtn.onclick = () => this.addAllergy(container, allergy);

    tableBody.appendChild(row);
  });
};

HL7CreatorPlugin.prototype.filterAllergies = function(container, searchTerm) {
  const tableBody = container.querySelector('#allergies-table-body');
  const rows = tableBody.querySelectorAll('tr');
  const term = searchTerm.toLowerCase().trim();

  rows.forEach(row => {
    const name = row.dataset.allergyName?.toLowerCase() || '';
    const id = row.dataset.allergyId?.toLowerCase() || '';
    const reaction = row.dataset.allergyReaction?.toLowerCase() || '';

    if (name.includes(term) || id.includes(term) || reaction.includes(term)) {
      row.classList.remove('hidden');
    } else {
      row.classList.add('hidden');
    }
  });
};

HL7CreatorPlugin.prototype.addAllergy = function(container, allergy) {
  // Check if already added
  const exists = this.state.selectedAllergies.some(
    a => a.allergyID === allergy.allergy_id
  );

  if (exists) return;

  this.state.selectedAllergies.push({
    allergyID: allergy.allergy_id,
    allergyName: allergy.allergy_name,
    allergyReaction: allergy.reaction || '',
    allergySeverity: allergy.severity || ''
  });

  this.updateSelectedAllergiesList(container);
  this.populateAllergiesTable(container); // Refresh to update button states
};

HL7CreatorPlugin.prototype.removeAllergy = function(container, allergyID) {
  this.state.selectedAllergies = this.state.selectedAllergies.filter(
    a => a.allergyID !== allergyID
  );

  this.updateSelectedAllergiesList(container);
  this.populateAllergiesTable(container); // Refresh to update button states
};

HL7CreatorPlugin.prototype.updateSelectedAllergiesList = function(container) {
  const selectedList = container.querySelector('#selected-allergies-list');

  if (this.state.selectedAllergies.length === 0) {
    selectedList.innerHTML = '<span class="no-allergies-message">No allergies selected</span>';
    return;
  }

  selectedList.innerHTML = '';
  this.state.selectedAllergies.forEach(allergy => {
    const tag = document.createElement('div');
    tag.className = 'allergy-tag';
    tag.innerHTML = `
      <span>${allergy.allergyName}</span>
      <button class="allergy-tag-remove" data-allergy-id="${allergy.allergyID}">×</button>
    `;

    const removeBtn = tag.querySelector('.allergy-tag-remove');
    removeBtn.onclick = () => this.removeAllergy(container, allergy.allergyID);

    selectedList.appendChild(tag);
  });
};

HL7CreatorPlugin.prototype.updateAllergiesDisplay = function(container) {
  const display = container.querySelector('#allergies-display');

  if (this.state.selectedAllergies.length === 0) {
    display.value = 'No Known Medical Allergies';
  } else {
    const names = this.state.selectedAllergies.map(a => a.allergyName).join(', ');
    display.value = names;
  }
};

HL7CreatorPlugin.prototype.addProcedure = function(container) {
  const proceduresContainer = container.querySelector('#procedures-container');
  const procedureNum = proceduresContainer.children.length + 1;

  const procedureDiv = document.createElement('div');
  procedureDiv.className = 'procedure-item';
  procedureDiv.dataset.procedureNum = procedureNum;

  procedureDiv.innerHTML = `
    <div class="procedure-header">
      <span class="procedure-number">Procedure ${procedureNum + 1}</span>
      <button class="remove-procedure" data-num="${procedureNum}">Remove</button>
    </div>
    <div class="form-row">
      <label>Procedure Name:</label>
      <input type="text" id="proc-${procedureNum}-name" class="uppercase-input">
    </div>
    <div class="form-row">
      <label>CPT Code:</label>
      <input type="text" id="proc-${procedureNum}-cpt" class="uppercase-input">
    </div>
    <div class="form-row">
      <label>Description:</label>
      <input type="text" id="proc-${procedureNum}-desc" class="uppercase-input">
    </div>
    <div class="form-row">
      <label>Special Needs:</label>
      <input type="text" id="proc-${procedureNum}-needs" class="uppercase-input">
    </div>
    <div class="form-row">
      <label>Laterality:</label>
      <div class="radio-group-inline">
        <label class="radio-label"><input type="radio" name="proc-${procedureNum}-laterality" value="L"> Left</label>
        <label class="radio-label"><input type="radio" name="proc-${procedureNum}-laterality" value="R"> Right</label>
        <label class="radio-label"><input type="radio" name="proc-${procedureNum}-laterality" value="B"> Bilateral</label>
        <label class="radio-label"><input type="radio" name="proc-${procedureNum}-laterality" value="A" checked> N/A</label>
      </div>
    </div>
  `;

  proceduresContainer.appendChild(procedureDiv);

  // Add event listener to remove button
  const removeBtn = procedureDiv.querySelector('.remove-procedure');
  removeBtn.addEventListener('click', () => this.removeProcedure(container, procedureNum));
};

HL7CreatorPlugin.prototype.removeProcedure = function(container, num) {
  const proceduresContainer = container.querySelector('#procedures-container');
  const procedure = proceduresContainer.querySelector(`[data-procedure-num="${num}"]`);
  if (procedure) {
    proceduresContainer.removeChild(procedure);
    this.renumberProcedures(container);
  }
};

HL7CreatorPlugin.prototype.removeLastProcedure = function(container) {
  const proceduresContainer = container.querySelector('#procedures-container');
  if (proceduresContainer.children.length > 0) {
    proceduresContainer.removeChild(proceduresContainer.lastChild);
  }
};

HL7CreatorPlugin.prototype.renumberProcedures = function(container) {
  const proceduresContainer = container.querySelector('#procedures-container');
  Array.from(proceduresContainer.children).forEach((proc, index) => {
    const num = index + 1;
    proc.dataset.procedureNum = num;
    proc.querySelector('.procedure-number').textContent = `Procedure ${num + 1}`;
  });
};

HL7CreatorPlugin.prototype.handleEnvironmentChange = function(container) {
  const environmentRadio = container.querySelector('input[name="environment"]:checked');
  const environment = environmentRadio ? environmentRadio.value : 'US Demo';

  const uchSelect = container.querySelector('#isolations-uch');
  const usDemoSelect = container.querySelector('#isolations-us-demo');
  const otherInput = container.querySelector('#isolations-other');

  if (environment === 'UCH') {
    uchSelect.style.display = '';
    usDemoSelect.style.display = 'none';
    // Reset US Demo selection
    usDemoSelect.value = '';
  } else {
    uchSelect.style.display = 'none';
    usDemoSelect.style.display = '';
    // Reset UCH selection
    uchSelect.value = '';
  }

  // Hide other input and reset
  otherInput.style.display = 'none';
  otherInput.value = '';
};

HL7CreatorPlugin.prototype.handleIsolationsChange = function(container) {
  const environmentRadio = container.querySelector('input[name="environment"]:checked');
  const environment = environmentRadio ? environmentRadio.value : 'US Demo';

  const activeSelect = environment === 'UCH'
    ? container.querySelector('#isolations-uch')
    : container.querySelector('#isolations-us-demo');

  const otherInput = container.querySelector('#isolations-other');

  if (activeSelect.value === 'OTHER') {
    otherInput.style.display = '';
    otherInput.focus();
  } else {
    otherInput.style.display = 'none';
    otherInput.value = '';
  }
};

// Continue in next message due to length...
