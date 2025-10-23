# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-XX

### Added (Phase 1 - Initial Release)

#### Core Features
- **Creator Mode**: Full-featured HL7 message creation interface
  - Patient information input forms
  - Scheduling details with date/time validation
  - Multiple procedure support
  - Staff assignment (Surgeon, Anesthesiologist, Nurse)
  - Real-time message preview
  - Support for three message types: Scheduled (S12), Cancelled (S15), and Case Events (S14)

- **Editor Mode**: HL7 message editing capabilities
  - Open and load multiple `.hl7` files
  - Patient-based message grouping
  - Navigation between patients and messages
  - Field-based editing with preview
  - Direct edit mode for manual modifications
  - Batch editing (apply changes to all messages for a patient)

- **Procedure Management**
  - Searchable procedure browser
  - Hierarchical organization (Specialty > Category > Procedure)
  - CSV-based procedure database
  - Manual procedure entry
  - CPT code support

- **Data Management**
  - CSV import for procedures and staff
  - File save/load functionality
  - Data persistence

- **User Interface**
  - Dark theme matching original application
  - Responsive layout
  - Keyboard shortcuts for common actions
  - Menu-based navigation

#### Technical Implementation
- Electron framework for cross-platform desktop application
- Secure IPC communication between main and renderer processes
- Context isolation for security
- File system operations via secure preload script

#### Docker Support
- Dockerfile for containerized deployment
- Docker Compose configuration
- Xvfb for headless operation
- Persistent volume mounting for data
- Pre-configured network setup for future Mirth integration

#### Documentation
- Comprehensive README with usage instructions
- Detailed setup guide
- Icon creation guide
- Troubleshooting section
- Keyboard shortcuts reference

### Planned (Phase 2 - Mirth Connect Integration)

#### Features to be Added
- Direct HL7 message transmission to Mirth Connect
- Mirth Connect channel configuration
- Connection status monitoring
- Message delivery confirmation
- Batch message sending
- Docker network configuration with Mirth Connect container
- Error handling and retry logic
- Message queue management

#### Technical Enhancements
- REST API communication with Mirth Connect
- HL7 message validation before sending
- Transaction logging
- Network error handling

### Changed
- Migrated from Python/Tkinter to JavaScript/Electron
- Updated UI framework while maintaining original design
- Improved file handling with modern async/await patterns

### Migration Notes

This release represents a complete rewrite from the original Python/Tkinter application to Electron for:
- Cross-platform compatibility
- Modern web technologies
- Better maintainability
- Docker deployment capabilities
- Future web-based access potential

#### Compatibility
- Maintains 100% functional parity with original application
- Reads and writes same `.hl7` file format
- Uses same CSV data structure
- Preserves same UI layout and workflow

## Future Versions

### [2.0.0] - Planned
- Mirth Connect integration (primary feature)
- Enhanced message validation
- Message templates system
- User preferences/settings persistence

### [2.1.0] - Planned
- Message history and audit log
- Export to multiple formats (PDF, JSON)
- Advanced search in editor mode
- Custom field definitions

### [2.2.0] - Planned
- Web-based interface option
- Multi-user support
- Role-based access control
- Cloud data synchronization

### [3.0.0] - Planned
- Support for additional HL7 message types (ADT, ORM, ORU)
- HL7 v2.x version selector
- Message validation against HL7 specification
- Integration with EHR systems

---

## Version History Format

Each version entry includes:
- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements

## Release Dates

- [1.0.0] - Initial Electron release (TBD)
- Original Python version - 2023

---

*Note: This CHANGELOG will be updated with each release. For detailed commit history, see the Git repository.*
