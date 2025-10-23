# HL7 Message Creator - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface Layer                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     index.html (UI)                       │  │
│  │  ┌────────────────┐  ┌────────────────┐                  │  │
│  │  │  Creator Mode  │  │  Editor Mode   │                  │  │
│  │  │  - Patient Info│  │  - Open Files  │                  │  │
│  │  │  - Scheduling  │  │  - Navigate    │                  │  │
│  │  │  - Procedures  │  │  - Edit Fields │                  │  │
│  │  │  - Staff       │  │  - Direct Edit │                  │  │
│  │  └────────────────┘  └────────────────┘                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              app.js (Application Logic)                   │  │
│  │  - HL7 Message Generation                                 │  │
│  │  - Form Validation                                        │  │
│  │  - CSV Data Management                                    │  │
│  │  - UI State Management                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            Window Electron API (preload.js)               │  │
│  │  - Secure Bridge between Renderer and Main               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ IPC Communication
                               │
┌─────────────────────────────────────────────────────────────────┐
│                      Electron Main Process                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    main.js (Main Process)                 │  │
│  │  - Window Management                                      │  │
│  │  - IPC Handlers                                           │  │
│  │  - File System Operations                                │  │
│  │  - Menu Management                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Operating System Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  File System │  │   Dialogs    │  │   Process    │         │
│  │  - Read .hl7 │  │  - Save      │  │  Management  │         │
│  │  - Write .hl7│  │  - Open      │  │              │         │
│  │  - Read CSV  │  │  - Directory │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Creator Mode: Message Generation Flow

```
┌─────────────┐
│   User      │
│  Inputs     │
│  Form Data  │
└─────┬───────┘
      │
      ▼
┌─────────────────────┐
│   Validate Input    │
│  - Date Format      │
│  - Required Fields  │
│  - Time Format      │
└─────┬───────────────┘
      │
      ▼
┌─────────────────────┐
│  Build HL7 Message  │
│  - Template         │
│  - Replace Tokens   │
│  - Add Procedures   │
│  - Add Staff        │
└─────┬───────────────┘
      │
      ▼
┌─────────────────────┐
│   Display Preview   │
│  (message-preview)  │
└─────┬───────────────┘
      │
      ▼
┌─────────────────────┐
│   User Clicks Save  │
└─────┬───────────────┘
      │
      ▼
┌─────────────────────┐
│  IPC: saveFile()    │
└─────┬───────────────┘
      │
      ▼
┌─────────────────────┐
│  Main Process       │
│  Writes to Disk     │
└─────────────────────┘
```

### Editor Mode: File Loading Flow

```
┌─────────────┐
│   User      │
│ Clicks Open │
└─────┬───────┘
      │
      ▼
┌─────────────────────┐
│  IPC: openFiles()   │
└─────┬───────────────┘
      │
      ▼
┌─────────────────────┐
│   Main Process      │
│  Shows File Dialog  │
└─────┬───────────────┘
      │
      ▼
┌─────────────────────┐
│   Read Files        │
│  Returns Content    │
└─────┬───────────────┘
      │
      ▼
┌─────────────────────┐
│  Group by Patient   │
│  (filename pattern) │
└─────┬───────────────┘
      │
      ▼
┌─────────────────────┐
│  Display First      │
│  Message            │
└─────┬───────────────┘
      │
      ▼
┌─────────────────────┐
│  Parse HL7 Fields   │
│  Populate Editors   │
└─────────────────────┘
```

---

## File Structure Explained

