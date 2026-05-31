use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::Mutex;
use std::collections::HashMap;
use tauri::Emitter;
use tauri::Manager;

fn projects_base() -> PathBuf {
    if let Ok(base) = std::env::var("PROJECTS_BASE") {
        if !base.is_empty() {
            return PathBuf::from(base);
        }
    }
    dirs::home_dir()
        .unwrap_or_else(|| PathBuf::from("/"))
        .join("Projects")
}

pub struct AppProcessState {
    pub processes: Mutex<HashMap<String, u32>>,
}

fn get_listening_port_owner(port: u32) -> Option<u32> {
    if cfg!(not(any(target_os = "macos", target_os = "linux"))) {
        return None;
    }
    let output = Command::new("lsof")
        .args(["-nP", &format!("-iTCP:{}", port), "-sTCP:LISTEN"])
        .output()
        .ok()?;
    let stdout = String::from_utf8_lossy(&output.stdout);
    let lines: Vec<&str> = stdout.lines().collect();
    if lines.len() < 2 {
        return None;
    }
    let parts: Vec<&str> = lines[1].split_whitespace().collect();
    parts.get(1).and_then(|s| s.parse::<u32>().ok())
}

fn scan_applications() -> Vec<serde_json::Value> {
    let base = projects_base();
    let entries = match fs::read_dir(&base) {
        Ok(e) => e,
        Err(_) => return vec![],
    };

    let mut applications = Vec::new();

    for entry in entries.flatten() {
        let name = entry.file_name().to_string_lossy().to_string();
        if name.starts_with('.') {
            continue;
        }

        let path = entry.path();
        if !fs::metadata(&path).map(|m| m.is_dir()).unwrap_or(false) {
            continue;
        }

        let config_path = path.join("applab.config.ts");
        if !config_path.exists() {
            continue;
        }

        let source = match fs::read_to_string(&config_path) {
            Ok(s) => s,
            Err(_) => continue,
        };

        // Extract project name
        let project_name = crate::project_commands::extract_name_from_source(&source)
            .unwrap_or_else(|| name.clone());

        // Extract apps array entries (simplified — look for key/name/script/port patterns)
        // For now, produce a single app entry per project if it has a dev script
        applications.push(serde_json::json!({
            "projectId": name,
            "projectName": project_name,
            "projectPath": path.to_string_lossy(),
        }));
    }

    applications
}

#[tauri::command]
pub fn get_applications() -> Vec<serde_json::Value> {
    scan_applications()
}

#[tauri::command]
pub fn launch_app(
    app: tauri::AppHandle,
    project_path: String,
    app_key: String,
    script: Option<String>,
    app_path: Option<String>,
    _dev_port: Option<u32>,
) -> serde_json::Value {
    let script = script.unwrap_or_else(|| "dev".to_string());
    let working_dir = if let Some(ref rel) = app_path {
        Path::new(&project_path).join(rel).to_string_lossy().to_string()
    } else {
        project_path.clone()
    };

    let child = Command::new("bun")
        .args(["run", &script])
        .current_dir(&working_dir)
        .spawn();

    match child {
        Ok(c) => {
            let pid = c.id();
            if let Some(state) = app.try_state::<AppProcessState>() {
                if let Ok(mut map) = state.processes.lock() {
                    map.insert(app_key.clone(), pid);
                }
            }
            let _ = app.emit("app-status", serde_json::json!({
                "appId": app_key,
                "status": "running",
                "pid": pid,
                "projectPath": project_path,
            }));
            serde_json::json!({ "success": true, "pid": pid })
        }
        Err(e) => serde_json::json!({ "success": false, "error": e.to_string() }),
    }
}

#[tauri::command]
pub fn stop_app(
    app: tauri::AppHandle,
    project_path: String,
    app_key: String,
    _app_path: Option<String>,
    dev_port: Option<u32>,
) -> serde_json::Value {
    // Try to kill by port first
    if let Some(port) = dev_port {
        if let Some(pid) = get_listening_port_owner(port) {
            unsafe {
                libc::kill(pid as i32, libc::SIGTERM);
            }
            let _ = app.emit("app-status", serde_json::json!({
                "appId": app_key,
                "status": "stopped",
                "exitCode": null,
                "projectPath": project_path,
            }));
            return serde_json::json!({ "success": true });
        }
    }

    // Fall back to tracked PID
    if let Some(state) = app.try_state::<AppProcessState>() {
        if let Ok(mut map) = state.processes.lock() {
            if let Some(pid) = map.remove(&app_key) {
                unsafe {
                    libc::kill(pid as i32, libc::SIGTERM);
                }
                let _ = app.emit("app-status", serde_json::json!({
                    "appId": app_key,
                    "status": "stopped",
                    "exitCode": null,
                    "projectPath": project_path,
                }));
                return serde_json::json!({ "success": true });
            }
        }
    }

    serde_json::json!({ "success": false, "error": "Process not found" })
}

#[tauri::command]
pub fn install_deps(working_dir: String) -> serde_json::Value {
    let result = Command::new("bun")
        .arg("install")
        .current_dir(&working_dir)
        .output();

    match result {
        Ok(output) => {
            if output.status.success() {
                serde_json::json!({ "success": true })
            } else {
                let stderr = String::from_utf8_lossy(&output.stderr).to_string();
                serde_json::json!({ "success": false, "error": stderr })
            }
        }
        Err(e) => serde_json::json!({ "success": false, "error": e.to_string() }),
    }
}
