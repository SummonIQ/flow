use regex::Regex;
use std::fs;
use std::path::{Path, PathBuf};

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

/// Extract a string property value from a TypeScript/JS config source
pub fn extract_name_from_source(source: &str) -> Option<String> {
    extract_string_property(source, "name")
}

fn extract_string_property(source: &str, key: &str) -> Option<String> {
    let pattern = format!(r"{}[\s]*:[\s]*", regex::escape(key));
    let re = Regex::new(&pattern).ok()?;
    let m = re.find(source)?;
    let rest = &source[m.end()..];

    let first_char = rest.chars().next()?;
    if first_char != '"' && first_char != '\'' && first_char != '`' {
        return None;
    }
    let quote = first_char;
    let mut value = String::new();
    let mut escaped = false;
    for ch in rest[1..].chars() {
        if escaped {
            value.push(ch);
            escaped = false;
            continue;
        }
        if ch == '\\' {
            escaped = true;
            continue;
        }
        if ch == quote {
            break;
        }
        value.push(ch);
    }
    if value.is_empty() {
        None
    } else {
        Some(value)
    }
}

fn scan_project(dir_name: &str, project_path: &Path) -> serde_json::Value {
    let config_path = project_path.join("applab.config.ts");
    let metadata = fs::metadata(project_path).ok();

    let created_at = metadata.as_ref()
        .and_then(|m| m.created().ok())
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_secs());

    let updated_at = metadata.as_ref()
        .and_then(|m| m.modified().ok())
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_secs());

    if config_path.exists() {
        if let Ok(source) = fs::read_to_string(&config_path) {
            let name = extract_string_property(&source, "name")
                .unwrap_or_else(|| dir_name.to_string());
            let description = extract_string_property(&source, "description")
                .unwrap_or_default();

            return serde_json::json!({
                "id": dir_name,
                "name": name,
                "description": description,
                "path": project_path.to_string_lossy(),
                "hasConfig": true,
                "createdAt": created_at,
                "updatedAt": updated_at,
            });
        }
    }

    serde_json::json!({
        "id": dir_name,
        "name": dir_name,
        "description": "No SummonIQ configuration found",
        "path": project_path.to_string_lossy(),
        "hasConfig": false,
        "createdAt": created_at,
        "updatedAt": updated_at,
    })
}

#[tauri::command]
pub fn get_projects() -> Vec<serde_json::Value> {
    let base = projects_base();
    let entries = match fs::read_dir(&base) {
        Ok(e) => e,
        Err(_) => return vec![],
    };

    let mut configured = Vec::new();
    let mut unconfigured = Vec::new();

    for entry in entries.flatten() {
        let name = entry.file_name().to_string_lossy().to_string();
        if name.starts_with('.') {
            continue;
        }

        let path = entry.path();
        let is_dir = entry.file_type()
            .map(|t| t.is_dir() || t.is_symlink())
            .unwrap_or(false);

        if !is_dir {
            continue;
        }

        // Follow symlinks
        let real_path = fs::metadata(&path)
            .map(|m| m.is_dir())
            .unwrap_or(false);

        if !real_path && entry.file_type().map(|t| t.is_symlink()).unwrap_or(false) {
            continue;
        }

        let project = scan_project(&name, &path);
        if project["hasConfig"].as_bool().unwrap_or(false) {
            configured.push(project);
        } else {
            unconfigured.push(project);
        }
    }

    configured.extend(unconfigured);
    configured
}

#[tauri::command]
pub fn get_projects_base() -> serde_json::Value {
    let base = projects_base();
    let base_str = base.to_string_lossy().to_string();

    let display = if let Some(home) = dirs::home_dir() {
        let home_str = home.to_string_lossy().to_string();
        if base_str.starts_with(&home_str) {
            base_str.replacen(&home_str, "~", 1)
        } else {
            base_str.clone()
        }
    } else {
        base_str.clone()
    };

    serde_json::json!({ "path": base_str, "display": display })
}
