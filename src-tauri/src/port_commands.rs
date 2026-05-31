use std::collections::HashMap;
use std::process::Command;

#[derive(serde::Serialize, Clone)]
pub struct PortStatus {
    pub listening: bool,
    pub pid: Option<u32>,
    pub command: Option<String>,
}

fn get_listening_port_owner(port: u32) -> Option<(String, Option<u32>)> {
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
    let command = parts.first()?.to_string();
    let pid = parts.get(1).and_then(|s| s.parse::<u32>().ok());

    if command.is_empty() {
        return None;
    }

    Some((command, pid))
}

#[tauri::command]
pub fn check_port(port: u32) -> PortStatus {
    match get_listening_port_owner(port) {
        Some((command, pid)) => PortStatus { listening: true, pid, command: Some(command) },
        None => PortStatus { listening: false, pid: None, command: None },
    }
}

#[tauri::command]
pub fn check_ports(ports: Vec<u32>) -> HashMap<String, PortStatus> {
    let mut result = HashMap::new();
    for port in ports {
        result.insert(port.to_string(), check_port(port));
    }
    result
}
