const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  applications: {
    getAll: () => ipcRenderer.invoke('get-applications'),
    launch: (projectPath, appKey, script, appPath, devPort) =>
      ipcRenderer.invoke(
        'launch-app',
        projectPath,
        appKey,
        script,
        appPath,
        devPort,
      ),
    openFolder: projectPath => ipcRenderer.invoke('open-folder', projectPath),
    openInEditor: projectPath =>
      ipcRenderer.invoke('open-in-editor', projectPath),
    openInWindsurf: filePath =>
      ipcRenderer.invoke('open-in-windsurf', filePath),
    openTerminal: projectPath =>
      ipcRenderer.invoke('open-terminal', projectPath),
    onAppLog: callback => {
      const subscription = (_event, data) => callback(data);
      ipcRenderer.on('app-log', subscription);
      return () => ipcRenderer.removeListener('app-log', subscription);
    },
    onCriticalError: callback => {
      const subscription = (_event, data) => callback(data);
      ipcRenderer.on('app-critical-error', subscription);
      return () =>
        ipcRenderer.removeListener('app-critical-error', subscription);
    },
    onStatusChange: callback => {
      const subscription = (_event, data) => callback(data);
      ipcRenderer.on('app-status', subscription);
      return () => ipcRenderer.removeListener('app-status', subscription);
    },
    stop: (projectPath, appKey, appPath, devPort) =>
      ipcRenderer.invoke('stop-app', projectPath, appKey, appPath, devPort),
    checkPort: port => ipcRenderer.invoke('check-port', port),
    installDeps: workingDir => ipcRenderer.invoke('install-deps', workingDir),
  },
  projects: {
    getAll: () => ipcRenderer.invoke('get-projects'),
    getBasePath: () => ipcRenderer.invoke('get-projects-base'),
  },
  window: {
    close: () => ipcRenderer.send('window-close'),
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
  },
  project: {
    save: projectData => ipcRenderer.invoke('save-project', projectData),
    load: projectPath => ipcRenderer.invoke('load-project', projectPath),
    exportCode: componentTree =>
      ipcRenderer.invoke('export-code', componentTree),
  },
  menu: {
    onAction: callback => {
      const subscription = (_event, action) => callback(action);
      ipcRenderer.on('menu-action', subscription);
      return () => ipcRenderer.removeListener('menu-action', subscription);
    },
  },
  studio: {
    readDesign: payload => ipcRenderer.invoke('studio-read-design', payload),
    readPage: payload => ipcRenderer.invoke('studio-read-page', payload),
    writeDesign: payload => ipcRenderer.invoke('studio-write-design', payload),
    writePage: payload => ipcRenderer.invoke('studio-write-page', payload),
  },
  webview: {
    getPreloadPath: () => ipcRenderer.invoke('get-webview-preload'),
  },
  upwork: {
    getCredentials: () => ipcRenderer.invoke('get-upwork-credentials'),
  },
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  on: (channel, callback) => {
    ipcRenderer.on(channel, (_event, ...args) => callback(...args));
  },
  removeListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback);
  },
});
