const {
  app,
  BrowserWindow,
  ipcMain,
  shell,
  Menu,
  dialog,
  nativeImage,
} = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');
const { pathToFileURL } = require('url');

// Set app name immediately for macOS dock - must be before app is ready
if (process.platform === 'darwin') {
  app.name = 'Flow';
}
const fs = require('fs').promises;
const { existsSync, mkdirSync, readFileSync, writeFileSync } = require('fs');
const os = require('os');
const { spawn, spawnSync } = require('child_process');

function readEnvFile(filePath) {
  try {
    if (!existsSync(filePath)) return {};
    const raw = readFileSync(filePath, 'utf-8');
    const lines = raw.split(/\r?\n/);
    const result = {};
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx <= 0) continue;
      const key = trimmed.slice(0, idx).trim();
      let value = trimmed.slice(idx + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      result[key] = value;
    }
    return result;
  } catch {
    return {};
  }
}

const envFromFile = readEnvFile(path.join(process.cwd(), '.env'));
function getUpworkCredentials() {
  const username =
    process.env.UPWORK_USERNAME || envFromFile.UPWORK_USERNAME || '';
  const password =
    process.env.UPWORK_PASSWORD || envFromFile.UPWORK_PASSWORD || '';
  return { username, password };
}

// Base directory for projects - configurable via env, falls back to ~/Projects
const PROJECTS_BASE =
  process.env.PROJECTS_BASE || path.join(os.homedir(), 'Projects');

let syncWatcherProcess = null;

function getListeningPortOwner(port) {
  if (typeof port !== 'number') return null;

  // lsof is available on macOS and most Linux distros.
  if (process.platform !== 'darwin' && process.platform !== 'linux') {
    return null;
  }

  try {
    const res = spawnSync(
      'lsof',
      ['-nP', `-iTCP:${String(port)}`, '-sTCP:LISTEN'],
      { encoding: 'utf-8' },
    );

    const stdout = typeof res.stdout === 'string' ? res.stdout : '';
    const lines = stdout
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean);

    // Expect header + at least one process line
    if (lines.length < 2) return null;

    const first = lines[1];
    const parts = first.split(/\s+/);
    const command = parts[0];
    const pidRaw = parts[1];
    const pid =
      typeof pidRaw === 'string' && /^\d+$/.test(pidRaw)
        ? Number(pidRaw)
        : null;

    if (typeof command === 'string' && command.length > 0) {
      return { command, pid };
    }

    return null;
  } catch {
    return null;
  }
}

function getProcessCommand(pid) {
  if (typeof pid !== 'number') return null;
  if (process.platform !== 'darwin' && process.platform !== 'linux')
    return null;

  try {
    const res = spawnSync('ps', ['-p', String(pid), '-o', 'command='], {
      encoding: 'utf-8',
    });
    const stdout = typeof res.stdout === 'string' ? res.stdout.trim() : '';
    return stdout.length > 0 ? stdout : null;
  } catch {
    return null;
  }
}

function getProcessCwd(pid) {
  if (typeof pid !== 'number') return null;
  if (process.platform !== 'darwin' && process.platform !== 'linux')
    return null;

  try {
    const res = spawnSync(
      'lsof',
      ['-a', '-p', String(pid), '-d', 'cwd', '-Fn'],
      { encoding: 'utf-8' },
    );

    const stdout = typeof res.stdout === 'string' ? res.stdout : '';
    const line = stdout
      .split(/\r?\n/)
      .map(l => l.trim())
      .find(l => l.startsWith('n'));

    if (!line) return null;
    const cwd = line.slice(1);
    return cwd.length > 0 ? cwd : null;
  } catch {
    return null;
  }
}

function looksLikeOwnedDevProcess(params) {
  const { commandLine, cwd, workingDir, projectPath, port } = params;

  const cmd = typeof commandLine === 'string' ? commandLine : '';
  const cmdLower = cmd.toLowerCase();
  const procCwd = typeof cwd === 'string' ? cwd : '';

  const looksLikeDevServer =
    cmdLower.includes(' next ') ||
    cmdLower.includes('/next/') ||
    cmdLower.includes(' vite ') ||
    cmdLower.includes(' astro ') ||
    cmdLower.includes(' nuxt ') ||
    cmdLower.includes(' remix ') ||
    cmdLower.includes(' svelte-kit ') ||
    cmdLower.includes(' react-scripts ') ||
    cmdLower.includes(' storybook ');

  const looksLikeRuntime =
    /\b(node|bun|bunx|npm|pnpm|yarn|deno|tsx|ts-node)\b/.test(cmdLower);

  const hasDevKeyword = /\b(dev|start|serve|preview|watch)\b/.test(cmdLower);

  const portToken = typeof port === 'number' ? String(port) : null;
  const mentionsPort =
    typeof portToken === 'string' && portToken.length > 0
      ? new RegExp(
          `(?:--port|-p|--listen|--httpport)\\s*=?\\s*${portToken}\\b|:${portToken}\\b`,
        ).test(cmdLower)
      : false;

  if (typeof workingDir === 'string' && workingDir.length > 0) {
    if (procCwd === workingDir || procCwd.startsWith(`${workingDir}/`))
      return true;
    if (cmd.includes(workingDir)) return true;
  }
  if (typeof projectPath === 'string' && projectPath.length > 0) {
    if (procCwd === projectPath || procCwd.startsWith(`${projectPath}/`))
      return true;
    if (cmd.includes(projectPath)) return true;
  }

  if (mentionsPort && (looksLikeDevServer || looksLikeRuntime || hasDevKeyword))
    return true;
  if (looksLikeRuntime && hasDevKeyword) return true;

  return false;
}

function findNodeModulesDir(startDir, stopDir) {
  try {
    const stop = typeof stopDir === 'string' ? path.resolve(stopDir) : null;
    let current = path.resolve(startDir);

    while (true) {
      const candidate = path.join(current, 'node_modules');
      if (existsSync(candidate)) return candidate;

      if (stop && current === stop) break;

      const parent = path.dirname(current);
      if (!parent || parent === current) break;
      current = parent;
    }
  } catch {
    // ignore
  }

  return null;
}

