const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Dialog APIs
  openFiles: () => ipcRenderer.invoke('dialog:openFiles'),
  saveFile: (defaultPath, content) => ipcRenderer.invoke('dialog:saveFile', { defaultPath, content }),
  selectDirectory: () => ipcRenderer.invoke('dialog:selectDirectory'),
  
  // File system APIs
  readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('fs:writeFile', { filePath, content }),
  readDirectory: (dirPath) => ipcRenderer.invoke('fs:readDirectory', dirPath),
  
  // Data APIs
  loadCSV: (fileName) => ipcRenderer.invoke('data:loadCSV', fileName)
});
