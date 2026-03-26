// HL7 Creator Plugin - Procedure Tree and Message Generation

HL7CreatorPlugin.prototype.populateProcedureTree = function(container) {
  const tree = container.querySelector('#procedure-tree');
  tree.innerHTML = '';

  // Group by specialty
  const specialties = {};
  this.state.procedures.forEach(proc => {
    const specialty = proc.specialty || 'General';
    if (!specialties[specialty]) {
      specialties[specialty] = {};
    }

    const category = proc.category || 'Uncategorized';
    if (!specialties[specialty][category]) {
      specialties[specialty][category] = [];
    }

    specialties[specialty][category].push(proc);
  });

  // Build tree
  for (const [specialty, categories] of Object.entries(specialties)) {
    const specialtyDiv = document.createElement('div');
    specialtyDiv.className = 'tree-item specialty';
    specialtyDiv.textContent = specialty;
    specialtyDiv.dataset.expanded = 'false';

    specialtyDiv.addEventListener('click', () => {
      const isExpanded = specialtyDiv.dataset.expanded === 'true';
      specialtyDiv.dataset.expanded = !isExpanded ? 'true' : 'false';

      const categoryDivs = tree.querySelectorAll(`.tree-item.category[data-specialty="${specialty}"]`);
      categoryDivs.forEach(div => {
        div.style.display = !isExpanded ? 'block' : 'none';
        if (isExpanded) {
          div.dataset.expanded = 'false';
          const cat = div.textContent;
          tree.querySelectorAll(`[data-category="${cat}"][data-specialty="${specialty}"]`).forEach(proc => {
            proc.style.display = 'none';
          });
        }
      });
    });

    tree.appendChild(specialtyDiv);

    for (const [category, procedures] of Object.entries(categories)) {
      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'tree-item category';
      categoryDiv.textContent = category;
      categoryDiv.dataset.specialty = specialty;
      categoryDiv.dataset.expanded = 'false';
      categoryDiv.style.display = 'none';

      categoryDiv.addEventListener('click', (e) => {
        e.stopPropagation();

        const isExpanded = categoryDiv.dataset.expanded === 'true';
        categoryDiv.dataset.expanded = !isExpanded ? 'true' : 'false';

        const procDivs = tree.querySelectorAll(`[data-category="${category}"][data-specialty="${specialty}"]`);
        procDivs.forEach(div => {
          div.style.display = !isExpanded ? 'block' : 'none';
        });
      });

      tree.appendChild(categoryDiv);

      procedures.forEach(proc => {
        const procDiv = document.createElement('div');
        procDiv.className = 'tree-item procedure';
        procDiv.textContent = `${proc.name} (CPT: ${proc.cpt})`;
        procDiv.dataset.specialty = specialty;
        procDiv.dataset.category = category;
        procDiv.dataset.proc = JSON.stringify(proc);
        procDiv.style.display = 'none';

        procDiv.addEventListener('click', (e) => {
          e.stopPropagation();
          tree.querySelectorAll('.tree-item.procedure').forEach(p => p.classList.remove('selected'));
          procDiv.classList.add('selected');
          container.querySelector('#add-selected-procedure').disabled = false;
        });

        procDiv.addEventListener('dblclick', (e) => {
          e.stopPropagation();
          this.applyProcedureSelection(container, proc);
        });

        tree.appendChild(procDiv);
      });
    }
  }
};

HL7CreatorPlugin.prototype.collapseAllProcedures = function(container) {
  const tree = container.querySelector('#procedure-tree');

  tree.querySelectorAll('.tree-item.specialty').forEach(div => {
    div.dataset.expanded = 'false';
  });

  tree.querySelectorAll('.tree-item.category').forEach(div => {
    div.style.display = 'none';
    div.dataset.expanded = 'false';
  });

  tree.querySelectorAll('.tree-item.procedure').forEach(div => {
    div.style.display = 'none';
  });
};

HL7CreatorPlugin.prototype.expandAllProcedures = function(container) {
  const tree = container.querySelector('#procedure-tree');

  tree.querySelectorAll('.tree-item.specialty').forEach(div => {
    div.dataset.expanded = 'true';
  });

  tree.querySelectorAll('.tree-item.category').forEach(div => {
    div.style.display = 'block';
    div.dataset.expanded = 'true';
  });

  tree.querySelectorAll('.tree-item.procedure').forEach(div => {
    div.style.display = 'block';
  });
};

