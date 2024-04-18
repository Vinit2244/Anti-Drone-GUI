// // use std::{error::Error, fs::File};
// use std::fs::File;

// use serde::{Deserialize, Serialize};
// use tauri::AppHandle;

// #[derive(Serialize, Deserialize, Debug)]
// pub struct NoKillZone {
//     pub id: String,
//     pub name: String,
//     pub latitude: f64,
//     pub longitude: f64,
//     pub radius: f64,
// }

// impl Default for NoKillZone {
//     fn default() -> Self {
//         NoKillZone {
//             id: String::new(),
//             name: String::from("New No Kill Zone"),
//             latitude: 0.0,
//             longitude: 0.0,
//             radius: 0.0,
//         }
//     }
// }

// #[derive(Serialize, Deserialize, Debug)]
// pub struct NoKillZones {
//     pub zones: Vec<NoKillZone>,
// }

// impl NoKillZones {
//     pub fn save(&self, path: &std::path::Path) -> Result<(), std::io::Error> {
//         let file = File::create(path)?;
//         serde_json::to_writer_pretty(file, &self)?;

//         Ok(())
//     }

//     pub fn load(path: &std::path::Path) -> Result<Self, serde_json::Error> {
//         match File::open(path) {
//             Ok(file) => Ok(serde_json::from_reader(file)?),
//             Err(_) => {
//                 let default_zones = NoKillZones {
//                     zones: vec![NoKillZone::default()],
//                 };
//                 let _ = default_zones.save(path);
//                 Ok(default_zones)
//             }
//         }
//     }
// }

// pub fn get_zones_path(app: AppHandle) -> Option<std::path::PathBuf> {
//     let mut config_dir_path = app.path_resolver().app_config_dir()?;
//     match std::fs::create_dir_all(&config_dir_path) {
//         Err(_) => return None,
//         _ => {}
//     };
//     config_dir_path.push(std::path::Path::new("zones.json"));
//     Some(config_dir_path)
// }

// #[tauri::command]
// pub async fn get_no_kill_zones(app: AppHandle) -> Result<Vec<NoKillZone>, String> {
//     let zones_path = match get_zones_path(app) {
//         Some(p) => p,
//         None => {
//             return Err("Couldn't get zones path".into());
//         }
//     };
//     match NoKillZones::load(&zones_path) {
//         Ok(zones) => Ok(zones.zones),
//         Err(e) => Err(e.to_string()),
//     }
// }

// #[tauri::command]
// pub async fn add_no_kill_zone(app: AppHandle, new_zone: NoKillZone) {
//     println!("{:?}", new_zone);
//     let zones_path = match get_zones_path(app) {
//         Some(p) => p,
//         None => {
//             return;
//         }
//     };
//     let mut zones = match NoKillZones::load(&zones_path) {
//         Ok(zones) => zones,
//         Err(_) => {
//             return;
//         }
//     };
//     zones.zones.push(new_zone);
//     let _ = zones.save(&zones_path);
// }

// #[tauri::command]
// pub async fn update_no_kill_zone(app: AppHandle, index: usize, new_zone: NoKillZone) {
//     println!("{:?}", new_zone);
//     let zones_path = match get_zones_path(app) {
//         Some(p) => p,
//         None => {
//             return;
//         }
//     };
//     let mut zones = match NoKillZones::load(&zones_path) {
//         Ok(zones) => zones,
//         Err(_) => {
//             return;
//         }
//     };
//     if index < zones.zones.len() {
//         zones.zones[index] = new_zone;
//     }
//     let _ = zones.save(&zones_path);
// }
