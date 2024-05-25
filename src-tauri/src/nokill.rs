// use std::{error::Error, fs::File};
// use std::fs::File;

use rusqlite::{params, Connection, Error, Result};
use serde::{Deserialize, Serialize};
use tauri::AppHandle;

// Struct defining a No Kill Zone
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

// Implement Clone for NoKillZone
// Needed because it creates a copy of the struct
// used in updating
impl Clone for NoKillZone {
    fn clone(&self) -> Self {
        NoKillZone {
            id: self.id.clone(),
            name: self.name.clone(),
            latitude: self.latitude,
            longitude: self.longitude,
            radius: self.radius,
        }
    }
}

// Struct defining a list of No Kill Zones
#[derive(Serialize, Deserialize, Debug)]
pub struct NoKillZones {
    pub zones: Vec<NoKillZone>,
}

// Functions for NoKillZones
impl NoKillZones {
    // Create the table for NoKillZones
    // Only if it doesn't already exist
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

    // Save the NoKillZones to the database
    pub fn save(&self, conn: &Connection) -> Result<(), Error> {
        for zone in &self.zones {
            println!("Inserting: {:?}", zone);
            conn.execute(
                "INSERT INTO no_kill_zones (id, name, latitude, longitude, radius) VALUES (?1, ?2, ?3, ?4, ?5)",
                params![zone.id, zone.name, zone.latitude, zone.longitude, zone.radius],
            )?;
        }
        Ok(())
    }

    // Load the NoKillZones from the database
    pub fn load(conn: &Connection) -> Result<Self, Error> {
        // Query statement
        let mut stmt =
            conn.prepare("SELECT id, name, latitude, longitude, radius FROM no_kill_zones")?;
        // Execute the query over all rows
        let rows = stmt.query_map([], |row| {
            Ok(NoKillZone {
                id: row.get(0)?,
                name: row.get(1)?,
                latitude: row.get(2)?,
                longitude: row.get(3)?,
                radius: row.get(4)?,
            })
        })?;
        // Collect the rows into a vector
        let mut zones = Vec::new();
        for zone in rows {
            zones.push(zone?);
        }

        Ok(NoKillZones { zones })
    }

    // Update the NoKillZones in the database using id as the key
    pub fn update(&self, conn: &Connection) -> Result<(), Error> {
        for zone in &self.zones {
            conn.execute(
                "UPDATE no_kill_zones SET name = ?2, latitude = ?3, longitude = ?4, radius = ?5 WHERE id = ?1",
                params![zone.id, zone.name, zone.latitude, zone.longitude, zone.radius],
            )?;
        }
        Ok(())
    }
}

// Get the path to the No Kill Zones database
pub fn get_zones_path(app: AppHandle) -> Option<std::path::PathBuf> {
    let mut config_dir_path = app.path_resolver().app_config_dir()?;
    match std::fs::create_dir_all(&config_dir_path) {
        Err(_) => return None,
        _ => {}
    };
    config_dir_path.push(std::path::Path::new("config.db")); // Used to store no kill zones and settings
    Some(config_dir_path)
}

// Create a connection to the No Kill Zones database
pub fn establish_connection(db_file_path: &str) -> Option<Connection> {
    let conn = Connection::open(db_file_path).ok()?;
    NoKillZones::create_table(&conn).ok()?;
    Some(conn)
}

#[tauri::command]
pub async fn get_no_kill_zones(app: AppHandle) -> Result<Vec<NoKillZone>, String> {
    // Retrieves a list of no-kill zones from the application, if available.
    // If not available, returns an error message.
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

    match NoKillZones::load(&conn) {
        Ok(zones) => Ok(zones.zones),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub async fn add_no_kill_zone(app: AppHandle, new_zone: NoKillZone) {
    // Adds a new kill zone to database
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

    let zones = NoKillZones {
        zones: vec![new_zone],
    };
    // println!("Loaded: {:?}", zones);
    let _ = zones.save(&conn);
    // println!("Saved: {:?}", zones);
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

    let mut zones = match NoKillZones::load(&conn) {
        Ok(zones) => zones,
        Err(_) => {
            return;
        }
    };
    // Check if the zone exists
    let mut found = false;
    for zone in &mut zones.zones {
        if zone.id == new_zone.id {
            *zone = new_zone.clone();
            found = true;
            println!("Zone found");
            break;
        }
    }
    if !found {
        println!("Zone not found");
        return;
    }

    // Only update the zone that was found
    let zone_to_update = NoKillZones {
        zones: vec![new_zone.clone()],
    };
    let _ = zone_to_update.update(&conn);
    println!("Updated: {:?}", zone_to_update);
}
