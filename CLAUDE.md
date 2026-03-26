# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**HL7 Toolbox** is a plugin-based Electron application for healthcare HL7 v2.5 testing and integration. The application provides a shell framework where healthcare tools are implemented as plugins that communicate via an event bus.

## Development Commands

```bash
# Development mode (with DevTools)
npm run dev

# Standard mode
npm start

# Build for production
npm run build              # Current platform
npm run build:win          # Windows
npm run build:mac          # macOS
npm run build:linux        # Linux
```

## Architecture

### High-Level Structure

```text
Electron Main Process (Node.js)
  ↓ IPC Bridge (preload.js)
Core Shell (Renderer Process)
  ├── Menu Bar (File, Edit, View, Plugins, Help)
  ├── Tab Bar (Plugin navigation)
  └── Plugin Container
       ↓
  Plugin Manager
       ├── Event Bus (inter-plugin messaging)
       ├── 7 Core Services (config, file, csv, template, notification, modal, theme)
       └── Plugins (extend BasePlugin)
```

### Directory Layout

- `src/main/` - Electron main process, IPC handlers
- `src/core/` - Shell application (renderer)
  - `services/` - Shared services (7 services)
  - `components/` - UI components (MenuBar, TabBar, etc.)
- `src/plugins/` - Plugin modules
  - `base-plugin.js` - Base class all plugins extend
  - `hl7-creator/` - HL7 message creator (3-file split: plugin.js, plugin-message.js, plugin-helpers.js)
- `data/` - CSV data files (procedures, names, staff, allergies)
- `config/` - App and plugin configuration JSON files

### Initialization Flow

1. Main process (`main.js`) creates BrowserWindow
2. Loads `core/index.html` which loads services, components, plugins
3. `app.js` initializes in order:
   - Services (ConfigService → ThemeService → FileService → CSVService → TemplateService)
   - Components (MenuBar, TabBar)
   - Plugin system (PluginManager)
4. PluginManager registers and loads plugins
5. Restores last active plugin and state

## Plugin System

### Creating a Plugin

1. **Extend BasePlugin** in `src/plugins/your-plugin/plugin.js`:

   ```javascript
   class YourPlugin extends BasePlugin {
     getPluginId() { return 'your-plugin'; }

     async initialize() {
       await super.initialize();
       // Load CSV data, initialize state
     }

     createContainer() {
       const div = document.createElement('div');
       div.innerHTML = `<!-- Your UI -->`;
       return div;
     }

     async activate() {
       await super.activate();
       // Attach event listeners
     }

     async deactivate() {
       await super.deactivate();
       // Remove event listeners
     }
   }
   window.YourPlugin = YourPlugin;
   ```

2. **Register in `src/core/app.js`** (`initializePlugins` method):
   ```javascript
   window.PluginManager.registerPlugin('your-plugin', YourPlugin, {
     id: 'your-plugin',
     name: 'Display Name',
     description: 'Brief description',
     icon: '🔧',
     version: '1.0.0'
   });
   ```

3. **Load script in `src/core/index.html`**:
   ```html
   <script src="../plugins/your-plugin/plugin.js"></script>
   ```

### Plugin Lifecycle

`initialize()` → `activate()` → `deactivate()` → `activate()` → ... → `cleanup()`

- **initialize()**: Called once when app loads. Create UI, load data.
- **activate()**: Called when tab selected. Attach event listeners.
- **deactivate()**: Called when switching tabs. Remove listeners, save state.
- **cleanup()**: Called when plugin unloaded. Full cleanup.

### Injected Services

All plugins get these services via constructor:

- `this.eventBus` - Inter-plugin messaging (emit, on, request, respond)
- `this.config` - Read/write plugin config (`getConfig`, `setConfig`)
- `this.file` - File I/O (`readFile`, `writeFile`, `saveFileDialog`, `openFileDialog`)
- `this.csv` - CSV loading/parsing (`loadCSV`, `parseCSV`)
- `this.template` - HL7 template management
- `this.notification` - Toast notifications (`success`, `error`, `warning`, `info`)
- `this.modal` - Dialogs (`alert`, `confirm`, `prompt`, `custom`, `form`)

### Menu Integration

Override `handleMenuAction(action)` to respond to File/Edit menu commands:

```javascript
handleMenuAction(action) {
  switch (action) {
    case 'new': this.onNew(); break;
    case 'open': this.onOpen(); break;
    case 'save': this.onSave(); break;
    case 'save-as': this.onSaveAs(); break;
  }
}
```

