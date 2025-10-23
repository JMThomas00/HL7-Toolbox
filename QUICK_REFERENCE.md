# HL7 Message Creator - Quick Reference Card

## 🚀 Quick Start Commands

### First Time Setup
```bash
git clone https://github.com/JMThomas00/HL7MessageCreator-Electron.git
cd HL7MessageCreator-Electron
npm install
npm start
```

### Daily Development
```bash
npm start          # Run application
npm run dev        # Run with DevTools
```

### Building & Deploying
```bash
npm run build              # Build for current platform
npm run build:win          # Build for Windows
npm run build:mac          # Build for macOS
npm run build:linux        # Build for Linux
```

### Docker Commands
```bash
# Start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Rebuild
docker-compose up -d --build
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Mode |
|----------|--------|------|
| **Ctrl+N** | New Patient | Creator |
| **Ctrl+O** | Open Files | Editor |
| **Ctrl+S** | Save | Both |
| **Ctrl+Shift+S** | Save & Exit | Both |
| **Ctrl+R** | Switch to Creator | Both |
| **Ctrl+E** | Switch to Editor | Both |
| **Ctrl+Q** | Quit Application | Both |

---

## 📂 Important Files

| File | Purpose | When to Edit |
|------|---------|--------------|
| `data/surgical_procedures.csv` | Procedure database | Add/modify procedures |
| `data/staff.csv` | Staff database | Add/modify staff |
| `src/renderer/app.js` | Main logic | Add features |
| `src/renderer/styles.css` | Styling | Change appearance |
| `package.json` | Dependencies | Add npm packages |
| `docker-compose.yml` | Docker config | Change ports/volumes |

---

## 🔧 Common Tasks

### Add a New Procedure
1. Open `data/surgical_procedures.csv`
2. Add new line:
   ```csv
   PROC021,Procedure Name,12345,Specialty,Category,Description,Special Needs
   ```
3. Restart application
4. Procedure appears in browser

### Add a New Staff Member
1. Open `data/staff.csv`
2. Add new line:
   ```csv
   SURG007,DOE JOHN,Surgeon,General Surgery
   ```
3. Restart application
4. Use Random button to select

### Change Application Port (Docker)
1. Edit `docker-compose.yml`
2. Change `"3000:3000"` to `"YOUR_PORT:3000"`
3. Run `docker-compose up -d`

### Customize UI Colors
Edit `src/renderer/styles.css` `:root` section:
```css
:root {
  --bg-color: #1F2139;          /* Background */
  --text-color: #FFFFFF;        /* Text */
  --button-bg: #465BE7;         /* Buttons */
  /* etc. */
}
```

### Add New Field to HL7 Message
1. Update `DEFAULT_HL7_TEMPLATE` in `src/renderer/app.js`
2. Add placeholder: `{newField}`
3. Add form input in `src/renderer/index.html`
4. Add field collection in `createMessage()` function

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| `npm install` fails | `npm cache clean --force && npm install` |
| Port 3000 in use | Change port in docker-compose.yml |
| CSV not loading | Check file exists in `data/` folder |
| App won't start | Check Node.js version: `node --version` (need 18+) |
| Docker build fails | `docker system prune -a` then rebuild |
| Changes not showing | Hard refresh or restart app |

---

## 📊 Project Statistics

- **Total Files**: 15 core files
- **Lines of Code**: ~2,500 lines
- **CSV Records**: 20 procedures + 15 staff
- **Supported Platforms**: Windows, macOS, Linux
- **Docker Image Size**: ~200 MB
- **Build Time**: 3-5 minutes
- **Startup Time**: 1-2 seconds

---

## 🎯 Feature Checklist

### Phase 1 (Complete)
- [x] Creator Mode
- [x] Editor Mode
- [x] Procedure Browser
- [x] CSV Data Loading
- [x] HL7 Generation
- [x] File Save/Load
- [x] Docker Support
- [x] Dark Theme UI
- [x] Keyboard Shortcuts

### Phase 2 (Planned)
- [ ] Mirth Connect Integration
- [ ] Message Sending
- [ ] Connection Configuration
- [ ] Send Status Tracking
- [ ] Batch Processing

---

## 🔗 Useful Links

- **Electron Docs**: https://electronjs.org/docs
- **Docker Hub**: https://hub.docker.com/
- **Node.js**: https://nodejs.org/
- **HL7 Standard**: http://www.hl7.org/
- **GitHub Repo**: https://github.com/JMThomas00/HL7MessageCreator-Electron

---

## 💾 File Locations

```
Development:
  Source: ./src/
  Data: ./data/
  Build Output: ./dist/

Docker:
  Container Data: /app/data
  Host Mount: ./data
  Logs: docker-compose logs

Production Build:
  Windows: dist/HL7 Message Creator Setup.exe
  macOS: dist/HL7 Message Creator.dmg
  Linux: dist/HL7 Message Creator.AppImage
```

---

## 🎨 Color Reference

```css
Dark Blue-Gray Background: #1F2139
Near-Black Preview: #1E1E1E
Blue Titles: #465BE7
Light Blue Accents: #7DCAE3
Gray Disabled: #808080
Match Highlight: #2C3DAA
Selected Match: #465BE7
```

---

## 📝 Sample HL7 Message Format

```
MSH|^~\&|EPIC|NC||NC|20240115120000||SIU^S12|000001|P|2.5
SCH||000001|||||||60|M|^^^20240115120000
ZCS||N|ORSCH_S14||||12345^APPENDECTOMY^CPT
PID|1||000001^^^MRN^MRN||DOE^JOHN||19800101|M|DOE^JOHN^^|||||||||000001
PV1||P|NC-PERIOP^^^NC|||||||SURGERY|||||||||000001
RGS|
AIS|1||PROC001^APPENDECTOMY|20240115120000|0|M|60|M||||2
NTE|1||Surgical removal of appendix
NTE|2||Requires general anesthesia
AIG|1|||||20240115120000|0|M|60|M|||12345^SMITH JOHN^^^^^^^^^^^^^PI
AIP|1||67890^MILLER PATRICIA^^^^^^^^^^^^^PI|||||20240115120000|0|M|60|M
AIL|1||^OR1^SURGERY|||||20240115120000|0|M|60|M
```

---

## 🎓 Learning Path

If you're new to coding:

1. **Start Here**: Understand the project structure (see ARCHITECTURE.md)
2. **Learn Basics**: 
   - HTML: Structure (index.html)
   - CSS: Styling (styles.css)
   - JavaScript: Logic (app.js)
3. **Make Simple Changes**:
   - Update colors in CSS
   - Add fields to forms
   - Modify text content
4. **Advanced Topics**:
   - Electron IPC
   - Docker containers
   - Node.js file operations

---

## 📞 Getting Help

1. **Documentation**: Check README.md, SETUP_GUIDE.md
2. **Architecture**: See ARCHITECTURE.md
3. **Issues**: GitHub Issues tab
4. **Community**: Electron Discord, Stack Overflow

---

*Print this card or keep it handy for quick reference!*

**Version**: 1.0.0 | **Last Updated**: January 2024
