// use std::{error::Error, fs::File};
// use std::fs::File;

use rusqlite::{params, Connection, Error, Result};
use serde::{Deserialize, Serialize};
use tauri::AppHandle;

#[derive(Serialize, Deserialize, Debug)]
pub struct NoKillZone {
    pub id: String,
    pub name: String,
    pub latitude: f64,
    pub longitude: f64,
    pub radius: f64,
}

impl Default for NoKillZone {
    fn default() -> Self {
        NoKillZone {
            id: String::new(),
            name: String::from("New No Kill Zone"),
            latitude: 0.0,
            longitude: 0.0,
            radius: 0.0,
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct NoKillZones {
    pub zones: Vec<NoKillZone>,
}

impl NoKillZones {
    pub fn create_table(conn: &Connection) -> Result<()> {
        conn.execute(
            "CREATE TABLE IF NOT EXISTS no_kill_zones (
                    id TEXT PRIMARY KEY,
                    name TEXT,
                    latitude REAL,
                    longitude REAL,
                    radius REAL
                )",
            [],
        )?;
        Ok(())
    }

    // pub fn save(&self, path: &std::path::Path) -> Result<(), std::io::Error> {
    //     let file = File::create(path)?;
    //     serde_json::to_writer_pretty(file, &self)?;

    //     Ok(())
    // }

    pub fn save(&self, conn: &Connection) -> Result<(), Error> {
        // conn.execute("DELETE FROM no_kill_zones", [])?;
        for zone in &self.zones {
            println!("Inserting: {:?}", zone);
            conn.execute(
                "INSERT INTO no_kill_zones (id, name, latitude, longitude, radius) VALUES (?1, ?2, ?3, ?4, ?5)",
                params![zone.id, zone.name, zone.latitude, zone.longitude, zone.radius],
            )?;
        }
        Ok(())
    }

    // pub fn load(path: &std::path::Path) -> Result<Self, serde_json::Error> {
    //     match File::open(path) {
    //         Ok(file) => Ok(serde_json::from_reader(file)?),
    //         Err(_) => {
    //             let default_zones = NoKillZones {
    //                 zones: vec![NoKillZone::default()],
    //             };
    //             let _ = default_zones.save(path);
    //             Ok(default_zones)
    //         }
    //     }
    // }

    pub fn load(conn: &Connection) -> Result<Self, Error> {
        let mut stmt =
            conn.prepare("SELECT id, name, latitude, longitude, radius FROM no_kill_zones")?;
        let rows = stmt.query_map([], |row| {
            Ok(NoKillZone {
                id: row.get(0)?,
                name: row.get(1)?,
                latitude: row.get(2)?,
                longitude: row.get(3)?,
                radius: row.get(4)?,
            })
        })?;

        let mut zones = Vec::new();
        for zone in rows {
            zones.push(zone?);
        }

        Ok(NoKillZones { zones })
    }

    pub fn update(&self, conn: &Connection) -> Result<(), Error> {
        // conn.execute("DELETE FROM no_kill_zones", [])?;
        for zone in &self.zones {
            conn.execute(
                "UPDATE no_kill_zones SET name = ?2, latitude = ?3, longitude = ?4, radius = ?5 WHERE id = ?1",
                params![zone.id, zone.name, zone.latitude, zone.longitude, zone.radius],
            )?;
        }
        Ok(())
    }
}

pub fn get_zones_path(app: AppHandle) -> Option<std::path::PathBuf> {
    let mut config_dir_path = app.path_resolver().app_config_dir()?;
    match std::fs::create_dir_all(&config_dir_path) {
        Err(_) => return None,
        _ => {}
    };
    config_dir_path.push(std::path::Path::new("zones.db"));
    Some(config_dir_path)
}

pub fn establish_connection(db_file_path: &str) -> Option<Connection> {
    let conn = Connection::open(db_file_path).ok()?;
    NoKillZones::create_table(&conn).ok()?;
    Some(conn)
}

#[tauri::command]
pub async fn get_no_kill_zones(app: AppHandle) -> Result<Vec<NoKillZone>, String> {
    let zones_path = match get_zones_path(app) {
        Some(p) => p,
        None => {
            return Err("Couldn't get zones path".into());
        }
    };
    println!("Got Kill Zones: {:?}", zones_path);
    let conn = match establish_connection(zones_path.to_str().unwrap()) {
        Some(c) => c,
        None => {
            return Err("Couldn't establish connection".into());
        }
    };
    // match NoKillZones::load(&zones_path) {
    //     Ok(zones) => Ok(zones.zones),
    //     Err(e) => Err(e.to_string()),
    // }
    match NoKillZones::load(&conn) {
        Ok(zones) => Ok(zones.zones),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub async fn add_no_kill_zone(app: AppHandle, new_zone: NoKillZone) {
    println!("New: {:?}", new_zone);
    let zones_path = match get_zones_path(app) {
        Some(p) => p,
        None => {
            return;
        }
    };
    let conn = match establish_connection(zones_path.to_str().unwrap()) {
        Some(c) => c,
        None => {
            return;
        }
    };
    // let mut zones = match NoKillZones::load(&zones_path) {
    //     Ok(zones) => zones,
    //     Err(_) => {
    //         return;
    //     }
    // };
    // let mut zones = match NoKillZones::load(&conn) {
    //     Ok(zones) => zones,
    //     Err(_) => {
    //         return;
    //     }
    // };
    let zones = NoKillZones {
        zones: vec![new_zone],
    };
    // println!("Loaded: {:?}", zones);
    // let _ = zones.save(&zones_path);
    println!("Saving: {:?}", zones);
    let _ = zones.save(&conn);
    println!("Saved: {:?}", zones);
}

#[tauri::command]
pub async fn update_no_kill_zone(app: AppHandle, new_zone: NoKillZone) {
    println!("Update: {:?}", new_zone);
    let zones_path = match get_zones_path(app) {
        Some(p) => p,
        None => {
            return;
        }
    };
    let conn = match establish_connection(zones_path.to_str().unwrap()) {
        Some(c) => c,
        None => {
            return;
        }
    };
    // let mut zones = match NoKillZones::load(&zones_path) {
    //     Ok(zones) => zones,
    //     Err(_) => {
    //         return;
    //     }
    // };
    let mut zones = match NoKillZones::load(&conn) {
        Ok(zones) => zones,
        Err(_) => {
            return;
        }
    };
    let mut found = false;
    for zone in &mut zones.zones {
        if zone.id == new_zone.id {
            *zone = new_zone;
            found = true;
            break;
        }
    }
    if !found {
        println!("Zone not found");
        return;
    }
    println!("Found: {:?}", zones);
    let _ = zones.update(&conn);
    println!("Updated: {:?}", zones);
}