HL7CreatorPlugin.prototype.clearSearch = function(container) {
  container.querySelector('#procedure-search').value = '';
  this.resetProcedureTree(container);
};

HL7CreatorPlugin.prototype.resetProcedureTree = function(container) {
  const tree = container.querySelector('#procedure-tree');

  tree.querySelectorAll('.tree-item.specialty').forEach(div => {
    div.dataset.expanded = 'false';
  });

  tree.querySelectorAll('.tree-item.category').forEach(div => {
    div.style.display = 'none';
    div.dataset.expanded = 'false';
  });

  tree.querySelectorAll('.tree-item.procedure').forEach(div => {
    div.style.display = 'none';
    div.classList.remove('match');
    div.classList.remove('selected');
  });

  container.querySelector('#add-selected-procedure').disabled = true;
};

HL7CreatorPlugin.prototype.filterProcedures = function(container) {
  const searchTerm = container.querySelector('#procedure-search').value.toLowerCase();

  if (!searchTerm) {
    this.resetProcedureTree(container);
    return;
  }

  const tree = container.querySelector('#procedure-tree');
  const procedures = tree.querySelectorAll('.tree-item.procedure');

  tree.querySelectorAll('.tree-item.procedure').forEach(proc => {
    proc.style.display = 'none';
    proc.classList.remove('match');
  });
  tree.querySelectorAll('.tree-item.category').forEach(cat => {
    cat.style.display = 'none';
    cat.dataset.expanded = 'false';
  });
  tree.querySelectorAll('.tree-item.specialty').forEach(spec => {
    spec.dataset.expanded = 'false';
  });

  procedures.forEach(proc => {
    const text = proc.textContent.toLowerCase();
    if (text.includes(searchTerm)) {
      proc.style.display = 'block';
      proc.classList.add('match');

      const specialty = proc.dataset.specialty;
      const category = proc.dataset.category;

      const specialtyDiv = Array.from(tree.querySelectorAll('.tree-item.specialty'))
        .find(div => div.textContent === specialty);
      if (specialtyDiv) specialtyDiv.dataset.expanded = 'true';

      const categoryDiv = Array.from(tree.querySelectorAll('.tree-item.category'))
        .find(div => div.textContent === category && div.dataset.specialty === specialty);
      if (categoryDiv) {
        categoryDiv.style.display = 'block';
      }
    }
  });
};

HL7CreatorPlugin.prototype.addSelectedProcedure = function(container) {
  const tree = container.querySelector('#procedure-tree');
  const selected = tree.querySelector('.tree-item.procedure.selected');

  if (selected && selected.dataset.proc) {
    const proc = JSON.parse(selected.dataset.proc);
    this.applyProcedureSelection(container, proc);
  }
};

HL7CreatorPlugin.prototype.chooseRandomProcedure = function(container) {
  if (this.state.procedures.length > 0) {
    const proc = this.getRandomElement(this.state.procedures);
    this.applyProcedureSelection(container, proc);
  }
};

HL7CreatorPlugin.prototype.applyProcedureSelection = function(container, proc) {
  container.querySelector('#procedure-name').value = proc.name || '';
  container.querySelector('#procedure-id').value = proc.id || '';
  container.querySelector('#cpt-code').value = proc.cpt || '';
  container.querySelector('#procedure-description').value = proc.description || '';
  container.querySelector('#special-needs').value = proc.special_needs || '';
  this.updatePreview(container);
};

