# HL7 Toolbox

A plugin-based Electron application for healthcare HL7 v2.5 testing and integration workflows.

## 🚀 Features

- **Plugin Architecture**: Extensible system for adding new tools
- **HL7 Message Management**: Create, edit, and manage HL7 v2.5 messages
- **Template System**: Save and reuse message templates
- **Dark Theme**: Modern, eye-friendly interface
- **Cross-platform**: Works on Windows, macOS, and Linux

## 📦 Installation

### Prerequisites
- Node.js 18 or higher
- npm (comes with Node.js)

### Setup

```bash
# Install dependencies
npm install

# Run in development mode
npm start

# Build for production
npm run build

# Build for specific platform
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

## 🏗️ Architecture

```
hl7-toolbox/
├── src/
│   ├── main/              # Electron main process
│   │   ├── main.js        # Window management, IPC handlers
│   │   └── preload.js     # Security bridge
│   │
│   ├── core/              # Shell application
│   │   ├── index.html     # Base UI structure
│   │   ├── app.js         # App controller
│   │   ├── styles/        # CSS files
│   │   ├── components/    # UI components
│   │   └── services/      # Shared services
│   │
│   └── plugins/           # Plugin modules
│       ├── base-plugin.js # Base plugin class
│       └── [plugins]/     # Individual plugins
│
├── data/                  # Runtime data
│   └── templates/         # HL7 templates
│
└── config/                # Configuration files
    ├── app-settings.json
    └── plugins/           # Plugin configs
```

## 🔌 Plugin System

### Creating a Plugin

1. **Create plugin directory**:
```
src/plugins/my-plugin/
├── plugin.js          # Main plugin file
└── manifest.json      # Plugin metadata (optional)
```

2. **Extend BasePlugin**:

```javascript
class MyPlugin extends BasePlugin {
  constructor(services) {
    super(services);
  }

  getPluginId() {
    return 'my-plugin';
  }

  async initialize() {
    await super.initialize();
    // Your initialization code
  }

  createContainer() {
    const container = document.createElement('div');
    container.className = 'plugin-content';
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">My Plugin</div>
        </div>
        <div class="card-body">
          <!-- Your UI here -->
        </div>
      </div>
    `;
    return container;
  }

  async activate() {
    await super.activate();
    // Called when plugin tab is selected
  }

  async deactivate() {
    await super.deactivate();
    // Called when switching away from plugin
  }
}

window.MyPlugin = MyPlugin;
```

3. **Register plugin in app.js**:

```javascript
// In src/core/app.js, add to initializePlugins():
window.PluginManager.registerPlugin('my-plugin', MyPlugin, {
  id: 'my-plugin',
  name: 'My Plugin',
  description: 'Plugin description',
  icon: '🔧',
  version: '1.0.0'
});
```

4. **Load plugin script in index.html**:

```html
<script src="../plugins/my-plugin/plugin.js"></script>
```

### Plugin Lifecycle

1. **initialize()** - Called once when plugin is loaded
2. **activate()** - Called when plugin tab is clicked
3. **deactivate()** - Called when switching to another tab
4. **cleanup()** - Called when plugin is unloaded

### Available Services

Plugins have access to these services via `this.services`:

- **eventBus**: Inter-plugin communication
- **config**: Configuration management
- **file**: File operations
- **csv**: CSV data loading/parsing
- **template**: HL7 template management
- **notification**: Toast notifications
- **modal**: Dialog windows

### Plugin Communication

```javascript
// Emit event to other plugins
this.emit('my-event', { data: 'value' });

// Listen for events
this.on('other-event', (data) => {
  console.log('Received:', data);
});

// Request data from another plugin
const data = await this.eventBus.request('data:request', 5000);

// Respond to data requests
this.eventBus.respond('data:request', () => {
  return { some: 'data' };
});
```

### Configuration

```javascript
// Get plugin setting
const value = await this.getConfig('settingName', defaultValue);

// Set plugin setting
await this.setConfig('settingName', value);
```

### Menu Actions

```javascript
handleMenuAction(action) {
  switch (action) {
    case 'new':
      this.onNew();
      break;
    case 'save':
      this.onSave();
      break;
    // ... handle other actions
  }
}

async onNew() {
  // Handle New command
}

async onSave() {
  // Handle Save command
}
```

## 🎨 UI Components

### Notifications

```javascript
this.notification.success('Operation completed!');
this.notification.error('Something went wrong');
this.notification.warning('Please review');
this.notification.info('FYI');
```

### Modals

```javascript
// Confirmation
const confirmed = await this.modal.confirm('Continue?');

// Alert
await this.modal.alert('Important message');

// Prompt
const name = await this.modal.prompt('Enter your name:');

// Custom modal
await this.modal.custom('Title', '<p>HTML content</p>');
```

### Forms

```javascript
const values = await this.modal.form('User Info', [
  { name: 'username', label: 'Username', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email' }
]);

if (values) {
  console.log(values.username, values.email);
}
```

## 🛠️ Development

### Project Structure

- **main process**: Node.js with full OS access
- **renderer process**: Browser environment (isolated)
- **preload script**: Secure bridge between main and renderer

### Security Model

- Context isolation enabled
- Node integration disabled
- Only specific APIs exposed via preload

### Hot Reload

During development, changes to HTML/CSS/JS are visible after restarting with `npm start`.

### Debugging

- Open DevTools: F12 or View → Toggle DevTools
- Console API available: `window.actiq`

```javascript
// In browser console:
actiq.plugins.getAllPlugins()
actiq.events.emit('test', {data: 'value'})
actiq.config.getAppSetting('zoom')
```

## ⌨️ Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| New | Ctrl+N |
| Open | Ctrl+O |
| Save | Ctrl+S |
| Save As | Ctrl+Shift+S |
| Quit | Ctrl+Q |
| Undo | Ctrl+Z |
| Redo | Ctrl+Y |
| Zoom In | Ctrl++ |
| Zoom Out | Ctrl+- |
| Reset Zoom | Ctrl+0 |
| Next Tab | Ctrl+Tab |
| Previous Tab | Ctrl+Shift+Tab |
| DevTools | F12 |

## 📝 Configuration

### App Settings

Located in `config/app-settings.json`:

```json
{
  "theme": "dark",
  "zoom": 1.0,
  "lastActivePlugin": "hl7-creator",
  "windowSize": { "width": 1400, "height": 900 }
}
```

### Plugin Settings

Located in `config/plugins/{plugin-id}.json`:

```json
{
  "customSetting": "value",
  "anotherSetting": true
}
```

## 🐳 Docker Support

```bash
# Build image
docker build -t hl7-toolbox .

# Run container
docker run -it \
  -v $(pwd)/data:/home/user/data \
  -v $(pwd)/config:/home/user/config \
  hl7-toolbox
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your plugin or feature
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Support

For issues, questions, or contributions, please contact the development team.

---

**Version**: 1.0.0  
**Built with**: Electron, Node.js  
**For**: Healthcare HL7 Integration Testing
