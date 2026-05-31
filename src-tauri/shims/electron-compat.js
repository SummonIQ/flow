/**
 * Electron Compatibility Shim for Tauri
 *
 * Maps window.electron API (Electron preload bridge) to Tauri invoke() calls.
 * This allows the existing Next.js app to work identically in both Electron and Tauri.
 */
(function () {
  'use strict';

  // Guard: only run in Tauri, skip if already shimmed or in real Electron
  if (window.__TAURI_ELECTRON_SHIM_LOADED__) return;
  if (window.electron && !window.__TAURI_INTERNALS__) return;

  const T = window.__TAURI_INTERNALS__;
  if (!T) return;

  window.__TAURI_ELECTRON_SHIM_LOADED__ = true;

  // ── Tauri primitives ──────────────────────────────────────────────────

  function invoke(cmd, args) {
    return T.invoke(cmd, args);
  }

  function listenSync(event, callback) {
    let unlistenFn = null;

    if (window.__TAURI__ && window.__TAURI__.event && window.__TAURI__.event.listen) {
      window.__TAURI__.event.listen(event, function (e) {
        callback(e.payload);
      }).then(function (fn) {
        unlistenFn = fn;
      }).catch(function () {});
    }

    return function () {
      if (unlistenFn) unlistenFn();
    };
  }

  // ── Build window.electron ─────────────────────────────────────────────

  window.electron = {

    // ── applications ──────────────────────────────────────────────────
    applications: {
      getAll: function () {
        return invoke('get_applications');
      },

      launch: function (projectPath, appKey, script, appPath, devPort) {
        return invoke('launch_app', {
          projectPath: projectPath,
          appKey: appKey,
          script: script || 'dev',
          appPath: appPath || null,
          devPort: typeof devPort === 'number' ? devPort : null,
        });
      },

      stop: function (projectPath, appKey, appPath, devPort) {
        return invoke('stop_app', {
          projectPath: projectPath,
          appKey: appKey,
          appPath: appPath || null,
          devPort: typeof devPort === 'number' ? devPort : null,
        });
      },

      checkPort: function (port) {
        return invoke('check_port', { port: port });
      },

      installDeps: function (workingDir) {
        return invoke('install_deps', { workingDir: workingDir });
      },

      openFolder: function (projectPath) {
        return invoke('open_folder', { path: projectPath });
      },

      openInEditor: function (projectPath) {
        return invoke('open_in_editor', { path: projectPath });
      },

      openInWindsurf: function (filePath) {
        return invoke('open_in_windsurf', { path: filePath });
      },

      openTerminal: function (projectPath) {
        return invoke('open_terminal', { path: projectPath });
      },

      onAppLog: function (callback) {
        return listenSync('app-log', callback);
      },

      onCriticalError: function (callback) {
        return listenSync('app-critical-error', callback);
      },

      onStatusChange: function (callback) {
        return listenSync('app-status', callback);
      },
    },

    // ── projects ──────────────────────────────────────────────────────
    projects: {
      getAll: function () {
        return invoke('get_projects');
      },

      getBasePath: function () {
        return invoke('get_projects_base');
      },
    },

    // ── window ────────────────────────────────────────────────────────
    window: {
      close: function () {
        invoke('window_close');
      },

      minimize: function () {
        invoke('window_minimize');
      },

      maximize: function () {
        invoke('window_maximize');
      },
    },

    // ── project (studio) ──────────────────────────────────────────────
    project: {
      save: function (projectData) {
        return invoke('save_project', {
          projectData: projectData.projectData,
          fileName: projectData.fileName,
          isNew: projectData.isNew || false,
        });
      },

      load: function (projectPath) {
        return invoke('load_project', { projectPath: projectPath });
      },

      exportCode: function (componentTree) {
        return invoke('export_code');
      },
    },

    // ── menu ──────────────────────────────────────────────────────────
    menu: {
      onAction: function (callback) {
        return listenSync('menu-action', callback);
      },
    },

    // ── studio ────────────────────────────────────────────────────────
    studio: {
      readDesign: function (payload) {
        return invoke('studio_read_design', {
          projectPath: payload.projectPath,
          appPath: payload.appPath || null,
        });
      },

      readPage: function (payload) {
        return invoke('studio_read_page', {
          projectPath: payload.projectPath,
          appPath: payload.appPath || null,
          route: payload.route || '/',
        });
      },

      writeDesign: function (payload) {
        return invoke('studio_write_design', {
          projectPath: payload.projectPath,
          appPath: payload.appPath || null,
          data: payload.data,
        });
      },

      writePage: function (payload) {
        return invoke('studio_write_page', {
          projectPath: payload.projectPath,
          appPath: payload.appPath || null,
          route: payload.route || '/',
          code: payload.code,
        });
      },
    },

    // ── webview ───────────────────────────────────────────────────────
    webview: {
      getPreloadPath: function () {
        return Promise.resolve(null);
      },
    },

    // ── upwork ────────────────────────────────────────────────────────
    upwork: {
      getCredentials: function () {
        return invoke('get_upwork_credentials');
      },
    },

    // ── generic IPC ───────────────────────────────────────────────────
    send: function (channel, data) {
      // No-op in Tauri (Electron-specific raw send)
    },

    on: function (channel, callback) {
      listenSync(channel, callback);
    },

    removeListener: function (channel, callback) {
      // Best-effort: no direct mapping; listeners are cleaned up per-registration
    },
  };

  // Mark runtime for CSS/JS feature detection
  document.documentElement.dataset.runtime = 'tauri';
  document.body && (document.body.dataset.runtime = 'tauri');

  console.log('[Flow] Tauri electron-compat shim loaded');
})();
