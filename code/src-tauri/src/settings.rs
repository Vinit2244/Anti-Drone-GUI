use std::{error::Error, fs::File};

use super::usb_serial;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Settings {
    pub connection_settings: ConnectionSettings,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ConnectionSettings {
    pub comm_links: Vec<CommLink>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CommLink {
    pub name: String,
    pub comm_link_type: CommLinkType,
    pub auto_connect: bool,
}

#[derive(Serialize, Deserialize, Debug)]
pub enum CommLinkType {
    Serial { vid: u16, pid: u16, baud_rate: u32 },
    Tcp { url: String },
    Udp { url: String },
}

impl CommLinkType {
    pub fn to_config_str(&self) -> Option<String> {
        match self {
            Self::Serial {
                vid,
                pid,
                baud_rate,
            } => {
                let path = usb_serial::get_usb_path(*vid, *pid)?;
                Some(format!("serial:{}:{}", path, baud_rate).into())
            }
            Self::Tcp { url } => Some(format!("tcpout:{}", url).into()),
            Self::Udp { url } => Some(format!("udpout:{}", url).into()),
        }
    }
}

impl Default for Settings {
    fn default() -> Self {
        Settings {
            connection_settings: ConnectionSettings {
                comm_links: vec![CommLink {
                    name: "RFD 900x Master Multipoint".into(),
                    comm_link_type: CommLinkType::Serial {
                        vid: 1027,
                        pid: 24577,
                        baud_rate: 57600,
                    },
                    auto_connect: true,
                }],
            },
        }
    }
}

impl Settings {
    pub fn save(&self, path: &std::path::Path) -> Result<(), std::io::Error> {
        let file = File::create(path)?;
        serde_json::to_writer_pretty(file, &self)?;

        Ok(())
    }

    pub fn load(path: &std::path::Path) -> Result<Self, serde_json::Error> {
        match File::open(path) {
            Ok(file) => Ok(serde_json::from_reader(file)?),
            Err(_) => {
                let default_settings = Settings::default();
                default_settings.save(path);
                Ok(Settings::default())
            }
        }
    }
}

pub fn get_settings_path(app: tauri::AppHandle) -> Option<std::path::PathBuf> {
    let mut config_dir_path = app.path_resolver().app_config_dir()?;
    match std::fs::create_dir_all(&config_dir_path) {
        Err(_) => return None,
        _ => {}
    };
    config_dir_path.push(std::path::Path::new("settings.json"));
    Some(config_dir_path)
}

#[tauri::command]
pub async fn get_comm_links(app: tauri::AppHandle) -> Result<Vec<CommLink>, String> {
    let settings_path = match get_settings_path(app) {
        Some(p) => p,
        None => {
            return Err("Couldnt get settings path".into());
        }
    };
    match Settings::load(&settings_path) {
        Ok(settings) => Ok(settings.connection_settings.comm_links),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub async fn add_comm_link(app: tauri::AppHandle, new_comm_link: CommLink) {
    let settings_path = match get_settings_path(app) {
        Some(p) => p,
        None => {
            return;
        }
    };
    let mut settings = match Settings::load(&settings_path) {
        Ok(settings) => settings,
        Err(_) => {
            return;
        }
    };
    settings.connection_settings.comm_links.push(new_comm_link);
    settings.save(&settings_path);
}

#[tauri::command]
pub async fn update_comm_link(app: tauri::AppHandle, index: usize, new_comm_link: CommLink) {
    let settings_path = match get_settings_path(app) {
        Some(p) => p,
        None => {
            return;
        }
    };
    let mut settings = match Settings::load(&settings_path) {
        Ok(settings) => settings,
        Err(_) => {
            return;
        }
    };
    if index < settings.connection_settings.comm_links.len() {
        settings.connection_settings.comm_links[index] = new_comm_link;
    }
    settings.save(&settings_path);
}