HL7CreatorPlugin.prototype.createMessage = function(container) {
  const mrn = container.querySelector('#patient-mrn').value.trim();
  const firstName = container.querySelector('#patient-first-name').value.trim();
  const lastName = container.querySelector('#patient-last-name').value.trim();
  const dob = container.querySelector('#patient-dob').value.trim();
  const scheduleDate = container.querySelector('#schedule-date').value.trim();
  const scheduledTime = container.querySelector('#scheduled-time').value.trim();
  const procedureName = container.querySelector('#procedure-name').value.trim();

  if (!mrn || !firstName || !lastName || !dob) {
    this.notify('Please fill in all required patient information fields', 'error');
    return;
  }

  if (!this.validateDate(dob)) {
    this.notify('Invalid date of birth format. Use YYYYMMDD', 'error');
    return;
  }

  if (!this.validateDate(scheduleDate)) {
    this.notify('Invalid schedule date format. Use YYYYMMDD', 'error');
    return;
  }

  if (scheduledTime && !this.validateTime(scheduledTime)) {
    this.notify('Invalid time format. Use HHMMSS', 'error');
    return;
  }

  if (!procedureName) {
    this.notify('Please enter a procedure', 'error');
    return;
  }

  const formData = this.collectFormData(container);
  const messageType = container.querySelector('input[name="message-type"]:checked').value;
  const procedures = this.collectProcedures(container);

  // Generate SIU message
  const siuMessage = this.generateHL7Message(formData, procedures, messageType);

  // Generate ADT message (if allergies are present)
  let fullMessage = siuMessage;
  if (this.state.selectedAllergies && this.state.selectedAllergies.length > 0) {
    const adtMessage = this.generateADTMessage(formData);
    fullMessage = siuMessage + '\n\n--- ADT Message ---\n\n' + adtMessage;
  }

  container.querySelector('#message-preview').value = fullMessage;

  // Emit event for other plugins
  this.emit('hl7:message-created', {
    message: fullMessage,
    siuMessage: siuMessage,
    adtMessage: this.state.selectedAllergies?.length > 0 ? this.generateADTMessage(formData) : null,
    patient: {
      mrn: mrn,
      firstName: firstName,
      lastName: lastName,
      dob: dob
    }
  });

  this.notify('Message created successfully!', 'success');
};

HL7CreatorPlugin.prototype.collectFormData = function(container) {
  const encounterTypeRadio = container.querySelector('input[name="encounter-type"]:checked');
  const encounterType = encounterTypeRadio ? encounterTypeRadio.value : 'DS';

  const environmentRadio = container.querySelector('input[name="environment"]:checked');
  const environment = environmentRadio ? environmentRadio.value : 'US Demo';

  const lateralityRadio = container.querySelector('input[name="laterality"]:checked');
  const laterality = lateralityRadio ? lateralityRadio.value : 'A';

  const getUpperValue = (id, placeholder) => {
    const val = container.querySelector('#' + id).value.trim();
    return val ? val.toUpperCase() : placeholder;
  };

  // Get isolations value based on environment
  let isolations = '';
  const activeIsolationsSelect = environment === 'UCH'
    ? container.querySelector('#isolations-uch')
    : container.querySelector('#isolations-us-demo');

  if (activeIsolationsSelect.value === 'OTHER') {
    isolations = getUpperValue('isolations-other', '');
  } else {
    isolations = activeIsolationsSelect.value || '';
  }

  return {
    patientMRN: getUpperValue('patient-mrn', '{patientMRN}'),
    patientFirstName: getUpperValue('patient-first-name', '{patientFirstName}'),
    patientLastName: getUpperValue('patient-last-name', '{patientLastName}'),
    patientDOB: getUpperValue('patient-dob', '{patientDOB}'),
    patientGender: getUpperValue('patient-gender', '{patientGender}'),
    encounterType: encounterType.toUpperCase(),
    environment: environment,
    YYYYMMDD: getUpperValue('schedule-date', '{YYYYMMDD}'),
    scheduledTime: getUpperValue('scheduled-time', '{scheduledTime}'),
    duration: container.querySelector('#duration').value || '{duration}',
    asaScore: getUpperValue('asa-score', ''),
    anesthesiaType: container.querySelector('#anesthesia-type').value.toUpperCase() || '',
    isolations: isolations,
    locationOR: getUpperValue('location-or', '{locationOR}'),
    locationDepartment: getUpperValue('location-dept', '{locationDepartment}'),
    addOn: getUpperValue('add-on', 'N'),
    eventTime: this.formatTime(new Date()),

    surgeonID: '10001',
    surgeonLastName: getUpperValue('surgeon-last', '{surgeonLastName}'),
    surgeonFirstName: getUpperValue('surgeon-first', '{surgeonFirstName}'),

    circulatorID: '10002',
    circulatorLastName: getUpperValue('circulator-last', '{circulatorLastName}'),
    circulatorFirstName: getUpperValue('circulator-first', '{circulatorFirstName}'),

    scrubID: '10003',
    scrubLastName: getUpperValue('scrub-last', '{scrubLastName}'),
    scrubFirstName: getUpperValue('scrub-first', '{scrubFirstName}'),

    crnaID: '10004',
    crnaLastName: getUpperValue('crna-last', '{crnaLastName}'),
    crnaFirstName: getUpperValue('crna-first', '{crnaFirstName}'),

    anesthesiologistID: '10005',
    anesthesiologistLastName: getUpperValue('anesthesiologist-last', '{anesthesiologistLastName}'),
    anesthesiologistFirstName: getUpperValue('anesthesiologist-first', '{anesthesiologistFirstName}'),

    procedure: getUpperValue('procedure-name', '{procedure}'),
    procedureId: getUpperValue('procedure-id', '{procedureId}'),
    cptCode: getUpperValue('cpt-code', '{cptCode}'),
    procedureDescription: getUpperValue('procedure-description', '{procedureDescription}'),
    specialNeeds: getUpperValue('special-needs', '{specialNeeds}'),
    laterality: laterality,

    specialty: 'SURGERY',
    triggerEvent: 'S12',
    caseEvent: 'CASE_SCHED'
  };
};

