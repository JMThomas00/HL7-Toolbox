// HL7 Message Creator - Main Application JavaScript

// Application State
const appState = {
  mode: 'creator', // 'creator' or 'editor'
  patients: [],
  currentPatientIndex: -1,
  currentMessageIndex: -1,
  patientBlocks: [],
  procedures: [],
  staff: [],
  lastMRN: 999,
  editedMessages: {},
  directEditMode: false
};

// Default HL7 Template
const DEFAULT_HL7_TEMPLATE = `MSH|^~\\&|EPIC|NC||NC|{YYYYMMDD}{eventTime}||SIU^{triggerEvent}|{patientMRN}|P|2.5
SCH||{patientMRN}|||||||{duration}|M|^^^{YYYYMMDD}{scheduledTime}
ZCS||{addOn}|ORSCH_S14||||{cptCode}^{procedure}^CPT
PID|1||{patientMRN}^^^MRN^MRN||{patientLastName}^{patientFirstName}||{patientDOB}|{patientGender}|{patientLastName}^{patientFirstName}^^|||||||||{patientMRN}
PV1||{encounterType}|NC-PERIOP^^^NC|||||||{specialty}|||||||||{patientMRN}
RGS|
OBX|1|DTM|{caseEvent}|In|{YYYYMMDD}{eventTime}|||||||||{YYYYMMDD}{eventTime}||||||||||||||||||
AIS|1||{procedureId}^{procedure}|{YYYYMMDD}{scheduledTime}|0|M|{duration}|M||||2
NTE|1||{procedureDescription}
NTE|2||{specialNeeds}
AIG|1|||||{YYYYMMDD}{scheduledTime}|0|M|{duration}|M|||{surgeonID}^{surgeon}^^^^^^^^^^^^^PI
AIP|1||{anesthesiologistID}^{anesthesiologist}^^^^^^^^^^^^^PI|||||{YYYYMMDD}{scheduledTime}|0|M|{duration}|M
AIL|1||^{locationOR}^{locationDepartment}|||||{YYYYMMDD}{scheduledTime}|0|M|{duration}|M`;