## HL7 Creator Plugin - Domain Knowledge

### HL7 v2.5 Message Structure

- **Segments**: 3-char codes (MSH, PID, SCH, etc.) - one per line
- **Fields**: Pipe-delimited `|`
- **Components**: Caret-delimited `^` (sub-fields)
- **Subcomponents**: Ampersand-delimited `&`
- **Repetitions**: Tilde-delimited `~`

### Message Types Generated

- **SIU^S12**: New appointment booking
- **SIU^S14**: Appointment modification (14 case event types)
- **SIU^S15**: Appointment cancellation
- **ADT^A01**: Patient admission (with AL1 allergy segments)

### Environment-Specific Field Placement

The application supports **US Demo** and **UCH** environments with different HL7 field placement rules:

| Field           | US Demo Location                | UCH Location              |
|-----------------|---------------------------------|---------------------------|
| Anesthesia Type | AIS.11.1                        | OBX segment               |
| Laterality      | AIS.12.1 (L/R/B/N/A letters)    | AIS.3.4 (1/2/3/4 numeric) |
| Isolations      | PV2.7 (tilde-separated)         | Multiple OBX segments     |
| ASA Score       | OBX segment                     | OBX segment               |

**Critical**: Environment selection is per-patient (not global). Message generation logic in `plugin-message.js` checks `formData.environment` to determine field placement.

### Message Generation Flow

1. Collect form data + procedures
2. Build base segments: MSH → SCH → ZCS → PID → PV1
3. Add PV2 (US Demo only, for isolations)
4. Add RGS
5. Add OBX segments (ASA, anesthesia for UCH, isolations for UCH)
6. Loop procedures → generate AIS/NTE pairs (laterality placement depends on environment)
7. Add AIL (location)
8. Add AIP segments (5 staff: surgeon, circulator, scrub, CRNA, anesthesiologist)
9. Replace placeholders
10. Generate optional ADT^A01 with AL1 segments (if allergies selected)

### State Management Pattern

```javascript
this.state = {
  patients: [],              // Patient navigation array
  currentPatientIndex: -1,
  procedures: [],            // CSV: hierarchical procedure tree
  patientNames: [],          // CSV: random name generation
  surgeonNames: [],          // CSV: surgeon selection
  staffNames: [],            // CSV: staff selection
  patientAllergies: [],      // CSV: allergy browser
  lastMRN: 999,
  additionalSurgeons: [],
  additionalStaff: [],
  selectedAllergies: []
}
```

Load CSV data in `initialize()`, update state in event handlers.

## Key Technical Details

### Security Model

- **Context Isolation**: Enabled (renderer cannot access Node.js)
- **Preload Script**: Exposes only specific APIs via `window.actiq`
- **No Node Integration**: Renderer uses IPC to request file operations

### IPC Channels

Main process handlers in `main.js`:
- `file:read`, `file:write`, `file:open-dialog`, `file:save-dialog`
- `config:read`, `config:write`
- `app:get-version`, `app:get-path`

Renderer calls via `window.actiq.invoke('channel', ...args)`

### CSV Data Files

All in `data/` directory:

- `procedures.csv` - 39KB hierarchical procedure list
- `patient_names.csv`, `surgeon_names.csv`, `staff_names.csv`
- `patient_allergies.csv` - 32 allergies for browser

Load via `CSVService.loadCSV('procedures')` - returns parsed array.

### Configuration Storage

- App settings: `config/app-settings.json`
- Plugin settings: `config/plugins/{plugin-id}.json`
- Access via `ConfigService.getAppSetting(key)` or `plugin.getConfig(key)`

## Keyboard Shortcuts

| Shortcut       | Action          |
|----------------|-----------------|
| Ctrl+N         | New             |
| Ctrl+O         | Open            |
| Ctrl+S         | Save            |
| Ctrl+Shift+S   | Save As         |
| Ctrl+Tab       | Next plugin tab |
| Ctrl+Shift+Tab | Previous plugin |
| F12            | DevTools        |

## Known Issues

**Electron Runtime**: Application may fail to start in MSYS/Git Bash environments. If `npm start` fails with "Cannot read properties of undefined (reading 'whenReady')", run from Windows CMD or PowerShell instead.

## Implementation Status

**HL7 Creator Plugin**: ✅ Complete (full feature parity with Python version)

- All environment-dependent fields (ASA, anesthesia, laterality, isolations)
- Allergies browser with modal UI
- Patient navigation (save/load/browse)
- Multi-procedure message generation
- ADT^A01 with AL1 segments