HL7CreatorPlugin.prototype.collectProcedures = function(container) {
  const procedures = [];

  const mainLateralityRadio = container.querySelector('input[name="laterality"]:checked');
  const mainLaterality = mainLateralityRadio ? mainLateralityRadio.value : 'A';

  const mainProc = {
    name: container.querySelector('#procedure-name').value.trim(),
    cpt: container.querySelector('#cpt-code').value.trim(),
    id: container.querySelector('#procedure-id').value.trim(),
    description: container.querySelector('#procedure-description').value.trim(),
    special_needs: container.querySelector('#special-needs').value.trim(),
    laterality: mainLaterality
  };

  if (mainProc.name) {
    procedures.push(mainProc);
  }

  const proceduresContainer = container.querySelector('#procedures-container');
  Array.from(proceduresContainer.children).forEach((proc, index) => {
    const num = index + 1;
    const nameEl = container.querySelector(`#proc-${num}-name`);
    const cptEl = container.querySelector(`#proc-${num}-cpt`);
    const descEl = container.querySelector(`#proc-${num}-desc`);
    const needsEl = container.querySelector(`#proc-${num}-needs`);
    const lateralityRadio = container.querySelector(`input[name="proc-${num}-laterality"]:checked`);
    const laterality = lateralityRadio ? lateralityRadio.value : 'A';

    if (nameEl && nameEl.value.trim()) {
      procedures.push({
        name: nameEl.value.trim(),
        cpt: cptEl ? cptEl.value.trim() : '',
        description: descEl ? descEl.value.trim() : '',
        special_needs: needsEl ? needsEl.value.trim() : '',
        laterality: laterality,
        id: `PROC${String(procedures.length + 1).padStart(3, '0')}`
      });
    }
  });

  return procedures;
};

HL7CreatorPlugin.prototype.updatePreview = function(container) {
  const formData = this.collectFormData(container);
  const procedures = this.collectProcedures(container);

  const messageTypeInput = container.querySelector('input[name="message-type"]:checked');
  const messageType = messageTypeInput ? messageTypeInput.value : 'scheduled';

  // Generate SIU message
  const siuMessage = this.generateHL7Message(formData, procedures, messageType);

  // Generate ADT message if allergies present
  let fullMessage = siuMessage;
  if (this.state.selectedAllergies && this.state.selectedAllergies.length > 0) {
    const adtMessage = this.generateADTMessage(formData);
    fullMessage = siuMessage + '\n\n--- ADT Message ---\n\n' + adtMessage;
  }

  container.querySelector('#message-preview').value = fullMessage;
};

HL7CreatorPlugin.prototype.convertLaterality = function(laterality, environment) {
  if (environment === 'UCH') {
    // UCH uses numeric codes
    const lateralityMap = {
      'L': '1',
      'R': '2',
      'B': '3',
      'N': '4',
      'A': '4'
    };
    return lateralityMap[laterality] || '4';
  } else {
    // US Demo uses letter codes
    const lateralityMap = {
      'L': 'L',
      'R': 'R',
      'B': 'B',
      'N': 'N/A',
      'A': 'N/A'
    };
    return lateralityMap[laterality] || 'N/A';
  }
};

