# HL7-Toolbox

A desktop application for creating and editing healthcare HL7 messages, built with Electron.

## Overview

The HL7-Toolbox is a cross-platform desktop GUI application designed for healthcare IT professionals who need to generate and modify standardized HL7 messages for scheduling surgical procedures (SIU) and managing patient data (ADT).

## Features

### Creator Mode
- Create new HL7 SIU (Scheduling Information Unsolicited) messages
- Support for multiple message types: Scheduled, Cancelled, and Case Events
- Patient information management
- Procedure browser with search functionality
- Staff assignment (Surgeon, Anesthesiologist, Nurse)
- Random data generation for testing
- Real-time message preview

### Editor Mode
- Open and edit existing `.hl7` files
- Navigate between multiple patients and messages
- Field-based editing with instant preview
- Direct edit mode for manual message modification
- Batch editing capabilities (apply changes to all messages for a patient)

## Installation

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Local Development Setup

1. Clone the repository:
```bash
git clone https://github.com/JMThomas00/HL7MessageCreator-Electron.git
cd HL7MessageCreator-Electron
```

2. Install dependencies:
```bash
npm install
```

3. Run in development mode:
```bash
npm start
```

### Building the Application

Build for your current platform:
```bash
npm run build
```

Build for specific platforms:
```bash
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

## Docker Deployment

### Building the Docker Image

```bash
docker build -t hl7-message-creator .
```

Or using docker-compose:
```bash
docker-compose build
```

### Running with Docker

```bash
docker run -p 3000:3000 -v $(pwd)/data:/app/data hl7-message-creator
```

Or using docker-compose:
```bash
docker-compose up
```

The application will be available with persistent data storage in the `./data` directory.

### Docker Configuration

The Docker setup includes:
- Node.js 18 Alpine base image
- Xvfb for headless operation
- Persistent volume mount for data files
- Port 3000 exposed for future web interface integration

## Usage

### Creator Mode

1. **Switch to Creator Mode**: View > Creator (Ctrl+R)
2. **Enter Patient Information**: Fill in required fields (MRN, Name, DOB, etc.)
3. **Add Scheduling Details**: Set date, time, duration, and location
4. **Add Procedures**: 
   - Click "Add Procedure" or
   - Use the Procedure Browser to search and select procedures
5. **Assign Staff**: Enter or randomly select surgeon, anesthesiologist, and nurse
6. **Generate Message**: Click "Create Message" to generate the HL7 message
7. **Save**: File > Save (Ctrl+S)

### Editor Mode

1. **Switch to Editor Mode**: View > Editor (Ctrl+E)
2. **Open Files**: File > Open File(s) (Ctrl+O)
3. **Navigate**: Use navigation buttons to move between patients and messages
4. **Edit Fields**: 
   - Modify fields in the left panel
   - Click "Apply to Current" or "Apply to All"
5. **Direct Edit** (Advanced): 
   - Click "Direct Edit" to manually edit the HL7 message
   - Make changes in the preview area
   - Click "Direct Edit" again to save
6. **Save Changes**: File > Save (Ctrl+S)

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+N | New Patient (Creator mode) |
| Ctrl+O | Open Files (Editor mode) |
| Ctrl+S | Save |
| Ctrl+Shift+S | Save & Exit |
| Ctrl+R | Switch to Creator mode |
| Ctrl+E | Switch to Editor mode |
| Ctrl+Q | Quit |

## Data Files

The application uses CSV files for procedure and staff data:

- `data/surgical_procedures.csv`: Database of surgical procedures with CPT codes
- `data/staff.csv`: Database of medical staff members

You can modify these files to customize the available procedures and staff for your organization.

## Project Structure

```
HL7MessageCreator-Electron/
├── src/
│   ├── main/
│   │   ├── main.js          # Electron main process
│   │   └── preload.js       # Preload script (security bridge)
│   └── renderer/
│       ├── index.html       # Main UI
│       ├── styles.css       # Styling
│       └── app.js           # Application logic
├── data/
│   ├── surgical_procedures.csv
│   └── staff.csv
├── assets/                   # Application icons
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

## Future Enhancements

### Phase 2: Mirth Connect Integration

The next phase of development will include:

1. **Direct Message Sending**: Push HL7 messages directly to Mirth Connect channels
2. **Channel Configuration**: Configure target Mirth Connect instances
3. **Message Tracking**: Track sent messages and responses
4. **Batch Processing**: Send multiple messages in sequence
5. **Docker Networking**: Pre-configured docker-compose setup with Mirth Connect

To enable Mirth Connect integration:

1. Uncomment the Mirth service in `docker-compose.yml`
2. Configure the Mirth Connect connection in the application settings
3. Use the "Send to Mirth" button in the application

## Troubleshooting

### Application won't start
- Ensure Node.js 18+ is installed
- Delete `node_modules` and run `npm install` again
- Check console for error messages

### CSV files not loading
- Verify CSV files exist in the `data/` directory
- Check file permissions
- Ensure CSV format matches expected structure

### Docker issues
- Ensure Docker is running
- Check port 3000 is not in use
- Verify volume mounts are correct

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/JMThomas00/HL7-Toolbox)

## Acknowledgments

This is an Electron conversion of the original Python/Tkinter HL7MessageCreator application.