// Utility Functions
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}${minutes}${seconds}`;
}

function validateDate(dateStr) {
  if (!dateStr || dateStr.length !== 8) return false;
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6));
  const day = parseInt(dateStr.substring(6, 8));
  
  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  
  return true;
}

function validateTime(timeStr) {
  if (!timeStr || timeStr.length !== 6) return false;
  const hours = parseInt(timeStr.substring(0, 2));
  const minutes = parseInt(timeStr.substring(2, 4));
  const seconds = parseInt(timeStr.substring(4, 6));
  
  if (hours < 0 || hours > 23) return false;
  if (minutes < 0 || minutes > 59) return false;
  if (seconds < 0 || seconds > 59) return false;
  
  return true;
}

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomMRN() {
  appState.lastMRN++;
  return String(appState.lastMRN).padStart(6, '0');
}

// CSV Data Loading
async function loadCSVData() {
  try {
    // Load procedures CSV
    const proceduresResult = await window.electronAPI.loadCSV('surgical_procedures.csv');
    if (proceduresResult.success) {
      appState.procedures = parseCSV(proceduresResult.content);
      populateProcedureTree();
    }

    // Load staff CSV
    const staffResult = await window.electronAPI.loadCSV('staff.csv');
    if (staffResult.success) {
      appState.staff = parseCSV(staffResult.content);
    }
  } catch (error) {
    console.error('Error loading CSV data:', error);
    showNotification('Error loading data files', 'error');
  }
}

function parseCSV(csvContent) {
  // Simple CSV parser (for production, consider using Papa Parse library)
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    return obj;
  });
}

// Notification System
function showNotification(message, type = 'info') {
  // Simple notification - could be enhanced with a toast library
  alert(message);
}

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Initializing HL7 Message Creator...');
  
  // Load CSV data
  await loadCSVData();
  
  // Set up event listeners
  setupMenuHandlers();
  setupCreatorHandlers();
  setupEditorHandlers();
  setupKeyboardShortcuts();
  
  // Set today's date as default
  document.getElementById('schedule-date').value = formatDate(new Date());
  
  console.log('Application initialized successfully');
});

// Menu Handlers
function setupMenuHandlers() {
  // File Menu
  document.getElementById('menu-new-patient').addEventListener('click', createNewPatient);
  document.getElementById('menu-open-files').addEventListener('click', openFiles);
  document.getElementById('menu-save').addEventListener('click', saveFiles);
  document.getElementById('menu-save-exit').addEventListener('click', saveAndExit);
  document.getElementById('menu-quit').addEventListener('click', quitApplication);
  
  // View Menu
  document.getElementById('menu-view-creator').addEventListener('click', () => setMode('creator'));
  document.getElementById('menu-view-editor').addEventListener('click', () => setMode('editor'));
  
  // Help Menu
  document.getElementById('menu-help').addEventListener('click', showHelp);
  document.getElementById('menu-about').addEventListener('click', showAbout);
}

function setMode(mode) {
  appState.mode = mode;
  
  const creatorMode = document.getElementById('creator-mode');
  const editorMode = document.getElementById('editor-mode');
  
  if (mode === 'creator') {
    creatorMode.style.display = 'block';
    editorMode.style.display = 'none';
    document.title = 'HL7 Message Creator';
    
    // Enable/disable menu items
    document.getElementById('menu-new-patient').disabled = false;
    document.getElementById('menu-open-files').disabled = true;
  } else {
    creatorMode.style.display = 'none';
    editorMode.style.display = 'block';
    document.title = 'HL7 Message Editor';
    
    // Enable/disable menu items
    document.getElementById('menu-new-patient').disabled = true;
    document.getElementById('menu-open-files').disabled = false;
  }
}

// Keyboard Shortcuts
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl+N - New Patient
    if (e.ctrlKey && e.key === 'n') {
      e.preventDefault();
      if (appState.mode === 'creator') createNewPatient();
    }
    
    // Ctrl+O - Open Files
    if (e.ctrlKey && e.key === 'o') {
      e.preventDefault();
      if (appState.mode === 'editor') openFiles();
    }
    
    // Ctrl+S - Save
    if (e.ctrlKey && e.key === 's' && !e.shiftKey) {
      e.preventDefault();
      saveFiles();
    }
    
    // Ctrl+Shift+S - Save and Exit
    if (e.ctrlKey && e.shiftKey && e.key === 'S') {
      e.preventDefault();
      saveAndExit();
    }
    
    // Ctrl+Q - Quit
    if (e.ctrlKey && e.key === 'q') {
      e.preventDefault();
      quitApplication();
    }
    
    // Ctrl+R - Creator Mode
    if (e.ctrlKey && e.key === 'r') {
      e.preventDefault();
      setMode('creator');
    }
    
    // Ctrl+E - Editor Mode
    if (e.ctrlKey && e.key === 'e') {
      e.preventDefault();
      setMode('editor');
    }
  });
}

// Creator Mode Handlers
function setupCreatorHandlers() {
  // Random buttons
  document.getElementById('random-mrn').addEventListener('click', () => {
    document.getElementById('patient-mrn').value = generateRandomMRN();
  });
  
  document.getElementById('random-first-name').addEventListener('click', () => {
    const firstNames = ['JOHN', 'JANE', 'MICHAEL', 'SARAH', 'DAVID', 'EMILY', 'JAMES', 'OLIVIA'];
    document.getElementById('patient-first-name').value = getRandomElement(firstNames);
  });
  
  document.getElementById('random-last-name').addEventListener('click', () => {
    const lastNames = ['SMITH', 'JOHNSON', 'WILLIAMS', 'BROWN', 'JONES', 'GARCIA', 'MILLER', 'DAVIS'];
    document.getElementById('patient-last-name').value = getRandomElement(lastNames);
  });
  
  document.getElementById('random-dob').addEventListener('click', () => {
    const year = 1940 + Math.floor(Math.random() * 60);
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    document.getElementById('patient-dob').value = `${year}${month}${day}`;
  });
  
  document.getElementById('today-date').addEventListener('click', () => {
    document.getElementById('schedule-date').value = formatDate(new Date());
  });
  
  // Staff random buttons
  document.getElementById('random-surgeon').addEventListener('click', () => {
    const surgeons = appState.staff.filter(s => s.role === 'Surgeon');
    if (surgeons.length > 0) {
      const surgeon = getRandomElement(surgeons);
      document.getElementById('surgeon').value = surgeon.name;
    }
  });
  
  document.getElementById('random-anesthesiologist').addEventListener('click', () => {
    const anesths = appState.staff.filter(s => s.role === 'Anesthesiologist');
    if (anesths.length > 0) {
      const anesth = getRandomElement(anesths);
      document.getElementById('anesthesiologist').value = anesth.name;
    }
  });
  
  document.getElementById('random-nurse').addEventListener('click', () => {
    const nurses = appState.staff.filter(s => s.role === 'Nurse');
    if (nurses.length > 0) {
      const nurse = getRandomElement(nurses);
      document.getElementById('nurse').value = nurse.name;
    }
  });
  
  // Procedure management
  document.getElementById('add-procedure').addEventListener('click', addProcedure);
  
  // Create message button
  document.getElementById('create-message').addEventListener('click', createMessage);
  
  // Procedure search
  document.getElementById('procedure-search').addEventListener('input', filterProcedures);
}

function addProcedure() {
  const container = document.getElementById('procedures-container');
  const procedureNum = container.children.length + 1;
  
  const procedureDiv = document.createElement('div');
  procedureDiv.className = 'procedure-item';
  procedureDiv.dataset.procedureNum = procedureNum;
  
  procedureDiv.innerHTML = `
    <div class="procedure-header">
      <span class="procedure-number">Procedure ${procedureNum}</span>
      <button class="remove-procedure" onclick="removeProcedure(${procedureNum})">Remove</button>
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
  `;
  
  container.appendChild(procedureDiv);
}

function removeProcedure(num) {
  const container = document.getElementById('procedures-container');
  const procedure = container.querySelector(`[data-procedure-num="${num}"]`);
  if (procedure) {
    container.removeChild(procedure);
    renumberProcedures();
  }
}

function renumberProcedures() {
  const container = document.getElementById('procedures-container');
  Array.from(container.children).forEach((proc, index) => {
    const num = index + 1;
    proc.dataset.procedureNum = num;
    proc.querySelector('.procedure-number').textContent = `Procedure ${num}`;
  });
}

// HL7 Message Generation
function createMessage() {
  // Validate required fields
  const mrn = document.getElementById('patient-mrn').value.trim();
  const firstName = document.getElementById('patient-first-name').value.trim();
  const lastName = document.getElementById('patient-last-name').value.trim();
  const dob = document.getElementById('patient-dob').value.trim();
  const scheduleDate = document.getElementById('schedule-date').value.trim();
  const scheduledTime = document.getElementById('scheduled-time').value.trim();
  
  if (!mrn || !firstName || !lastName || !dob) {
    showNotification('Please fill in all required patient information fields', 'error');
    return;
  }
  
  if (!validateDate(dob)) {
    showNotification('Invalid date of birth format. Use YYYYMMDD', 'error');
    return;
  }
  
  if (!validateDate(scheduleDate)) {
    showNotification('Invalid schedule date format. Use YYYYMMDD', 'error');
    return;
  }
  
  if (scheduledTime && !validateTime(scheduledTime)) {
    showNotification('Invalid time format. Use HHMMSS', 'error');
    return;
  }
  
  // Collect form data
  const formData = {
    patientMRN: mrn,
    patientFirstName: firstName,
    patientLastName: lastName,
    patientDOB: dob,
    patientGender: document.getElementById('patient-gender').value,
    encounterType: document.getElementById('encounter-type').value,
    YYYYMMDD: scheduleDate,
    scheduledTime: scheduledTime || '080000',
    duration: document.getElementById('duration').value,
    locationOR: document.getElementById('location-or').value.trim(),
    locationDepartment: document.getElementById('location-dept').value.trim(),
    addOn: document.getElementById('add-on').value,
    eventTime: formatTime(new Date()),
    surgeon: document.getElementById('surgeon').value.trim(),
    anesthesiologist: document.getElementById('anesthesiologist').value.trim(),
    surgeonID: '12345',
    anesthesiologistID: '67890'
  };
  
  // Get message type
  const messageType = document.querySelector('input[name="message-type"]:checked').value;
  formData.triggerEvent = messageType === 'scheduled' ? 'S12' : messageType === 'cancelled' ? 'S15' : 'S14';
  formData.caseEvent = 'Case Start';
  
  // Get procedures
  const procedures = collectProcedures();
  if (procedures.length === 0) {
    showNotification('Please add at least one procedure', 'error');
    return;
  }
  
  // Generate message
  const message = generateHL7Message(formData, procedures, messageType);
  
  // Display in preview
  document.getElementById('message-preview').value = message;
}

function collectProcedures() {
  const procedures = [];
  const container = document.getElementById('procedures-container');
  
  Array.from(container.children).forEach((proc, index) => {
    const num = index + 1;
    const name = document.getElementById(`proc-${num}-name`)?.value.trim();
    const cpt = document.getElementById(`proc-${num}-cpt`)?.value.trim();
    const desc = document.getElementById(`proc-${num}-desc`)?.value.trim();
    const needs = document.getElementById(`proc-${num}-needs`)?.value.trim();
    
    if (name && cpt) {
      procedures.push({
        name: name,
        cpt: cpt,
        description: desc || '',
        specialNeeds: needs || '',
        id: `PROC${String(num).padStart(3, '0')}`
      });
    }
  });
  
  return procedures;
}

function generateHL7Message(formData, procedures, messageType) {
  let message = DEFAULT_HL7_TEMPLATE;
  
  // Replace base variables
  for (const [key, value] of Object.entries(formData)) {
    const placeholder = `{${key}}`;
    message = message.replaceAll(placeholder, value);
  }
  
  // Handle first procedure
  if (procedures.length > 0) {
    const proc = procedures[0];
    message = message.replaceAll('{procedure}', proc.name);
    message = message.replaceAll('{cptCode}', proc.cpt);
    message = message.replaceAll('{procedureId}', proc.id);
    message = message.replaceAll('{procedureDescription}', proc.description);
    message = message.replaceAll('{specialNeeds}', proc.specialNeeds);
    message = message.replaceAll('{specialty}', 'SURGERY');
  }
  
  // Remove OBX line if not case events message
  if (messageType !== 'events') {
    const lines = message.split('\n');
    message = lines.filter(line => !line.startsWith('OBX')).join('\n');
  }
  
  return message.trim();
}

// Procedure Tree/Browser
function populateProcedureTree() {
  const tree = document.getElementById('procedure-tree');
  tree.innerHTML = '';
  
  // Group by specialty
  const specialties = {};
  appState.procedures.forEach(proc => {
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
      
      const categoryDivs = tree.querySelectorAll(`[data-specialty="${specialty}"]`);
      categoryDivs.forEach(div => {
        div.style.display = !isExpanded ? 'block' : 'none';
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
        procDiv.style.display = 'none';
        
        procDiv.addEventListener('click', (e) => {
          e.stopPropagation();
          selectProcedure(proc);
        });
        
        tree.appendChild(procDiv);
      });
    }
  }
}

function selectProcedure(proc) {
  // Add to the first empty procedure slot or create new one
  const container = document.getElementById('procedures-container');
  let emptySlot = null;
  
  for (let i = 0; i < container.children.length; i++) {
    const num = i + 1;
    const nameInput = document.getElementById(`proc-${num}-name`);
    if (nameInput && !nameInput.value) {
      emptySlot = num;
      break;
    }
  }
  
  if (!emptySlot) {
    addProcedure();
    emptySlot = container.children.length;
  }
  
  document.getElementById(`proc-${emptySlot}-name`).value = proc.name;
  document.getElementById(`proc-${emptySlot}-cpt`).value = proc.cpt;
  document.getElementById(`proc-${emptySlot}-desc`).value = proc.description || '';
  document.getElementById(`proc-${emptySlot}-needs`).value = proc.special_needs || '';
}

function filterProcedures() {
  const searchTerm = document.getElementById('procedure-search').value.toLowerCase();
  const tree = document.getElementById('procedure-tree');
  const procedures = tree.querySelectorAll('.tree-item.procedure');
  
  procedures.forEach(proc => {
    const text = proc.textContent.toLowerCase();
    if (text.includes(searchTerm)) {
      proc.style.display = 'block';
      proc.classList.add('match');
      
      // Show parent category and specialty
      const specialty = proc.dataset.specialty;
      const category = proc.dataset.category;
      
      const specialtyDiv = Array.from(tree.querySelectorAll('.tree-item.specialty'))
        .find(div => div.textContent === specialty);
      if (specialtyDiv) specialtyDiv.dataset.expanded = 'true';
      
      const categoryDiv = Array.from(tree.querySelectorAll('.tree-item.category'))
        .find(div => div.textContent === category && div.dataset.specialty === specialty);
      if (categoryDiv) {
        categoryDiv.style.display = 'block';
        categoryDiv.dataset.expanded = 'true';
      }
    } else {
      if (!searchTerm) {
        proc.classList.remove('match');
      } else {
        proc.style.display = 'none';
      }
    }
  });
}

// Editor Mode Handlers
function setupEditorHandlers() {
  document.getElementById('editor-prev-patient').addEventListener('click', prevPatient);
  document.getElementById('editor-prev-message').addEventListener('click', prevMessage);
  document.getElementById('editor-next-message').addEventListener('click', nextMessage);
  document.getElementById('editor-next-patient').addEventListener('click', nextPatient);
  
  document.getElementById('editor-apply').addEventListener('click', () => applyEdits(false));
  document.getElementById('editor-apply-all').addEventListener('click', () => applyEdits(true));
  document.getElementById('editor-direct-edit').addEventListener('click', toggleDirectEdit);
}

async function openFiles() {
  const files = await window.electronAPI.openFiles();
  
  if (!files || files.length === 0) {
    return;
  }
  
  // Group files by patient (based on filename pattern)
  appState.patientBlocks = groupFilesByPatient(files);
  appState.currentPatientIndex = 0;
  appState.currentMessageIndex = 0;
  
  if (appState.patientBlocks.length > 0) {
    displayCurrentMessage();
    showNotification(`Loaded ${files.length} messages from ${appState.patientBlocks.length} patients`, 'success');
  }
}

function groupFilesByPatient(files) {
  const patients = {};
  
  files.forEach(file => {
    // Extract patient name from filename (assumes format: PatientName-XX.hl7)
    const match = file.name.match(/^(.+?)-\d+\.hl7$/);
    const patientName = match ? match[1] : file.name;
    
    if (!patients[patientName]) {
      patients[patientName] = {
        name: patientName,
        messages: []
      };
    }
    
    patients[patientName].messages.push({
      filename: file.name,
      path: file.path,
      content: file.content,
      originalContent: file.content
    });
  });
  
  // Convert to array and sort messages
  return Object.values(patients).map(patient => {
    patient.messages.sort((a, b) => a.filename.localeCompare(b.filename));
    return patient;
  });
}

function displayCurrentMessage() {
  if (appState.patientBlocks.length === 0) {
    document.getElementById('editor-context').textContent = 'No messages loaded';
    document.getElementById('editor-preview').value = '';
    return;
  }
  
  const patient = appState.patientBlocks[appState.currentPatientIndex];
  const message = patient.messages[appState.currentMessageIndex];
  
  // Update context label
  document.getElementById('editor-context').textContent = 
    `Patient: ${patient.name} | Message ${appState.currentMessageIndex + 1} of ${patient.messages.length}`;
  
  // Display message
  document.getElementById('editor-preview').value = message.content;
  
  // Parse and populate edit fields
  populateEditFields(message.content);
}

function populateEditFields(messageContent) {
  const lines = messageContent.split('\n');
  
  // Extract values from HL7 segments
  const values = {};
  
  lines.forEach(line => {
    if (line.startsWith('PID')) {
      const fields = line.split('|');
      if (fields.length > 3) {
        const mrn = fields[3].split('^')[0];
        values.patientMRN = mrn;
      }
    }
    
    if (line.startsWith('AIL')) {
      const fields = line.split('|');
      if (fields.length > 3) {
        const location = fields[3];
        const parts = location.split('^');
        values.locationOR = parts[1] || '';
        values.locationDepartment = parts[2] || '';
      }
    }
  });
  
  // Populate input fields
  document.getElementById('edit-patient-mrn').value = values.patientMRN || '';
  document.getElementById('edit-location-or').value = values.locationOR || '';
  document.getElementById('edit-location-dept').value = values.locationDepartment || '';
}

function prevMessage() {
  if (appState.patientBlocks.length === 0) return;
  
  if (appState.currentMessageIndex > 0) {
    appState.currentMessageIndex--;
    displayCurrentMessage();
  }
}

function nextMessage() {
  if (appState.patientBlocks.length === 0) return;
  
  const patient = appState.patientBlocks[appState.currentPatientIndex];
  if (appState.currentMessageIndex < patient.messages.length - 1) {
    appState.currentMessageIndex++;
    displayCurrentMessage();
  }
}

function prevPatient() {
  if (appState.patientBlocks.length === 0) return;
  
  if (appState.currentPatientIndex > 0) {
    appState.currentPatientIndex--;
    appState.currentMessageIndex = 0;
    displayCurrentMessage();
  }
}

function nextPatient() {
  if (appState.patientBlocks.length === 0) return;
  
  if (appState.currentPatientIndex < appState.patientBlocks.length - 1) {
    appState.currentPatientIndex++;
    appState.currentMessageIndex = 0;
    displayCurrentMessage();
  }
}

function applyEdits(applyToAll) {
  if (appState.patientBlocks.length === 0) return;
  
  const patient = appState.patientBlocks[appState.currentPatientIndex];
  const newMRN = document.getElementById('edit-patient-mrn').value.trim();
  const newOR = document.getElementById('edit-location-or').value.trim();
  const newDept = document.getElementById('edit-location-dept').value.trim();
  
  const messagesToEdit = applyToAll ? patient.messages : [patient.messages[appState.currentMessageIndex]];
  
  messagesToEdit.forEach(message => {
    let content = message.content;
    
    // Apply MRN changes
    if (newMRN) {
      content = content.replace(/PID\|1\|\|[^|]+/g, `PID|1||${newMRN}^^^MRN^MRN`);
    }
    
    // Apply location changes
    if (newOR || newDept) {
      const lines = content.split('\n');
      const updatedLines = lines.map(line => {
        if (line.startsWith('AIL')) {
          const fields = line.split('|');
          if (fields.length > 3) {
            const location = fields[3];
            const parts = location.split('^');
            parts[1] = newOR || parts[1] || '';
            parts[2] = newDept || parts[2] || '';
            fields[3] = parts.join('^');
            return fields.join('|');
          }
        }
        return line;
      });
      content = updatedLines.join('\n');
    }
    
    message.content = content;
  });
  
  displayCurrentMessage();
  showNotification(applyToAll ? 'Applied changes to all messages' : 'Applied changes to current message', 'success');
}

function toggleDirectEdit() {
  const preview = document.getElementById('editor-preview');
  appState.directEditMode = !appState.directEditMode;
  
  if (appState.directEditMode) {
    preview.removeAttribute('readonly');
    preview.style.backgroundColor = '#2A2D4A';
    document.getElementById('editor-direct-edit').textContent = 'Save Direct Edit';
  } else {
    preview.setAttribute('readonly', 'readonly');
    preview.style.backgroundColor = '#1E1E1E';
    document.getElementById('editor-direct-edit').textContent = 'Direct Edit';
    
    // Save the edited content
    if (appState.patientBlocks.length > 0) {
      const patient = appState.patientBlocks[appState.currentPatientIndex];
      const message = patient.messages[appState.currentMessageIndex];
      message.content = preview.value;
      showNotification('Direct edits saved', 'success');
    }
  }
}

// File Operations
function createNewPatient() {
  // Reset form
  document.getElementById('patient-mrn').value = '';
  document.getElementById('patient-first-name').value = '';
  document.getElementById('patient-last-name').value = '';
  document.getElementById('patient-dob').value = '';
  document.getElementById('patient-gender').value = 'M';
  document.getElementById('encounter-type').value = 'P';
  document.getElementById('schedule-date').value = formatDate(new Date());
  document.getElementById('scheduled-time').value = '';
  document.getElementById('duration').value = '60';
  document.getElementById('location-or').value = '';
  document.getElementById('location-dept').value = '';
  document.getElementById('add-on').value = 'N';
  document.getElementById('surgeon').value = '';
  document.getElementById('anesthesiologist').value = '';
  document.getElementById('nurse').value = '';
  document.getElementById('message-preview').value = '';
  
  // Clear procedures
  document.getElementById('procedures-container').innerHTML = '';
  
  // Clear search
  document.getElementById('procedure-search').value = '';
}

async function saveFiles() {
  if (appState.mode === 'creator') {
    // Save current message
    const message = document.getElementById('message-preview').value;
    if (!message.trim()) {
      showNotification('No message to save', 'error');
      return;
    }
    
    const firstName = document.getElementById('patient-first-name').value.trim();
    const lastName = document.getElementById('patient-last-name').value.trim();
    const defaultName = `${firstName}${lastName}-00.hl7`;
    
    const savedPath = await window.electronAPI.saveFile(defaultName, message);
    if (savedPath) {
      showNotification('Message saved successfully', 'success');
    }
  } else {
    // Save all edited messages
    if (appState.patientBlocks.length === 0) {
      showNotification('No messages to save', 'error');
      return;
    }
    
    const directory = await window.electronAPI.selectDirectory();
    if (!directory) return;
    
    let savedCount = 0;
    for (const patient of appState.patientBlocks) {
      for (const message of patient.messages) {
        const filePath = `${directory}/${message.filename}`;
        const result = await window.electronAPI.writeFile(filePath, message.content);
        if (result.success) savedCount++;
      }
    }
    
    showNotification(`Saved ${savedCount} messages successfully`, 'success');
  }
}

async function saveAndExit() {
  await saveFiles();
  setTimeout(() => quitApplication(), 500);
}

function quitApplication() {
  if (confirm('Are you sure you want to quit?')) {
    window.close();
  }
}

function showHelp() {
  const helpContent = `
HL7 Message Creator - Help

CREATOR MODE:
- Fill in patient information and scheduling details
- Add procedures using the browser or manually
- Use Random buttons to generate test data
- Click Create Message to generate HL7 message
- Save messages using File > Save

EDITOR MODE:
- Open HL7 files using File > Open Files
- Navigate between patients and messages
- Edit fields or use Direct Edit mode
- Apply changes to current or all messages
- Save changes using File > Save

KEYBOARD SHORTCUTS:
Ctrl+N  - New Patient (Creator mode)
Ctrl+O  - Open Files (Editor mode)
Ctrl+S  - Save
Ctrl+Shift+S - Save & Exit
Ctrl+R  - Switch to Creator mode
Ctrl+E  - Switch to Editor mode
Ctrl+Q  - Quit
  `;
  
  alert(helpContent);
}

function showAbout() {
  const aboutContent = `
HL7 Message Creator
Version 1.0.0 (Electron)

A desktop application for creating and editing healthcare HL7 messages.

Supports SIU (Scheduling Information Unsolicited) and ADT 
(Admit, Discharge, Transfer) message types.

Built with Electron
  `;
  
  alert(aboutContent);
}