HL7CreatorPlugin.prototype.generateHL7Message = function(formData, procedures, messageType) {
  formData.triggerEvent = messageType === 'scheduled' ? 'S12' : messageType === 'cancelled' ? 'S15' : 'S14';

  // Start with base segments
  let segments = [];

  // MSH segment
  segments.push(`MSH|^~\\&|EPIC|NC||NC|{YYYYMMDD}{eventTime}||SIU^{triggerEvent}|{patientMRN}|P|2.5`);

  // SCH segment
  segments.push(`SCH||{patientMRN}|||||||{duration}|M|^^^{YYYYMMDD}{scheduledTime}`);

  // ZCS segment
  segments.push(`ZCS||{addOn}|ORSCH_S14||||{cptCode}^{procedure}^CPT`);

  // PID segment
  segments.push(`PID|1||{patientMRN}^^^MRN^MRN||{patientLastName}^{patientFirstName}||{patientDOB}|{patientGender}|{patientLastName}^{patientFirstName}^^|||||||||{patientMRN}`);

  // PV1 segment
  segments.push(`PV1||{encounterType}|NC-PERIOP^^^NC|||||||{specialty}|||||||||{patientMRN}`);

  // PV2 segment (US Demo only - for isolations)
  if (formData.environment === 'US Demo' && formData.isolations) {
    segments.push(`PV2|||||||${formData.isolations}|`);
  } else if (formData.environment === 'US Demo') {
    segments.push(`PV2|||||||`);
  }

  // RGS segment
  segments.push(`RGS|`);

  // OBX segments
  let obxSequence = 1;

  // ASA Score OBX (both environments)
  if (formData.asaScore) {
    segments.push(`OBX|${obxSequence}|NM|ASA^ASA Score||${formData.asaScore}|||||||||{YYYYMMDD}{eventTime}||||||||||||||||||`);
    obxSequence++;
  }

  // Anesthesia Type OBX (UCH only)
  if (formData.environment === 'UCH' && formData.anesthesiaType) {
    segments.push(`OBX|${obxSequence}|ST|ANESTHESIA^Anesthesia Type||${formData.anesthesiaType}|||||||||{YYYYMMDD}{eventTime}||||||||||||||||||`);
    obxSequence++;
  }

  // Isolations OBX segments (UCH only - one per isolation)
  if (formData.environment === 'UCH' && formData.isolations) {
    const isolationList = formData.isolations.split('~').filter(iso => iso.trim());
    isolationList.forEach(isolation => {
      segments.push(`OBX|${obxSequence}|ST|ISOLATION^Risk Factor||^${isolation.trim()}|||||||||{YYYYMMDD}{eventTime}||||||||||||||||||`);
      obxSequence++;
    });
  }

  // AIS segments (one per procedure)
  const allProcedures = procedures.length > 0 ? procedures : [{
    name: formData.procedure,
    id: formData.procedureId,
    cpt: formData.cptCode,
    description: formData.procedureDescription,
    special_needs: formData.specialNeeds,
    laterality: formData.laterality
  }];

  allProcedures.forEach((proc, index) => {
    const seq = index + 1;
    const laterality = this.convertLaterality(proc.laterality || 'A', formData.environment);
    let aisSegment = `AIS|${seq}||${proc.id}^${proc.name}`;

    // Environment-specific AIS field placement
    if (formData.environment === 'UCH') {
      // UCH: Laterality at field 3, component 4 (numeric: 1=L, 2=R, 3=B, 4=N/A)
      aisSegment += `^CPT^${laterality}`;
    } else {
      // US Demo: Standard field 3
      aisSegment += ``;
    }

    aisSegment += `|{YYYYMMDD}{scheduledTime}|0|M|{duration}|M`;

    // US Demo: Anesthesia at field 11
    if (formData.environment === 'US Demo') {
      aisSegment += `|||${formData.anesthesiaType ? formData.anesthesiaType + '^' : ''}`;
      // Laterality at field 12 (letter: L, R, B, N/A)
      aisSegment += `|${laterality}`;
    } else {
      aisSegment += `||||`;
    }

    aisSegment += `|2`;
    segments.push(aisSegment);

    // NTE segments for procedure
    if (proc.description) {
      segments.push(`NTE|${seq}||${proc.description}|Procedure Description|||`);
    }
    if (proc.special_needs) {
      segments.push(`NTE|${seq + allProcedures.length}||${proc.special_needs}|Case Notes|||`);
    }
  });

  // AIL segment
  segments.push(`AIL|1||^{locationOR}^^{locationDepartment}`);

  // AIP segments (staff)
  segments.push(`AIP|1||{surgeonID}^{surgeonLastName}^{surgeonFirstName}^W^^^^^EPIC^^^^PROVID|1.1^Primary|{specialty}|{YYYYMMDD}{scheduledTime}|0|M|{duration}|M`);
  segments.push(`AIP|2||{circulatorID}^{circulatorLastName}^{circulatorFirstName}^^^^^^EPIC^^^^PROVID|4.20^Circulator||{YYYYMMDD}{scheduledTime}|0|M|{duration}|M`);
  segments.push(`AIP|3||{scrubID}^{scrubLastName}^{scrubFirstName}^^^^^^^EPIC^^^^PROVID|4.150^Scrub||{YYYYMMDD}{scheduledTime}|0|M|{duration}|M`);
  segments.push(`AIP|4||{crnaID}^{crnaLastName}^{crnaFirstName}^^^^^^^EPIC^^^^PROVID|2.20^ANE CRNA||{YYYYMMDD}{scheduledTime}|0|M|{duration}|M`);
  segments.push(`AIP|5||{anesthesiologistID}^{anesthesiologistLastName}^{anesthesiologistFirstName}^^^^^^^EPIC^^^^PROVID|2.139^Anesthesiologist||{YYYYMMDD}{scheduledTime}|0|M|{duration}|M`);

  // Join segments
  let message = segments.join('\n');

  // Replace placeholders
  for (const [key, value] of Object.entries(formData)) {
    const placeholder = `{${key}}`;
    message = message.replaceAll(placeholder, value);
  }

  return message.trim();
};