```
HL7MessageCreator-Electron/
│
├── src/                          # Source code
│   │
│   ├── main/                     # Main process (Node.js)
│   │   ├── main.js               # Entry point, window management
│   │   └── preload.js            # Security bridge, exposes APIs
│   │
│   ├── renderer/                 # Renderer process (Browser)
│   │   ├── index.html            # UI structure
│   │   ├── styles.css            # Dark theme styling
│   │   └── app.js                # Business logic
│   │
│   └── shared/                   # Shared utilities (future)
│       └── constants.js          # Shared constants
│
├── data/                         # Application data
│   ├── surgical_procedures.csv   # Procedure database
│   └── staff.csv                 # Staff database
│
├── assets/                       # Application icons
│   ├── icon.png                  # Linux icon
│   ├── icon.ico                  # Windows icon
│   └── icon.icns                 # macOS icon
│
├── dist/                         # Build output (generated)
│   ├── HL7 Message Creator.exe   # Windows executable
│   ├── HL7 Message Creator.dmg   # macOS installer
│   └── HL7 Message Creator.AppImage  # Linux executable
│
├── node_modules/                 # Dependencies (generated)
│
├── Dockerfile                    # Docker container config
├── docker-compose.yml            # Docker orchestration
├── package.json                  # Project metadata & scripts
├── .gitignore                    # Git exclusions
│
└── Documentation
    ├── README.md                 # User guide
    ├── SETUP_GUIDE.md           # Setup instructions
    ├── CHANGELOG.md             # Version history
    └── PROJECT_SUMMARY.md       # This overview
```

---

## Component Communication

```
┌──────────────────────────────────────────────────────────┐
│                    Renderer Process                       │
│  (Isolated Browser Environment - No Node.js Access)      │
│                                                           │
│  ┌─────────────┐        ┌─────────────┐                 │
│  │   UI Code   │◄──────►│ Application │                 │
│  │  index.html │        │   Logic     │                 │
│  │  styles.css │        │   app.js    │                 │
│  └─────────────┘        └──────┬──────┘                 │
│                                 │                        │
│                                 ▼                        │
│                    ┌─────────────────────┐              │
│                    │  window.electronAPI │              │
│                    │  (from preload.js)  │              │
│                    └──────────┬──────────┘              │
└────────────────────────────────┼──────────────────────────┘
                                 │
                          IPC Messages
                          (Secure Bridge)
                                 │
┌────────────────────────────────┼──────────────────────────┐
│                                ▼                          │
│                    ┌─────────────────────┐               │
│                    │   IPC Handlers      │               │
│                    │  ipcMain.handle()   │               │
│                    └──────────┬──────────┘               │
│                               │                           │
│                               ▼                           │
│              ┌────────────────────────────┐              │
│              │   Node.js Operations       │              │
│              │  - File System             │              │
│              │  - Dialogs                 │              │
│              │  - OS Integration          │              │
│              └────────────────────────────┘              │
│                                                           │
│                     Main Process                          │
│              (Full Node.js Access + OS APIs)             │
└──────────────────────────────────────────────────────────┘
```

---

## Security Model

```
┌────────────────────────────────────────────────┐
│          Security Boundaries                    │
└────────────────────────────────────────────────┘

Renderer Process                Main Process
(Limited Access)                (Full Access)
     │                               │
     │  1. contextIsolation: true    │
     │     - Separates renderer      │
     │       from Node.js            │
     │                               │
     │  2. nodeIntegration: false    │
     │     - No direct Node.js       │
     │       in renderer             │
     │                               │
     ├──────────────►                │
     │   IPC Calls   │               │
     │   (Validated) │               │
     │               ▼               │
     │         ┌─────────────┐       │
     │         │  Preload    │       │
     │         │  Script     │       │
     │         │  (Bridge)   │       │
     │         └─────────────┘       │
     │                               │
     │  3. Only exposed APIs         │
     │     - openFiles()             │
     │     - saveFile()              │
     │     - loadCSV()               │
     │                               │
     └───────────────────────────────┘

Result: Renderer can't access file system directly,
        must go through controlled IPC channels
```

---

