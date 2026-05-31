use std::fs;
use std::path::Path;

#[tauri::command]
pub fn save_project(_project_data: serde_json::Value, _file_name: Option<String>, _is_new: Option<bool>) -> serde_json::Value {
    serde_json::json!({ "success": false, "error": "save_project not yet implemented in Tauri build" })
}

#[tauri::command]
pub fn load_project(_project_path: String) -> serde_json::Value {
    serde_json::json!({ "success": false, "error": "load_project not yet implemented in Tauri build" })
}

#[tauri::command]
pub fn export_code() -> serde_json::Value {
    serde_json::json!({ "success": false, "error": "export_code not yet implemented in Tauri build" })
}

#[tauri::command]
pub fn studio_read_design(project_path: String, app_path: Option<String>) -> serde_json::Value {
    let resolved_project = match Path::new(&project_path).canonicalize() {
        Ok(p) => p,
        Err(e) => return serde_json::json!({ "success": false, "error": e.to_string() }),
    };

    let resolved_app = if let Some(ref rel) = app_path {
        if !rel.is_empty() {
            let candidate = resolved_project.join(rel);
            match candidate.canonicalize() {
                Ok(p) => p,
                Err(_) => resolved_project.clone(),
            }
        } else {
            resolved_project.clone()
        }
    } else {
        resolved_project.clone()
    };

    if !resolved_app.starts_with(&resolved_project) {
        return serde_json::json!({ "success": false, "error": "Invalid app path" });
    }

    let design_path = resolved_app.join(".applab").join("design.json");
    if !design_path.exists() {
        return serde_json::json!({ "success": true, "data": null });
    }

    match fs::read_to_string(&design_path) {
        Ok(data) => serde_json::json!({ "success": true, "data": data }),
        Err(e) => serde_json::json!({ "success": false, "error": e.to_string() }),
    }
}

#[tauri::command]
pub fn studio_read_page(project_path: String, app_path: Option<String>, route: Option<String>) -> serde_json::Value {
    let resolved_project = match Path::new(&project_path).canonicalize() {
        Ok(p) => p,
        Err(e) => return serde_json::json!({ "success": false, "error": e.to_string() }),
    };

    let resolved_app = if let Some(ref rel) = app_path {
        if !rel.is_empty() {
            resolved_project.join(rel)
        } else {
            resolved_project.clone()
        }
    } else {
        resolved_project.clone()
    };

    let route_str = route.unwrap_or_else(|| "/".to_string());
    let route_path = if route_str.starts_with('/') { route_str.clone() } else { format!("/{}", route_str) };
    let segments: Vec<&str> = route_path.split('/').filter(|s| !s.is_empty()).collect();

    if segments.iter().any(|s| s.contains("..")) {
        return serde_json::json!({ "success": false, "error": "Invalid route path" });
    }

    let src_app_dir = resolved_app.join("src").join("app");
    let app_dir = if src_app_dir.exists() { src_app_dir } else { resolved_app.join("app") };
    let mut target_dir = app_dir;
    for segment in &segments {
        target_dir = target_dir.join(segment);
    }

    for ext in &["tsx", "ts", "jsx", "js"] {
        let candidate = target_dir.join(format!("page.{}", ext));
        if candidate.exists() {
            match fs::read_to_string(&candidate) {
                Ok(data) => return serde_json::json!({
                    "success": true,
                    "data": data,
                    "path": candidate.to_string_lossy(),
                }),
                Err(e) => return serde_json::json!({ "success": false, "error": e.to_string() }),
            }
        }
    }

    serde_json::json!({ "success": true, "data": null })
}

#[tauri::command]
pub fn studio_write_design(project_path: String, app_path: Option<String>, data: String) -> serde_json::Value {
    let resolved_project = match Path::new(&project_path).canonicalize() {
        Ok(p) => p,
        Err(e) => return serde_json::json!({ "success": false, "error": e.to_string() }),
    };

    let resolved_app = if let Some(ref rel) = app_path {
        if !rel.is_empty() {
            resolved_project.join(rel)
        } else {
            resolved_project.clone()
        }
    } else {
        resolved_project.clone()
    };

    if !resolved_app.starts_with(&resolved_project) {
        return serde_json::json!({ "success": false, "error": "Invalid app path" });
    }

    let design_dir = resolved_app.join(".applab");
    if let Err(e) = fs::create_dir_all(&design_dir) {
        return serde_json::json!({ "success": false, "error": e.to_string() });
    }

    let design_path = design_dir.join("design.json");
    match fs::write(&design_path, &data) {
        Ok(_) => serde_json::json!({ "success": true, "path": design_path.to_string_lossy() }),
        Err(e) => serde_json::json!({ "success": false, "error": e.to_string() }),
    }
}

#[tauri::command]
pub fn studio_write_page(project_path: String, app_path: Option<String>, route: Option<String>, code: String) -> serde_json::Value {
    let resolved_project = match Path::new(&project_path).canonicalize() {
        Ok(p) => p,
        Err(e) => return serde_json::json!({ "success": false, "error": e.to_string() }),
    };

    let resolved_app = if let Some(ref rel) = app_path {
        if !rel.is_empty() {
            resolved_project.join(rel)
        } else {
            resolved_project.clone()
        }
    } else {
        resolved_project.clone()
    };

    if !resolved_app.starts_with(&resolved_project) {
        return serde_json::json!({ "success": false, "error": "Invalid app path" });
    }

    let route_str = route.unwrap_or_else(|| "/".to_string());
    let route_path = if route_str.starts_with('/') { route_str.clone() } else { format!("/{}", route_str) };
    let segments: Vec<&str> = route_path.split('/').filter(|s| !s.is_empty()).collect();

    if segments.iter().any(|s| s.contains("..")) {
        return serde_json::json!({ "success": false, "error": "Invalid route path" });
    }

    let src_app_dir = resolved_app.join("src").join("app");
    let app_dir = if src_app_dir.exists() { src_app_dir } else { resolved_app.join("app") };
    let mut target_dir = app_dir;
    for segment in &segments {
        target_dir = target_dir.join(segment);
    }

    if let Err(e) = fs::create_dir_all(&target_dir) {
        return serde_json::json!({ "success": false, "error": e.to_string() });
    }

    let page_path = target_dir.join("page.tsx");
    match fs::write(&page_path, &code) {
        Ok(_) => serde_json::json!({ "success": true, "path": page_path.to_string_lossy() }),
        Err(e) => serde_json::json!({ "success": false, "error": e.to_string() }),
    }
}
