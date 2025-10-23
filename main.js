const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1770,
    height: 1232,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#1F2139',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../../assets/icon.png')
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Open DevTools in development
  if (process.argv.includes('--inspect')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers for file operations
ipcMain.handle('dialog:openFiles', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'HL7 Files', extensions: ['hl7'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  if (canceled) {
    return null;
  }
  
  // Read all selected files
  const files = await Promise.all(
    filePaths.map(async (filePath) => {
      const content = await fs.readFile(filePath, 'utf-8');
      return {
        path: filePath,
        name: path.basename(filePath),
        content: content
      };
    })
  );
  
  return files;
});

ipcMain.handle('dialog:saveFile', async (event, { defaultPath, content }) => {
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultPath,
    filters: [
      { name: 'HL7 Files', extensions: ['hl7'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  if (canceled || !filePath) {
    return null;
  }
  
  await fs.writeFile(filePath, content, 'utf-8');
  return filePath;
});

ipcMain.handle('dialog:selectDirectory', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  
  if (canceled || filePaths.length === 0) {
    return null;
  }
  
  return filePaths[0];
});

ipcMain.handle('fs:readFile', async (event, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return { success: true, content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('fs:writeFile', async (event, { filePath, content }) => {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('fs:readDirectory', async (event, dirPath) => {
  try {
    const files = await fs.readdir(dirPath);
    const hl7Files = files.filter(file => file.endsWith('.hl7'));
    return { success: true, files: hl7Files };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// CSV data loading
ipcMain.handle('data:loadCSV', async (event, fileName) => {
  try {
    const csvPath = path.join(__dirname, '../../data', fileName);
    const content = await fs.readFile(csvPath, 'utf-8');
    return { success: true, content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