HL7CreatorPlugin.prototype.generateADTMessage = function(formData) {
  let segments = [];

  // MSH segment
  segments.push(`MSH|^~\\&|EPIC|NC||NC|{YYYYMMDD}{eventTime}||ADT^A01|{patientMRN}|P|2.5`);

  // EVN segment
  segments.push(`EVN|A01|{YYYYMMDD}{eventTime}`);

  // PID segment
  segments.push(`PID|1||{patientMRN}^^^MRN^MRN||{patientLastName}^{patientFirstName}||{patientDOB}|{patientGender}|{patientLastName}^{patientFirstName}^^|||||||||{patientMRN}`);

  // PV1 segment
  segments.push(`PV1||{encounterType}|NC-PERIOP^^^NC||||||||||||||||||{patientMRN}`);

  // PV2 segment (if isolations in US Demo)
  if (formData.environment === 'US Demo' && formData.isolations) {
    segments.push(`PV2|||||||${formData.isolations}|`);
  } else {
    segments.push(`PV2|||||||`);
  }

  // AL1 segments (allergies)
  if (this.state.selectedAllergies && this.state.selectedAllergies.length > 0) {
    this.state.selectedAllergies.forEach((allergy, index) => {
      const seq = index + 1;
      const allergyType = allergy.allergyName === 'No Known Allergies' ? '' : 'DA'; // Drug allergy
      segments.push(`AL1|${seq}|${allergyType}|${allergy.allergyID}^${allergy.allergyName}||${allergy.allergySeverity || ''}|${allergy.allergyReaction || ''}|`);
    });
  }

  // Join segments
  let message = segments.join('\n');

  // Replace placeholders
  for (const [key, value] of Object.entries(formData)) {
    const placeholder = `{${key}}`;
    message = message.replaceAll(placeholder, value);
  }

  return message.trim();
};

// Menu action handlers
HL7CreatorPlugin.prototype.onNew = async function() {
  const container = this.getContainer();
  this.clearAll(container);
  this.notify('New message form cleared', 'success');
};

HL7CreatorPlugin.prototype.onSave = async function() {
  const container = this.getContainer();
  const message = container.querySelector('#message-preview').value;

  if (!message || message.includes('{')) {
    this.notify('Please create a valid message first', 'error');
    return;
  }

  const firstName = container.querySelector('#patient-first-name').value.trim();
  const lastName = container.querySelector('#patient-last-name').value.trim();
  const defaultFilename = `${firstName}${lastName}-00.hl7`;

  const result = await this.file.saveFile(message, defaultFilename);

  if (result.success && !result.canceled) {
    this.notify(`Message saved to ${result.path}`, 'success');
  } else if (!result.canceled) {
    this.notify('Failed to save message', 'error');
  }
};

HL7CreatorPlugin.prototype.onOpen = async function() {
  const result = await this.file.openFiles({
    filters: [
      { name: 'HL7 Files', extensions: ['hl7'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (result.success && !result.canceled && result.files.length > 0) {
    const file = result.files[0];
    const container = this.getContainer();
    container.querySelector('#message-preview').value = file.content;
    this.notify(`Opened ${file.name}`, 'success');
  }
};
