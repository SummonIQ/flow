use std::process::Command;

#[derive(serde::Serialize)]
pub struct ShellResponse {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub editor: Option<String>,
}

#[tauri::command]
pub fn open_folder(path: String) -> ShellResponse {
    let result = if cfg!(target_os = "macos") {
        Command::new("open").arg(&path).spawn()
    } else if cfg!(target_os = "windows") {
        Command::new("explorer").arg(&path).spawn()
    } else {
        Command::new("xdg-open").arg(&path).spawn()
    };

    match result {
        Ok(_) => ShellResponse { success: true, error: None, editor: None },
        Err(e) => ShellResponse { success: false, error: Some(e.to_string()), editor: None },
    }
}

#[tauri::command]
pub fn open_in_editor(path: String) -> ShellResponse {
    if cfg!(target_os = "macos") {
        // Try Cursor first, then VS Code, then Windsurf
        for app in &["Cursor", "Visual Studio Code", "Windsurf"] {
            if Command::new("open").args(["-a", app, &path]).spawn().is_ok() {
                return ShellResponse {
                    success: true,
                    error: None,
                    editor: Some(app.to_string()),
                };
            }
        }
        ShellResponse {
            success: false,
            error: Some("No supported editor found".to_string()),
            editor: None,
        }
    } else {
        // Try code CLI on other platforms
        match Command::new("code").arg(&path).spawn() {
            Ok(_) => ShellResponse { success: true, error: None, editor: Some("VS Code".to_string()) },
            Err(e) => ShellResponse { success: false, error: Some(e.to_string()), editor: None },
        }
    }
}

#[tauri::command]
pub fn open_in_windsurf(path: String) -> ShellResponse {
    let result = if cfg!(target_os = "macos") {
        Command::new("open").args(["-a", "Windsurf", &path]).spawn()
    } else {
        Command::new("windsurf").arg(&path).spawn()
    };

    match result {
        Ok(_) => ShellResponse { success: true, error: None, editor: Some("Windsurf".to_string()) },
        Err(e) => ShellResponse { success: false, error: Some(e.to_string()), editor: None },
    }
}

#[tauri::command]
pub fn open_terminal(path: String) -> ShellResponse {
    let result = if cfg!(target_os = "macos") {
        Command::new("open")
            .args(["-a", "Terminal", &path])
            .spawn()
    } else if cfg!(target_os = "windows") {
        Command::new("cmd")
            .args(["/c", "start", "cmd", "/k", &format!("cd /d {}", path)])
            .spawn()
    } else {
        Command::new("x-terminal-emulator")
            .args(["--working-directory", &path])
            .spawn()
    };

    match result {
        Ok(_) => ShellResponse { success: true, error: None, editor: None },
        Err(e) => ShellResponse { success: false, error: Some(e.to_string()), editor: None },
    }
}

#[tauri::command]
pub fn open_external(url: String) -> ShellResponse {
    let result = if cfg!(target_os = "macos") {
        Command::new("open").arg(&url).spawn()
    } else if cfg!(target_os = "windows") {
        Command::new("cmd").args(["/c", "start", &url]).spawn()
    } else {
        Command::new("xdg-open").arg(&url).spawn()
    };

    match result {
        Ok(_) => ShellResponse { success: true, error: None, editor: None },
        Err(e) => ShellResponse { success: false, error: Some(e.to_string()), editor: None },
    }
}
