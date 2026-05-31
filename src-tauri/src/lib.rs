mod application_commands;
mod port_commands;
mod project_commands;
mod shell_commands;
mod studio_commands;
mod window_commands;

use std::collections::HashMap;
use std::sync::Mutex;
use tauri::{Emitter, Manager};

pub use application_commands::AppProcessState;

#[tauri::command]
fn get_webview_preload() -> Option<String> {
    // Webview preload is Electron-specific; not applicable in Tauri
    None
}

#[tauri::command]
fn get_upwork_credentials() -> serde_json::Value {
    // Read from environment or .env file in cwd
    let username = std::env::var("UPWORK_USERNAME").unwrap_or_default();
    let password = std::env::var("UPWORK_PASSWORD").unwrap_or_default();
    serde_json::json!({ "username": username, "password": password })
}

// ── App setup ──────────────────────────────────────────────────────────

pub fn run() {
    let electron_shim = include_str!("../shims/electron-compat.js");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .manage(AppProcessState {
            processes: Mutex::new(HashMap::new()),
        })
        .setup(move |app| {
            // Inject the electron compatibility shim into the main window
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.eval(electron_shim);
            }

            setup_menu(app)?;
            Ok(())
        })
        .on_page_load(move |webview, _payload| {
            // Re-inject shim on every page navigation (SPA + hard reloads)
            let shim = include_str!("../shims/electron-compat.js");
            let _ = webview.eval(shim);
        })
        .invoke_handler(tauri::generate_handler![
            // Window
            window_commands::window_close,
            window_commands::window_minimize,
            window_commands::window_maximize,
            // Shell
            shell_commands::open_folder,
            shell_commands::open_in_editor,
            shell_commands::open_in_windsurf,
            shell_commands::open_terminal,
            shell_commands::open_external,
            // Ports
            port_commands::check_port,
            port_commands::check_ports,
            // Projects
            project_commands::get_projects,
            project_commands::get_projects_base,
            // Applications
            application_commands::get_applications,
            application_commands::launch_app,
            application_commands::stop_app,
            application_commands::install_deps,
            // Studio / project files
            studio_commands::save_project,
            studio_commands::load_project,
            studio_commands::export_code,
            studio_commands::studio_read_design,
            studio_commands::studio_read_page,
            studio_commands::studio_write_design,
            studio_commands::studio_write_page,
            // Misc
            get_webview_preload,
            get_upwork_credentials,
        ])
        .run(tauri::generate_context!())
        .expect("error while running SummonIQ Flow");
}

fn setup_menu(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    use tauri::menu::{MenuBuilder, MenuItemBuilder, SubmenuBuilder};

    let new_project = MenuItemBuilder::with_id("new-project", "New Project")
        .accelerator("CmdOrCtrl+N")
        .build(app)?;
    let open_project = MenuItemBuilder::with_id("open-project", "Open Project...")
        .accelerator("CmdOrCtrl+O")
        .build(app)?;
    let new_ticket = MenuItemBuilder::with_id("new-ticket", "New Ticket")
        .accelerator("CmdOrCtrl+Shift+N")
        .build(app)?;

    let file_menu = SubmenuBuilder::new(app, "File")
        .item(&new_project)
        .item(&open_project)
        .separator()
        .item(&new_ticket)
        .separator()
        .close_window()
        .build()?;

    let edit_menu = SubmenuBuilder::new(app, "Edit")
        .undo()
        .redo()
        .separator()
        .cut()
        .copy()
        .paste()
        .select_all()
        .build()?;

    let view_menu = SubmenuBuilder::new(app, "View")
        .fullscreen()
        .build()?;

    let window_menu = SubmenuBuilder::new(app, "Window")
        .minimize()
        .build()?;

    let menu = MenuBuilder::new(app)
        .item(&file_menu)
        .item(&edit_menu)
        .item(&view_menu)
        .item(&window_menu)
        .build()?;

    app.set_menu(menu)?;

    app.on_menu_event(move |app_handle, event| {
        if let Some(window) = app_handle.get_webview_window("main") {
            let action = event.id().0.as_str();
            let _ = window.emit("menu-action", action);
        }
    });

    Ok(())
}
