const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let mainWindow;

// Create the main application window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    backgroundColor: '#1F2139',
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, '../core/index.html'));

  // Show window when ready to avoid flicker
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development mode
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers

// File operations
ipcMain.handle('file:save', async (event, content, defaultFilename) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: defaultFilename,
      filters: [
        { name: 'HL7 Files', extensions: ['hl7'] },
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (result.canceled) {
      return { success: false, canceled: true };
    }

    await fs.writeFile(result.filePath, content, 'utf8');
    return { success: true, path: result.filePath };
  } catch (error) {
    console.error('Error saving file:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('file:open', async (event, options = {}) => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile', 'multiSelections'],
      filters: options.filters || [
        { name: 'HL7 Files', extensions: ['hl7'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (result.canceled) {
      return { success: false, canceled: true };
    }

    const files = await Promise.all(
      result.filePaths.map(async (filePath) => {
        const content = await fs.readFile(filePath, 'utf8');
        return {
          name: path.basename(filePath),
          path: filePath,
          content: content
        };
      })
    );

    return { success: true, files };
  } catch (error) {
    console.error('Error opening files:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('file:read', async (event, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return { success: true, content };
  } catch (error) {
    console.error('Error reading file:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('file:write', async (event, filePath, content) => {
  try {
    await fs.writeFile(filePath, content, 'utf8');
    return { success: true };
  } catch (error) {
    console.error('Error writing file:', error);
    return { success: false, error: error.message };
  }
});

// Config operations
ipcMain.handle('config:read', async (event, configName) => {
  try {
    const configPath = path.join(__dirname, '../../config', configName);
    const content = await fs.readFile(configPath, 'utf8');
    return { success: true, data: JSON.parse(content) };
  } catch (error) {
    // Return empty config if file doesn't exist
    if (error.code === 'ENOENT') {
      return { success: true, data: {} };
    }
    console.error('Error reading config:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('config:write', async (event, configName, data) => {
  try {
    const configPath = path.join(__dirname, '../../config', configName);
    await fs.writeFile(configPath, JSON.stringify(data, null, 2), 'utf8');
    return { success: true };
  } catch (error) {
    console.error('Error writing config:', error);
    return { success: false, error: error.message };
  }
});

// CSV operations
ipcMain.handle('csv:load', async (event, filename) => {
  try {
    const csvPath = path.join(__dirname, '../../data', filename);
    const content = await fs.readFile(csvPath, 'utf8');
    return { success: true, content };
  } catch (error) {
    console.error('Error loading CSV:', error);
    return { success: false, error: error.message };
  }
});

// Template operations
ipcMain.handle('template:list', async () => {
  try {
    const templatesDir = path.join(__dirname, '../../data/templates');
    const files = await fs.readdir(templatesDir);
    const templates = files.filter(f => f.endsWith('.json'));
    return { success: true, templates };
  } catch (error) {
    console.error('Error listing templates:', error);
    return { success: true, templates: [] }; // Return empty array if directory doesn't exist
  }
});

ipcMain.handle('template:read', async (event, filename) => {
  try {
    const templatePath = path.join(__dirname, '../../data/templates', filename);
    const content = await fs.readFile(templatePath, 'utf8');
    return { success: true, data: JSON.parse(content) };
  } catch (error) {
    console.error('Error reading template:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('template:write', async (event, filename, data) => {
  try {
    const templatePath = path.join(__dirname, '../../data/templates', filename);
    await fs.writeFile(templatePath, JSON.stringify(data, null, 2), 'utf8');
    return { success: true };
  } catch (error) {
    console.error('Error writing template:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('template:delete', async (event, filename) => {
  try {
    const templatePath = path.join(__dirname, '../../data/templates', filename);
    await fs.unlink(templatePath);
    return { success: true };
  } catch (error) {
    console.error('Error deleting template:', error);
    return { success: false, error: error.message };
  }
});

// Directory operations
ipcMain.handle('dir:select', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    });

    if (result.canceled) {
      return { success: false, canceled: true };
    }

    return { success: true, path: result.filePaths[0] };
  } catch (error) {
    console.error('Error selecting directory:', error);
    return { success: false, error: error.message };
  }
});
