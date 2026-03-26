const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('hl7toolboxAPI', {
  // File operations
  file: {
    save: (content, defaultFilename) => ipcRenderer.invoke('file:save', content, defaultFilename),
    open: (options) => ipcRenderer.invoke('file:open', options),
    read: (filePath) => ipcRenderer.invoke('file:read', filePath),
    write: (filePath, content) => ipcRenderer.invoke('file:write', filePath, content)
  },

  // Config operations
  config: {
    read: (configName) => ipcRenderer.invoke('config:read', configName),
    write: (configName, data) => ipcRenderer.invoke('config:write', configName, data)
  },

  // CSV operations
  csv: {
    load: (filename) => ipcRenderer.invoke('csv:load', filename)
  },

  // Template operations
  template: {
    list: () => ipcRenderer.invoke('template:list'),
    read: (filename) => ipcRenderer.invoke('template:read', filename),
    write: (filename, data) => ipcRenderer.invoke('template:write', filename, data),
    delete: (filename) => ipcRenderer.invoke('template:delete', filename)
  },

  // Directory operations
  dir: {
    select: () => ipcRenderer.invoke('dir:select')
  }
});