function shouldInstallDepsAtProjectRoot(projectPath) {
  if (typeof projectPath !== 'string' || projectPath.length === 0) return false;

  const rootPkgPath = path.join(projectPath, 'package.json');
  if (!existsSync(rootPkgPath)) return false;

  try {
    const raw = readFileSync(rootPkgPath, 'utf-8');
    const parsed = JSON.parse(raw);
    const workspaces = parsed?.workspaces;
    if (Array.isArray(workspaces)) return true;
    if (workspaces && Array.isArray(workspaces.packages)) return true;
    return false;
  } catch {
    return false;
  }
}

function sleepMs(ms) {
  try {
    const msInt = typeof ms === 'number' && ms > 0 ? Math.floor(ms) : 0;
    if (msInt <= 0) return;
    const sab = new SharedArrayBuffer(4);
    const ia = new Int32Array(sab);
    Atomics.wait(ia, 0, 0, msInt);
  } catch {
    // ignore
  }
}

function stopOwnedProcessByPort({ port, workingDir, projectPath }) {
  if (typeof port !== 'number') {
    return { success: false, error: 'devPort is required to stop by port' };
  }

  const owner = getListeningPortOwner(port);
  if (!owner) {
    return { success: true, message: `Port ${port} is not listening` };
  }

  const pid = typeof owner.pid === 'number' ? owner.pid : null;
  if (pid === null) {
    return {
      success: false,
      error: `Port ${port} is in use by ${owner.command}, but PID could not be determined`,
    };
  }

  const cmdLine = getProcessCommand(pid);
  const cwd = getProcessCwd(pid);
  const canKill = looksLikeOwnedDevProcess({
    commandLine: cmdLine,
    cwd,
    workingDir,
    projectPath,
    port,
  });

  if (!canKill) {
    const ownerDesc = `${owner.command} (PID ${pid})`;
    return {
      success: false,
      error: `Port ${port} is in use by ${ownerDesc}. Refusing to kill an unrecognized process.`,
    };
  }

  try {
    process.kill(pid, 'SIGTERM');
  } catch (error) {
    return {
      success: false,
      error: `Failed to stop process on port ${port}: ${error?.message || 'unknown error'}`,
    };
  }

  sleepMs(250);

  const afterTerm = getListeningPortOwner(port);
  if (afterTerm && afterTerm.pid === pid) {
    try {
      process.kill(pid, 'SIGKILL');
    } catch {
      // ignore
    }
    sleepMs(250);
  }

  const afterKill = getListeningPortOwner(port);
  if (afterKill) {
    const ownerDesc =
      typeof afterKill.pid === 'number'
        ? `${afterKill.command} (PID ${afterKill.pid})`
        : afterKill.command;
    return {
      success: false,
      error: `Port ${port} is still in use by ${ownerDesc}. Could not stop it.`,
    };
  }

  return { success: true, message: `Stopped process on port ${port}` };
}

function startSyncWatcher() {
  if (syncWatcherProcess) {
    return;
  }

  try {
    const watcherPath = path.join(__dirname, '../lib/sync/watcher.ts');

    const child = spawn('bun', ['run', watcherPath], {
      detached: true,
      stdio: 'ignore',
    });

    syncWatcherProcess = child;
    child.unref();
  } catch (error) {
    console.error('[Sync Watcher] Failed to start:', error);
  }
}

// Set app name for macOS menu bar and dock
app.setName('Flow');

// Single instance lock - prevent multiple instances from running
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  console.log('Another instance is already running. Quitting...');
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, focus our window instead
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

let mainWindow;
let isFirstShow = true;

function createFlowDockIcon() {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="55%" stop-color="#0d9488"/>
      <stop offset="100%" stop-color="#0891b2"/>
    </linearGradient>
    <linearGradient id="shine" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#86efac" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#86efac" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect x="28" y="28" width="456" height="456" rx="104" fill="url(#bg)"/>
  <rect x="28" y="28" width="456" height="44" rx="104" fill="url(#shine)"/>
  <g fill="none" stroke="#e879f9" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="176" cy="174" r="24" fill="#e879f9"/>
    <circle cx="336" cy="174" r="24" fill="#e879f9"/>
    <circle cx="256" cy="338" r="24" fill="#e879f9"/>
    <path d="M200 174h112M186 196l52 108M326 196l-52 108" stroke-width="22"/>
  </g>
</svg>`.trim();

  return nativeImage.createFromDataURL(
    `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`,
  );
}

function createWindow() {
  // Set app icon path
  const iconPath =
    process.platform === 'darwin'
      ? path.join(__dirname, 'icons/icon.icns')
      : process.platform === 'win32'
        ? path.join(__dirname, 'icons/icon.ico')
        : path.join(__dirname, 'icons/icon-512.png');

  mainWindow = new BrowserWindow({
    hasShadow: true,
    height: 900,
    icon: existsSync(iconPath) ? iconPath : undefined,
    resizable: true,
    roundedCorners: true,
    show: false, // Don't show until ready
    titleBarOverlay: false,
    titleBarStyle: 'hidden',
    transparent: true,
    width: 1400,
    ...(process.platform === 'darwin'
      ? {
          trafficLightPosition: { x: 12, y: 14 },
          vibrancy: 'under-window',
          visualEffectState: 'active',
        }
      : {}),
    webPreferences: {
      contextIsolation: true,
      enablePreferredSizeMode: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.cjs'),
      webviewTag: true,
      zoomFactor: 1.0,
      setVisualZoomLevelLimits: false,
    },
  });

  const url = isDev
    ? 'http://localhost:30140'
    : `file://${path.join(__dirname, '../.next/index.html')}`;

  mainWindow.loadURL(url);
  mainWindow.webContents.setVisualZoomLevelLimits(1, 3);

  const appOrigins = new Set([
    'http://localhost:30140',
    'http://127.0.0.1:30140',
  ]);

  function shouldOpenExternally(targetUrl) {
    if (typeof targetUrl !== 'string' || targetUrl.length === 0) return false;

    // Always allow file URLs (packaged app) to load inside the window.
    if (targetUrl.startsWith('file://')) return false;

    // Open non-http(s) URLs externally (mailto:, tel:, etc.).
    if (!/^https?:/i.test(targetUrl)) return true;

    try {
      const parsed = new URL(targetUrl);
      const origin = parsed.origin;
      return !appOrigins.has(origin);
    } catch {
      return true;
    }
  }

  // Ensure target="_blank" and window.open() use the system browser instead of spawning an in-app window.
  mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    if (shouldOpenExternally(targetUrl)) {
      shell.openExternal(targetUrl);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Ensure direct navigation to external URLs also uses the system browser.
  mainWindow.webContents.on('will-navigate', (event, targetUrl) => {
    if (shouldOpenExternally(targetUrl)) {
      event.preventDefault();
      shell.openExternal(targetUrl);
    }
  });

  // Show window when ready without stealing focus from other apps
  mainWindow.once('ready-to-show', () => {
    mainWindow.showInactive(); // Always show without stealing focus
    isFirstShow = false;
  });

  // Prevent window from focusing on hot reload in dev mode
  if (isDev) {
    let wasVisible = false;
    mainWindow.webContents.on('did-start-loading', () => {
      wasVisible = mainWindow.isVisible();
    });

    mainWindow.webContents.on('did-finish-load', () => {
      // If window was already visible (hot reload), don't steal focus
      if (wasVisible && !mainWindow.isFocused()) {
        // Do nothing, keep focus where it is
      }
    });
    // mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    isFirstShow = true; // Reset for next window creation
  });
}

function createMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    // App menu (macOS only)
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' },
            ],
          },
        ]
      : []),
    // File menu
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-action', 'new-project');
            }
          },
        },
        {
          label: 'Open Project...',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-action', 'open-project');
            }
          },
        },
        { type: 'separator' },
        {
          label: 'New Ticket',
          accelerator: 'CmdOrCtrl+Shift+N',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-action', 'new-ticket');
            }
          },
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },
    // Edit menu
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac
          ? [
              { role: 'pasteAndMatchStyle' },
              { role: 'delete' },
              { role: 'selectAll' },
            ]
          : [{ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }]),
      ],
    },
    // View menu
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    // Window menu
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac
          ? [
              { type: 'separator' },
              { role: 'front' },
              { type: 'separator' },
              { role: 'window' },
            ]
          : [{ role: 'close' }]),
      ],
    },
    // Help menu
    {
      role: 'help',
      submenu: [
        {
          label: 'Documentation',
          click: () => {
            // Open local docs route in the app
            if (mainWindow) {
              mainWindow.loadURL(
                isDev
                  ? 'http://localhost:30140/docs'
                  : `file://${path.join(__dirname, '../.next/docs/index.html')}`,
              );
            }
          },
        },
        {
          label: 'Report Issue',
          click: async () => {
            await shell.openExternal(
              'https://github.com/bright-and-early/applab/issues',
            );
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  // Set dock icon on macOS for dev mode
  if (process.platform === 'darwin' && app.dock) {
    const iconPath = path.join(__dirname, 'icons/icon.png');
    if (existsSync(iconPath)) {
      app.dock.setIcon(iconPath);
    } else {
      const generatedDockIcon = createFlowDockIcon();
      if (!generatedDockIcon.isEmpty()) {
        app.dock.setIcon(generatedDockIcon);
      }
    }
  }

  createMenu();
  // Sync watcher disabled - Flow doesn't have syncQueue model
  // startSyncWatcher();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Window control IPC handlers
ipcMain.on('window-minimize', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.on('window-maximize', () => {
  if (!mainWindow) return;
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.handle('get-webview-preload', () => {
  const preloadPath = path.join(__dirname, 'webview-preload.cjs');
  if (!existsSync(preloadPath)) return null;
  return pathToFileURL(preloadPath).toString();
});

ipcMain.handle('get-upwork-credentials', () => {
  return getUpworkCredentials();
});

ipcMain.on('window-close', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

// Helper to parse config files
async function parseConfigFile(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');

  // Clean up the code - remove imports, exports, type annotations
  let code = content
    // Remove import statements (including import type)
    .replace(
      /import\s+type\s+(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+['"][^'"]+['"]\s*;?\n?/g,
      '',
    )
    .replace(
      /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"][^'"]+['"]\s*;?\n?/g,
      '',
    )
    // Remove export default
    .replace(/export\s+default\s+/, '')
    // Remove type assertions (as const, as Type, etc)
    .replace(/\s+as\s+const\b/g, '')
    .replace(/\s+as\s+\w+/g, '')
    // Remove type annotations from variable declarations
    .replace(/const\s+(\w+)\s*:\s*[^=]+=/g, 'const $1 =')
    // Replace AppType enum references with their string values
    .replace(/AppType\.WebApp/g, "'web-app'")
    .replace(/AppType\.API/g, "'api'")
    .replace(/AppType\.DesktopApp/g, "'desktop-app'")
    .replace(/AppType\.MarketingSite/g, "'marketing-site'")
    // Remove type annotations from object properties
    .replace(/:\s*(['"])?SummonIQConfig\1/g, '')
    // Remove JSDoc comments
    .replace(/\/\*\*.*?\*\//gs, '')
    // Remove interface/type definitions
    .replace(/(?:interface|type)\s+\w+\s*=?\s*\{[^}]*\}/gs, '')
    // Clean up trailing semicolons
    .replace(/;?\s*$/, '');

  // Handle both direct objects and const declarations
  if (code.trim().startsWith('const ')) {
    code = code.replace(/const\s+\w+\s*=\s*/, 'return ');
  } else {
    code = `return ${code}`;
  }

  try {
    // Create a safe function to evaluate the config
    const fn = new Function(code);
    return fn();
  } catch (error) {
    console.error(`Error parsing config at ${filePath}:`, error);
    console.error('Generated code:', code);
    return null;
  }
}

// Projects IPC handler
ipcMain.handle('get-projects', async () => {
  try {
    const projectsDir = PROJECTS_BASE;

    // Read all directories in ~/Projects
    const entries = await fs.readdir(projectsDir, { withFileTypes: true });
    const directories = [];
    const statsByDir = new Map();

    for (const entry of entries) {
      if (entry.name.startsWith('.')) {
        continue;
      }

      if (entry.isDirectory()) {
        directories.push(entry.name);
        continue;
      }

      if (entry.isSymbolicLink()) {
        try {
          const stats = await fs.stat(path.join(projectsDir, entry.name));
          if (stats.isDirectory()) {
            directories.push(entry.name);
            statsByDir.set(entry.name, stats);
          }
        } catch {}
      }
    }

    // Process all projects
    const configuredProjects = [];
    const unconfiguredProjects = [];

    for (const dir of directories) {
      const projectPath = path.join(projectsDir, dir);
      const configPath = path.join(projectPath, 'applab.config.ts');

      // Get directory stats for creation and modification dates
      let dirStats = statsByDir.get(dir) || null;
      if (!dirStats) {
        try {
          dirStats = await fs.stat(projectPath);
        } catch (error) {
          console.error(`Error getting stats for ${projectPath}:`, error);
        }
      }

      // Use async access instead of sync existsSync to avoid caching issues
      let configExists = false;
      try {
        await fs.access(configPath);
        configExists = true;
      } catch {
        configExists = false;
      }

      if (configExists) {
        try {
          const config = await parseConfigFile(configPath);

          if (config) {
            configuredProjects.push({
              ...config,
              id: dir,
              path: projectPath,
              hasConfig: true,
              createdAt: dirStats?.birthtime || dirStats?.ctime,
              updatedAt: dirStats?.mtime,
            });
          } else {
            // Config file exists but couldn't be parsed
            unconfiguredProjects.push({
              id: dir,
              name: dir,
              description: 'No valid SummonIQ configuration found',
              path: projectPath,
              hasConfig: false,
              createdAt: dirStats?.birthtime || dirStats?.ctime,
              updatedAt: dirStats?.mtime,
            });
          }
        } catch (error) {
          console.error(`Error loading config from ${configPath}:`, error);
          unconfiguredProjects.push({
            id: dir,
            name: dir,
            description: 'Error loading configuration',
            path: projectPath,
            hasConfig: false,
            createdAt: dirStats?.birthtime || dirStats?.ctime,
            updatedAt: dirStats?.mtime,
          });
        }
      } else {
        // No config file
        unconfiguredProjects.push({
          id: dir,
          name: dir,
          description: 'No SummonIQ configuration found',
          path: projectPath,
          hasConfig: false,
          createdAt: dirStats?.birthtime || dirStats?.ctime,
          updatedAt: dirStats?.mtime,
        });
      }
    }

    // Return configured projects first, then unconfigured (will be sorted by date in the UI)
    return [...configuredProjects, ...unconfiguredProjects];
  } catch (error) {
    console.error('Error scanning for projects:', error);
    return [];
  }
});

ipcMain.handle('get-projects-base', () => {
  const homeDir = os.homedir();
  const displayPath = PROJECTS_BASE.startsWith(homeDir)
    ? PROJECTS_BASE.replace(homeDir, '~')
    : PROJECTS_BASE;

  return {
    path: PROJECTS_BASE,
    display: displayPath,
  };
});

// Applications IPC handler - returns apps derived from applab.config.ts
ipcMain.handle('get-applications', async () => {
  try {
    const projectsDir = PROJECTS_BASE;

    const entries = await fs.readdir(projectsDir, { withFileTypes: true });
    const directories = [];

    for (const entry of entries) {
      if (entry.name.startsWith('.')) {
        continue;
      }

      if (entry.isDirectory()) {
        directories.push(entry.name);
        continue;
      }

      if (entry.isSymbolicLink()) {
        try {
          const stats = await fs.stat(path.join(projectsDir, entry.name));
          if (stats.isDirectory()) {
            directories.push(entry.name);
          }
        } catch {}
      }
    }

    const applications = [];

    for (const dir of directories) {
      const projectPath = path.join(projectsDir, dir);
      const configPath = path.join(projectPath, 'applab.config.ts');

      let configExists = false;
      try {
        await fs.access(configPath);
        configExists = true;
      } catch {
        configExists = false;
      }

      if (!configExists) {
        continue;
      }

      try {
        const config = await parseConfigFile(configPath);
        if (!config || !Array.isArray(config.apps)) {
          continue;
        }

        const projectName = config.name || dir;

        for (const app of config.apps) {
          applications.push({
            projectId: dir,
            projectName,
            projectPath,
            app,
          });
        }
      } catch (error) {
        console.error(`Error loading applications from ${configPath}:`, error);
      }
    }

    return applications;
  } catch (error) {
    console.error('Error getting applications:', error);
    return [];
  }
});

// Open project in VS Code or other editor
ipcMain.handle('open-in-editor', async (event, projectPath) => {
  return new Promise(resolve => {
    try {
      // On macOS, try using 'open' command with VS Code or Cursor
      if (process.platform === 'darwin') {
        // Try VS Code first
        const child = spawn('open', ['-a', 'Visual Studio Code', projectPath], {
          detached: true,
          stdio: 'ignore',
        });

        child.on('error', error => {
          console.error('Error opening in VS Code:', error);
          // Try Cursor as fallback
          const cursorChild = spawn('open', ['-a', 'Cursor', projectPath], {
            detached: true,
            stdio: 'ignore',
          });

          cursorChild.on('error', fallbackError => {
            console.error('Error opening in Cursor:', fallbackError);
            resolve({
              success: false,
              error:
                'No supported editor found. Please install VS Code or Cursor.',
            });
          });

          cursorChild.on('spawn', () => {
            cursorChild.unref();
            resolve({ success: true, editor: 'Cursor' });
          });
        });

        child.on('spawn', () => {
          child.unref();
          resolve({ success: true, editor: 'VS Code' });
        });
      } else {
        // On other platforms, try 'code' command directly
        const child = spawn('code', [projectPath], {
          detached: true,
          stdio: 'ignore',
        });

        child.on('error', error => {
          console.error('Error opening in editor:', error);
          resolve({
            success: false,
            error:
              'VS Code CLI not found. Please install the "code" command in your PATH.',
          });
        });

        child.on('spawn', () => {
          child.unref();
          resolve({ success: true, editor: 'VS Code' });
        });
      }
    } catch (error) {
      console.error('Error opening in editor:', error);
      resolve({ success: false, error: error.message });
    }
  });
});

// Open project in Windsurf
ipcMain.handle('open-in-windsurf', async (event, filePath) => {
  try {
    // Use macOS 'open' command to open with Windsurf
    if (process.platform === 'darwin') {
      const child = spawn('open', ['-a', 'Windsurf', filePath], {
        detached: true,
        stdio: 'ignore',
      });
      child.unref();
      return { success: true };
    } else {
      // For other platforms, try the windsurf command
      const child = spawn('windsurf', [filePath], {
        detached: true,
        stdio: 'ignore',
      });
      child.unref();
      return { success: true };
    }
  } catch (error) {
    console.error('Error opening in Windsurf:', error);
    return { success: false, error: error.message };
  }
});

// Open project folder
ipcMain.handle('open-folder', async (event, projectPath) => {
  try {
    await shell.openPath(projectPath);
    return { success: true };
  } catch (error) {
    console.error('Error opening folder:', error);
    return { success: false, error: error.message };
  }
});

// Open terminal at project path
ipcMain.handle('open-terminal', async (event, projectPath) => {
  try {
    if (process.platform === 'darwin') {
      // macOS - open Terminal
      spawn('open', ['-a', 'Terminal', projectPath], {
        detached: true,
        stdio: 'ignore',
      });
    } else if (process.platform === 'win32') {
      // Windows - open Command Prompt
      spawn(
        'cmd.exe',
        ['/c', 'start', 'cmd.exe', '/K', `cd /d "${projectPath}"`],
        {
          detached: true,
          stdio: 'ignore',
        },
      );
    } else {
      // Linux - try common terminals
      spawn('gnome-terminal', ['--working-directory', projectPath], {
        detached: true,
        stdio: 'ignore',
      });
    }
    return { success: true };
  } catch (error) {
    console.error('Error opening terminal:', error);
    return { success: false, error: error.message };
  }
});

// Detect critical errors and provide suggested fixes
function detectCriticalError(text, workingDir) {
  const errorPatterns = [
    {
      pattern:
        /couldn't find the Next\.js package|Cannot find module ['"]next['"]/i,
      message: 'Next.js package not found',
      suggestion:
        'Dependencies are not installed. Run the install command in the app directory.',
      command: `cd "${workingDir}" && bun install`,
    },
    {
      pattern: /Cannot find module|Module not found/i,
      message: 'Missing dependencies',
      suggestion: 'Some packages are missing. Try installing dependencies.',
      command: `cd "${workingDir}" && bun install`,
    },
    {
      pattern: /EADDRINUSE|port.*already in use|address already in use/i,
      message: 'Port already in use',
      suggestion:
        'The port is already in use by another process. Stop the other process or change the port.',
      command: null,
    },
    {
      pattern: /ENOENT.*node_modules/i,
      message: 'node_modules not found',
      suggestion: 'Dependencies are not installed. Run the install command.',
      command: `cd "${workingDir}" && bun install`,
    },
    {
      pattern: /Turbopack build failed/i,
      message: 'Turbopack build failed',
      suggestion:
        'Check if all dependencies are installed and the Next.js configuration is correct.',
      command: `cd "${workingDir}" && bun install`,
    },
    {
      pattern: /error.*exited with code/i,
      message: 'Process exited with error',
      suggestion:
        'The dev script failed. Check the console output above for details.',
      command: null,
    },
  ];

  for (const { pattern, message, suggestion, command } of errorPatterns) {
    if (pattern.test(text)) {
      return { message, suggestion, command };
    }
  }

  return null;
}

// Launch application (run dev script)
ipcMain.handle(
  'launch-app',
  async (
    _event,
    projectPath,
    appKey,
    script = 'dev',
    appPath = null,
    devPort = null,
  ) => {
    return new Promise(resolve => {
      try {
        const normalizedDevPort =
          typeof devPort === 'number'
            ? devPort
            : typeof devPort === 'string' && /^\d+$/.test(devPort)
              ? Number(devPort)
              : null;

        // Use appPath if provided (for monorepos), otherwise use projectPath
        // But first check if this is a monorepo - if so, we must have an appPath
        // to avoid running turbo dev which starts ALL apps
        let workingDir;
        if (appPath) {
          workingDir = path.join(projectPath, appPath);
        } else {
          // Check if project root has a turbo/monorepo setup that would start all apps
          const rootPkgPath = path.join(projectPath, 'package.json');
          let isMonorepoRoot = false;
          try {
            if (existsSync(rootPkgPath)) {
              const rootPkg = JSON.parse(readFileSync(rootPkgPath, 'utf-8'));
              const devScript = rootPkg?.scripts?.dev || '';
              // Detect turbo dev or similar that starts multiple apps
              isMonorepoRoot =
                /\bturbo\b/.test(devScript) ||
                Array.isArray(rootPkg?.workspaces) ||
                (rootPkg?.workspaces &&
                  Array.isArray(rootPkg?.workspaces?.packages));
            }
          } catch {
            // ignore
          }

          if (isMonorepoRoot) {
            // Try to find the app in common locations
            const possiblePaths = [
              path.join(projectPath, 'apps', appKey),
              path.join(projectPath, 'packages', appKey),
            ];
            const foundPath = possiblePaths.find(
              p => existsSync(p) && existsSync(path.join(p, 'package.json')),
            );

            if (foundPath) {
              workingDir = foundPath;
              console.log(
                `[LAUNCH][${appKey}] Auto-detected app path:`,
                foundPath,
              );
            } else {
              console.error(
                `[LAUNCH][${appKey}] Monorepo detected but no app path provided`,
              );
              resolve({
                success: false,
                error: `This is a monorepo project. Please set a path for "${appKey}" (e.g., "apps/${appKey}") to avoid starting all apps.`,
              });
              return;
            }
          } else {
            workingDir = projectPath;
          }
        }

        console.log('[LAUNCH] Starting app:', {
          appKey,
          projectPath,
          appPath,
          workingDir,
          script,
          devPort: normalizedDevPort,
        });

        // Check if the directory exists
        if (!existsSync(workingDir)) {
          console.error(`[LAUNCH][${appKey}] Directory not found:`, workingDir);
          const configPath = path.join(projectPath, 'applab.config.ts');
          resolve({
            success: false,
            needsScaffold: true,
            workingDir,
            configPath,
            error: `App directory not found: ${appPath || projectPath}. The app needs to be scaffolded first - try editing the app and setting a path like "apps/${appKey}".`,
          });
          return;
        }

        // Check if package.json exists
        const pkgPath = path.join(workingDir, 'package.json');
        if (!existsSync(pkgPath)) {
          console.error(
            `[LAUNCH][${appKey}] No package.json found in:`,
            workingDir,
          );
          const configPath = path.join(projectPath, 'applab.config.ts');
          resolve({
            success: false,
            needsScaffold: true,
            workingDir,
            configPath,
            error: `No package.json found in ${appPath || 'project root'}. The app needs to be scaffolded first - edit the app config and set a path to create the app files.`,
          });
          return;
        }

        // Check if dependencies are installed
        const nodeModulesPath = findNodeModulesDir(workingDir, projectPath);
        if (!nodeModulesPath) {
          const installDir = shouldInstallDepsAtProjectRoot(projectPath)
            ? projectPath
            : workingDir;
          const installHint =
            installDir === projectPath
              ? 'the project root'
              : appPath || 'the project directory';
          console.log(
            `[LAUNCH][${appKey}] Dependencies not installed in:`,
            installDir,
          );
          resolve({
            success: false,
            needsInstall: true,
            workingDir: installDir,
            error: `Dependencies not installed. Run "bun install" in ${installHint} first.`,
          });
          return;
        }

        if (typeof normalizedDevPort === 'number') {
          const owner = getListeningPortOwner(normalizedDevPort);
          if (owner) {
            const pid = typeof owner.pid === 'number' ? owner.pid : null;
            const cmdLine = pid ? getProcessCommand(pid) : null;
            const cwd = pid ? getProcessCwd(pid) : null;

            const canAutoKill =
              pid !== null &&
              looksLikeOwnedDevProcess({
                commandLine: cmdLine,
                cwd,
                workingDir,
                projectPath,
                port: normalizedDevPort,
              });

            if (canAutoKill) {
              try {
                process.kill(pid, 'SIGTERM');
              } catch {
                // ignore
              }

              const afterTerm = getListeningPortOwner(normalizedDevPort);
              if (afterTerm && afterTerm.pid === pid) {
                try {
                  process.kill(pid, 'SIGKILL');
                } catch {
                  // ignore
                }
              }

              const afterKill = getListeningPortOwner(normalizedDevPort);
              if (afterKill) {
                const ownerDesc =
                  typeof afterKill.pid === 'number'
                    ? `${afterKill.command} (PID ${afterKill.pid})`
                    : afterKill.command;
                resolve({
                  success: false,
                  error: `Port ${normalizedDevPort} is already in use by ${ownerDesc}. Could not auto-stop it. Stop that process and try again.`,
                });
                return;
              }
            } else {
              const ownerDesc =
                typeof owner.pid === 'number'
                  ? `${owner.command} (PID ${owner.pid})`
                  : owner.command;
              resolve({
                success: false,
                error: `Port ${normalizedDevPort} is already in use by ${ownerDesc}. Stop that process and try again.`,
              });
              return;
            }
          }
        }

        const childEnv = {
          ...process.env,
          ...(typeof normalizedDevPort === 'number'
            ? { PORT: String(normalizedDevPort) }
            : null),
        };

        let extraArgs = [];
        let directBunArgs = null;
        if (typeof normalizedDevPort === 'number') {
          try {
            const pkgJsonRaw = require('fs').readFileSync(pkgPath, 'utf-8');
            const pkgJson = JSON.parse(pkgJsonRaw);

            const scriptText = pkgJson?.scripts?.[script];
            const deps = {
              ...(pkgJson?.dependencies ?? {}),
              ...(pkgJson?.devDependencies ?? {}),
            };

            const looksLikeNextDevInScript =
              typeof scriptText === 'string' &&
              /\bnext\s+dev\b/.test(scriptText);
            const looksLikeViteInScript =
              typeof scriptText === 'string' && /\bvite\b/.test(scriptText);
            const looksLikeAstroDevInScript =
              typeof scriptText === 'string' &&
              /\bastro\s+dev\b/.test(scriptText);
            const looksLikeCraStartInScript =
              typeof scriptText === 'string' &&
              (/\breact-scripts\s+start\b/.test(scriptText) ||
                /\bcraco\s+start\b/.test(scriptText) ||
                /\bwebpack\s+serve\b/.test(scriptText));

            const hasNext = typeof deps?.next === 'string';
            const hasVite = typeof deps?.vite === 'string';
            const hasReactScripts = typeof deps?.['react-scripts'] === 'string';

            const shouldPassPortArg =
              looksLikeNextDevInScript ||
              looksLikeViteInScript ||
              looksLikeAstroDevInScript ||
              hasNext ||
              hasVite;

            // CRA-style dev servers should use PORT env (they typically don't accept --port).
            const shouldAvoidPortArg =
              looksLikeCraStartInScript || hasReactScripts;

            if (!shouldAvoidPortArg) {
              if (looksLikeNextDevInScript) {
                const match = String(scriptText).match(/\bnext\s+dev\b(.*)$/);
                const tail =
                  match && typeof match[1] === 'string' ? match[1].trim() : '';
                const tokens = tail.length > 0 ? tail.split(/\s+/) : [];
                const filtered = [];
                for (let i = 0; i < tokens.length; i++) {
                  const token = tokens[i];
                  const isPortFlag = token === '--port' || token === '-p';
                  const isPortFlagWithEquals =
                    token.startsWith('--port=') || token.startsWith('-p=');
                  const isShortPortFlagJoined =
                    token.startsWith('-p') &&
                    token.length > 2 &&
                    /^-p\d+$/.test(token);

                  if (isPortFlag) {
                    i += 1;
                    continue;
                  }

                  if (isPortFlagWithEquals || isShortPortFlagJoined) {
                    continue;
                  }
                  filtered.push(token);
                }

                directBunArgs = [
                  'x',
                  'next',
                  'dev',
                  ...filtered,
                  '--port',
                  String(normalizedDevPort),
                ];
              } else if (shouldPassPortArg) {
                extraArgs = ['--port', String(normalizedDevPort)];
              }
            }
          } catch {
            // ignore
          }
        }

        const bunArgs =
          Array.isArray(directBunArgs) && directBunArgs.length > 0
            ? directBunArgs
            : extraArgs.length > 0
              ? ['run', script, '--', ...extraArgs]
              : ['run', script];

        console.log(`[LAUNCH][${appKey}] bun args:`, bunArgs.join(' '));

        if (mainWindow) {
          mainWindow.webContents.send('app-log', {
            appId: appKey,
            text: `$ bun ${bunArgs.join(' ')}\n`,
            type: 'stdout',
            projectId: projectPath,
          });
        }

        const child = spawn('bun', bunArgs, {
          cwd: workingDir,
          detached: true,
          shell: true,
          env: childEnv,
          stdio: ['ignore', 'pipe', 'pipe'],
        });

        // Handle spawn errors
        child.on('error', error => {
          console.error(`[LAUNCH][${appKey}] Failed to start:`, error);
          if (error.code === 'ENOENT') {
            resolve({
              success: false,
              error:
                'Bun runtime not found. Please install Bun: https://bun.sh',
            });
          } else {
            resolve({
              success: false,
              error: `Failed to start: ${error.message}`,
            });
          }
        });

        // Handle successful spawn
        child.on('spawn', () => {
          console.log(
            `[LAUNCH][${appKey}] Process spawned successfully (PID: ${child.pid})`,
          );

          // Log output for debugging
          child.stdout?.on('data', data => {
            const text = data.toString();
            console.log(`[LAUNCH][${appKey}]:`, text);
            if (mainWindow) {
              mainWindow.webContents.send('app-log', {
                appId: appKey,
                text,
                type: 'stdout',
                projectId: projectPath,
              });
            }
          });

          child.stderr?.on('data', data => {
            const text = data.toString();
            console.error(`[LAUNCH][${appKey}] ERROR:`, text);
            if (mainWindow) {
              mainWindow.webContents.send('app-log', {
                appId: appKey,
                text,
                type: 'stderr',
                projectId: projectPath,
              });
            }
          });

          child.unref();

          resolve({
            success: true,
            pid: child.pid,
            message: `${appKey} started on PID ${child.pid}`,
          });
        });

        // Handle early exit
        child.on('exit', (code, signal) => {
          if (code !== null && code !== 0) {
            console.error(`[LAUNCH][${appKey}] Exited with code ${code}`);
            // Send status update to UI when app crashes
            if (mainWindow) {
              mainWindow.webContents.send('app-status', {
                appId: appKey,
                status: 'crashed',
                exitCode: code,
                message: `App exited with code ${code}`,
                projectPath,
              });
            }
          } else {
            // Normal exit (code 0 or null for signal termination)
            if (mainWindow) {
              mainWindow.webContents.send('app-status', {
                appId: appKey,
                status: 'stopped',
                exitCode: code,
                signal,
                projectPath,
              });
            }
          }
        });
      } catch (error) {
        console.error('[LAUNCH] Error:', error);
        resolve({ success: false, error: error.message });
      }
    });
  },
);

ipcMain.handle(
  'stop-app',
  async (_event, projectPath, appKey, appPath = null, devPort = null) => {
    try {
      const normalizedDevPort =
        typeof devPort === 'number'
          ? devPort
          : typeof devPort === 'string' && /^\d+$/.test(devPort)
            ? Number(devPort)
            : null;

      const workingDir = appPath
        ? path.join(projectPath, appPath)
        : projectPath;

      const result = stopOwnedProcessByPort({
        port: normalizedDevPort,
        workingDir,
        projectPath,
      });

      if (result?.success && mainWindow) {
        mainWindow.webContents.send('app-status', {
          appId: appKey,
          status: 'stopped',
          exitCode: null,
          projectPath,
        });
      }

      return result;
    } catch (error) {
      return { success: false, error: error?.message || 'Failed to stop app' };
    }
  },
);

ipcMain.handle('check-port', async (_event, port) => {
  try {
    const normalizedPort =
      typeof port === 'number'
        ? port
        : typeof port === 'string' && /^\d+$/.test(port)
          ? Number(port)
          : null;

    if (normalizedPort === null) {
      return { listening: false, pid: null, command: null };
    }

    const owner = getListeningPortOwner(normalizedPort);
    return {
      listening: Boolean(owner),
      pid: typeof owner?.pid === 'number' ? owner.pid : null,
      command: typeof owner?.command === 'string' ? owner.command : null,
    };
  } catch {
    return { listening: false, pid: null, command: null };
  }
});

// Install dependencies for an app
ipcMain.handle('install-deps', async (_event, workingDir) => {
  return new Promise(resolve => {
    try {
      console.log('[INSTALL] Installing dependencies in:', workingDir);

      if (!existsSync(workingDir)) {
        resolve({ success: false, error: 'Directory not found' });
        return;
      }

      const child = spawn('bun', ['install', '--no-env-file'], {
        cwd: workingDir,
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let output = '';
      let errorOutput = '';

      child.stdout?.on('data', data => {
        const text = data.toString();
        output += text;
        console.log('[INSTALL]:', text);
        if (mainWindow) {
          mainWindow.webContents.send('install-log', {
            workingDir,
            text,
            type: 'stdout',
          });
        }
      });

      child.stderr?.on('data', data => {
        const text = data.toString();
        errorOutput += text;
        console.error('[INSTALL] ERROR:', text);
        if (mainWindow) {
          mainWindow.webContents.send('install-log', {
            workingDir,
            text,
            type: 'stderr',
          });
        }
      });

      child.on('exit', (code, signal) => {
        if (code === 0) {
          console.log('[INSTALL] Dependencies installed successfully');
          resolve({
            success: true,
            message: 'Dependencies installed successfully',
          });
        } else {
          console.error('[INSTALL] Failed with code:', code);
          resolve({
            success: false,
            error: `Installation failed with code ${code}`,
            output: errorOutput || output,
          });
        }
      });

      child.on('error', error => {
        console.error('[INSTALL] Error:', error);
        resolve({ success: false, error: error.message });
      });
    } catch (error) {
      console.error('[INSTALL] Error:', error);
      resolve({ success: false, error: error.message });
    }
  });
});

const defaultStudioProjectsDir = path.join(
  os.homedir(),
  'Projects',
  'applab-projects',
);

function ensureStudioProjectsDir() {
  if (!existsSync(defaultStudioProjectsDir)) {
    mkdirSync(defaultStudioProjectsDir, { recursive: true });
  }
}

ipcMain.handle('save-project', async (_event, { projectData, fileName }) => {
  try {
    ensureStudioProjectsDir();

    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Save Studio Project',
      defaultPath: path.join(defaultStudioProjectsDir, fileName),
      filters: [{ name: 'SummonIQ Project', extensions: ['applab.project'] }],
    });

    if (result.canceled || !result.filePath) {
      return { success: false, canceled: true };
    }

    writeFileSync(result.filePath, projectData, 'utf-8');
    return { success: true, filePath: result.filePath };
  } catch (error) {
    console.error('[Studio] Failed to save project:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-project', async (_event, projectPath) => {
  try {
    if (!projectPath || typeof projectPath !== 'string') {
      return { success: false, error: 'Project path is required' };
    }

    const data = readFileSync(projectPath, 'utf-8');
    return { success: true, data };
  } catch (error) {
    console.error('[Studio] Failed to load project:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('export-code', async () => {
  return { success: true, code: '' };
});

ipcMain.handle(
  'studio-read-design',
  async (_event, { projectPath, appPath }) => {
    try {
      if (!projectPath || typeof projectPath !== 'string') {
        return { success: false, error: 'Project path is required' };
      }

      const resolvedProjectPath = path.resolve(projectPath);
      const resolvedAppPath =
        typeof appPath === 'string' && appPath.length > 0
          ? path.resolve(resolvedProjectPath, appPath)
          : resolvedProjectPath;

      if (!resolvedAppPath.startsWith(resolvedProjectPath)) {
        return { success: false, error: 'Invalid app path' };
      }

      const designPath = path.join(resolvedAppPath, '.applab', 'design.json');
      if (!existsSync(designPath)) {
        return { success: true, data: null };
      }

      const data = await fs.readFile(designPath, 'utf-8');
      return { success: true, data };
    } catch (error) {
      console.error('[Studio] Failed to read design:', error);
      return { success: false, error: error.message };
    }
  },
);

ipcMain.handle(
  'studio-read-page',
  async (_event, { projectPath, appPath, route }) => {
    try {
      if (!projectPath || typeof projectPath !== 'string') {
        return { success: false, error: 'Project path is required' };
      }

      const resolvedProjectPath = path.resolve(projectPath);
      const resolvedAppPath =
        typeof appPath === 'string' && appPath.length > 0
          ? path.resolve(resolvedProjectPath, appPath)
          : resolvedProjectPath;

      if (!resolvedAppPath.startsWith(resolvedProjectPath)) {
        return { success: false, error: 'Invalid app path' };
      }

      const normalizedRoute =
        typeof route === 'string' && route.length > 0 ? route : '/';
      const routePath = normalizedRoute.startsWith('/')
        ? normalizedRoute
        : `/${normalizedRoute}`;
      const segments = routePath.split('/').filter(Boolean);

      if (segments.some(segment => segment.includes('..'))) {
        return { success: false, error: 'Invalid route path' };
      }

      const appDir = existsSync(path.join(resolvedAppPath, 'src', 'app'))
        ? path.join(resolvedAppPath, 'src', 'app')
        : path.join(resolvedAppPath, 'app');
      const targetDir = path.join(appDir, ...segments);
      const resolvedTargetDir = path.resolve(targetDir);
      if (!resolvedTargetDir.startsWith(resolvedAppPath)) {
        return { success: false, error: 'Invalid route destination' };
      }

      const candidates = [
        path.join(resolvedTargetDir, 'page.tsx'),
        path.join(resolvedTargetDir, 'page.ts'),
        path.join(resolvedTargetDir, 'page.jsx'),
        path.join(resolvedTargetDir, 'page.js'),
      ];

      const existing = candidates.find(candidate => existsSync(candidate));
      if (!existing) {
        return { success: true, data: null };
      }

      const data = await fs.readFile(existing, 'utf-8');
      return { success: true, data, path: existing };
    } catch (error) {
      console.error('[Studio] Failed to read page:', error);
      return { success: false, error: error.message };
    }
  },
);

ipcMain.handle(
  'studio-write-design',
  async (_event, { projectPath, appPath, data }) => {
    try {
      if (!projectPath || typeof projectPath !== 'string') {
        return { success: false, error: 'Project path is required' };
      }

      const resolvedProjectPath = path.resolve(projectPath);
      const resolvedAppPath =
        typeof appPath === 'string' && appPath.length > 0
          ? path.resolve(resolvedProjectPath, appPath)
          : resolvedProjectPath;

      if (!resolvedAppPath.startsWith(resolvedProjectPath)) {
        return { success: false, error: 'Invalid app path' };
      }

      const designDir = path.join(resolvedAppPath, '.applab');
      await fs.mkdir(designDir, { recursive: true });

      const designPath = path.join(designDir, 'design.json');
      await fs.writeFile(designPath, data ?? '', 'utf-8');
      return { success: true, path: designPath };
    } catch (error) {
      console.error('[Studio] Failed to write design:', error);
      return { success: false, error: error.message };
    }
  },
);

ipcMain.handle(
  'studio-write-page',
  async (_event, { projectPath, appPath, route, code }) => {
    try {
      if (!projectPath || typeof projectPath !== 'string') {
        return { success: false, error: 'Project path is required' };
      }

      if (typeof code !== 'string') {
        return { success: false, error: 'Page code is required' };
      }

      const resolvedProjectPath = path.resolve(projectPath);
      const resolvedAppPath =
        typeof appPath === 'string' && appPath.length > 0
          ? path.resolve(resolvedProjectPath, appPath)
          : resolvedProjectPath;

      if (!resolvedAppPath.startsWith(resolvedProjectPath)) {
        return { success: false, error: 'Invalid app path' };
      }

      const normalizedRoute =
        typeof route === 'string' && route.length > 0 ? route : '/';
      const routePath = normalizedRoute.startsWith('/')
        ? normalizedRoute
        : `/${normalizedRoute}`;
      const segments = routePath.split('/').filter(Boolean);

      if (segments.some(segment => segment.includes('..'))) {
        return { success: false, error: 'Invalid route path' };
      }

      const appDir = existsSync(path.join(resolvedAppPath, 'src', 'app'))
        ? path.join(resolvedAppPath, 'src', 'app')
        : path.join(resolvedAppPath, 'app');
      const targetDir = path.join(appDir, ...segments);
      const resolvedTargetDir = path.resolve(targetDir);
      if (!resolvedTargetDir.startsWith(resolvedAppPath)) {
        return { success: false, error: 'Invalid route destination' };
      }

      await fs.mkdir(resolvedTargetDir, { recursive: true });

      const targetFile = path.join(resolvedTargetDir, 'page.tsx');
      await fs.writeFile(targetFile, code, 'utf-8');
      return { success: true, path: targetFile };
    } catch (error) {
      console.error('[Studio] Failed to write page:', error);
      return { success: false, error: error.message };
    }
  },
);