## Docker Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Docker Host                        │
│                                                       │
│  ┌────────────────────────────────────────────────┐ │
│  │         hl7-message-creator Container          │ │
│  │                                                 │ │
│  │  ┌──────────────────────────────────────────┐ │ │
│  │  │         Xvfb (Virtual Display)           │ │ │
│  │  │              :99                         │ │ │
│  │  └──────────────────────────────────────────┘ │ │
│  │                     │                         │ │
│  │                     ▼                         │ │
│  │  ┌──────────────────────────────────────────┐ │ │
│  │  │        Electron Application              │ │ │
│  │  │     (Headless Mode)                      │ │ │
│  │  └──────────────────────────────────────────┘ │ │
│  │                     │                         │ │
│  │                     ▼                         │ │
│  │  ┌──────────────────────────────────────────┐ │ │
│  │  │            /app/data                     │ │ │
│  │  │     (Volume Mount)                       │ │ │
│  │  └──────────────────────────────────────────┘ │ │
│  │                     │                         │ │
│  └─────────────────────┼─────────────────────────┘ │
│                        │                           │
│                        ▼                           │
│  ┌─────────────────────────────────────────────┐  │
│  │         Host ./data Directory               │  │
│  │    (Persistent Storage)                     │  │
│  │  - surgical_procedures.csv                  │  │
│  │  - staff.csv                                │  │
│  │  - output .hl7 files                        │  │
│  └─────────────────────────────────────────────┘  │
│                                                    │
│  Port Mapping: 3000:3000                          │
│  (Future: Web interface access)                   │
└───────────────────────────────────────────────────┘
```

---

## Phase 2: Mirth Connect Integration (Planned)

```
┌────────────────────────────────────────────────────────┐
│              Docker Network: hl7-network                │
│                                                         │
│  ┌──────────────────────────┐  ┌────────────────────┐ │
│  │  hl7-message-creator     │  │  mirth-connect     │ │
│  │                          │  │                    │ │
│  │  ┌────────────────────┐  │  │  ┌──────────────┐ │ │
│  │  │  Electron App      │  │  │  │  HTTP API    │ │ │
│  │  │                    │  │  │  │  Port 8080   │ │ │
│  │  │  [Send to Mirth]   │──┼──┼─►│              │ │ │
│  │  │  Button            │  │  │  │  Channels    │ │ │
│  │  └────────────────────┘  │  │  │  - HL7 In    │ │ │
│  │                          │  │  │  - Process   │ │ │
│  │  Port: 3000              │  │  │  - HL7 Out   │ │ │
│  └──────────────────────────┘  │  └──────────────┘ │ │
│                                │                    │ │
│                                │  TCP/IP Port 6661  │ │
│                                │  (HL7 MLLP)        │ │
│                                └────────────────────┘ │
└────────────────────────────────────────────────────────┘

Communication Options:
1. REST API (Recommended)
   - POST to http://mirth:8080/api/channels/{id}/messages
   - JSON payload with HL7 content
   
2. TCP/IP MLLP (Alternative)
   - Direct socket connection to port 6661
   - MLLP framing: <VT>message<FS><CR>
```

---

## Technology Choices Explained

| Component | Technology | Why? |
|-----------|-----------|------|
| Desktop Framework | Electron | Cross-platform, uses web tech, large ecosystem |
| Language | JavaScript | Native to Electron, async/await for file ops |
| UI | HTML/CSS | Familiar, flexible, fast development |
| CSV Parsing | Native/PapaParse | Lightweight, sufficient for data size |
| Build Tool | electron-builder | Standard, supports all platforms |
| Container | Docker | Consistent deployment, easy scaling |
| Base Image | Node 18 Alpine | Small size (~100MB), has Node.js |
| Display | Xvfb | Headless operation in Docker |

---

## Performance Considerations

### Memory Usage
- Typical: 100-150 MB RAM
- With large CSV: 200 MB RAM
- Multiple messages: Scales linearly

### File Operations
- CSV loading: < 100ms
- HL7 generation: < 50ms
- File save: < 100ms

### Startup Time
- Cold start: 1-2 seconds
- Hot start: < 1 second

### Docker Overhead
- Image size: ~200 MB
- Container RAM: 256-512 MB recommended
- CPU: Minimal (< 5% idle)

---

*This architecture is designed for maintainability, security, and future expansion.*
