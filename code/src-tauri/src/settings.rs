use rusqlite::{params, Connection, Error, Result};
use serde::{Deserialize, Serialize};
use tauri::AppHandle;

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
            CommLinkType::Serial {
                vid,
                pid,
                baud_rate,
            } => Some(format!("serial://{}:{}@{}", vid, pid, baud_rate)),
            CommLinkType::Tcp { url } => Some(format!("tcp://{}", url)),
            CommLinkType::Udp { url } => Some(format!("udp://{}", url)),
        }
    }
}

pub fn create_table(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS comm_links (
            id INTEGER PRIMARY KEY,
            name TEXT,
            comm_link_type TEXT,
            auto_connect INTEGER
        )",
        [],
    )?;
    Ok(())
}

impl Settings {
    pub fn save(conn: &Connection, settings: &Settings) -> Result<(), Error> {
        // conn.execute("DELETE FROM comm_links", [])?;
        for comm_link in &settings.connection_settings.comm_links {
            println!("Saving comm link: {:?}", comm_link);
            conn.execute(
                "INSERT INTO comm_links (name, comm_link_type, auto_connect) VALUES (?1, ?2, ?3)",
                params![
                    comm_link.name,
                    serde_json::to_string(&comm_link.comm_link_type).unwrap(),
                    comm_link.auto_connect as i32
                ],
            )?;
        }
        Ok(())
    }

    pub fn load(conn: &Connection) -> Result<Self, Error> {
        let mut stmt = conn.prepare("SELECT name, comm_link_type, auto_connect FROM comm_links")?;
        let rows = stmt.query_map([], |row| {
            let name: String = row.get(0)?;
            let comm_link_type_str: String = row.get(1)?;
            let auto_connect: i32 = row.get(2)?;

            let comm_link_type: CommLinkType = match serde_json::from_str(&comm_link_type_str) {
                Ok(value) => value,
                Err(err) => {
                    return Err(Error::ToSqlConversionFailure(Box::new(err)));
                }
            };

            Ok(CommLink {
                name,
                comm_link_type,
                auto_connect: auto_connect != 0,
            })
        })?;

        let comm_links: Result<Vec<_>, _> = rows.collect();
        Ok(Settings {
            connection_settings: ConnectionSettings {
                comm_links: comm_links?,
            },
        })
    }
}

pub fn get_settings_path(app: AppHandle) -> Option<std::path::PathBuf> {
    let mut config_dir_path = app.path_resolver().app_config_dir()?;
    match std::fs::create_dir_all(&config_dir_path) {
        Err(_) => return None,
        _ => {}
    };
    config_dir_path.push(std::path::Path::new("config.db")); // Change the name of the database file
    Some(config_dir_path)
}

pub fn establish_connection(settings_file_path: &str) -> Option<Connection> {
    let conn = Connection::open(settings_file_path).ok()?;
    create_table(&conn).ok()?;
    Some(conn)
}

#[tauri::command]
pub async fn get_comm_links(app: AppHandle) -> Result<Vec<CommLink>, String> {
    let settings_path = match get_settings_path(app) {
        Some(p) => p,
        None => {
            return Err("Couldnt get settings path".into());
        }
    };
    println!("Got settings: {:?}", settings_path);
    let conn = match establish_connection(settings_path.to_str().unwrap()) {
        Some(conn) => conn,
        None => {
            return Err("Couldnt establish connection".into());
        }
    };

    match Settings::load(&conn) {
        Ok(settings) => Ok(settings.connection_settings.comm_links),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub async fn add_comm_link(app: AppHandle, new_comm_link: CommLink) {
    println!("New: {:?}", new_comm_link);
    let settings_path = match get_settings_path(app) {
        Some(p) => p,
        None => {
            return;
        }
    };

    let conn = match establish_connection(settings_path.to_str().unwrap()) {
        Some(conn) => conn,
        None => {
            return;
        }
    };

    let settings = Settings {
        connection_settings: ConnectionSettings {
            comm_links: vec![new_comm_link],
        },
    };

    if let Err(e) = Settings::save(&conn, &settings) {
        eprintln!("Error saving settings: {}", e);
    }
}

#[tauri::command]
pub async fn update_comm_link(app: AppHandle, index: usize, new_comm_link: CommLink) {
    println!("Update: {:?}", new_comm_link);
    let settings_path = match get_settings_path(app) {
        Some(p) => p,
        None => {
            return;
        }
    };

    let conn = match establish_connection(settings_path.to_str().unwrap()) {
        Some(conn) => conn,
        None => {
            return;
        }
    };

    let settings = match Settings::load(&conn) {
        Ok(mut settings) => {
            if index < settings.connection_settings.comm_links.len() {
                println!("Updating comm link at index {}", index);
                settings.connection_settings.comm_links[index] = new_comm_link;
                if let Err(e) = Settings::save(&conn, &settings) {
                    eprintln!("Error saving settings: {}", e);
                }
                println!("Updated settings: {:?}", settings);
            } else {
                println!("Index out of bounds: {}", index);
            }
            settings
        }
        Err(_) => {
            println!("Failed to load settings");
            return;
        }
    };

    if let Err(e) = Settings::save(&conn, &settings) {
        eprintln!("Error saving settings: {}", e);
    }
    println!("Updated settings: {:?}", settings);
}
