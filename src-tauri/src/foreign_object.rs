use std::{
    error::Error,
    fs::File,
    io::{BufReader, BufWriter},
    path::{Path, PathBuf},
    time::{SystemTime, UNIX_EPOCH},
};

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ForeignObject {
    pub object_id: String,
    object_label: String,
    latitude: f32,
    longitude: f32,
    pub cleared: bool,
    pub image_path: PathBuf,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct MissionFODData {
    pub detected_objects: Vec<ForeignObject>,
    mission_start_time: std::time::SystemTime,
    mission_end_time: std::time::SystemTime,
    mission_name: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct PartialMissionFODData {
    mission_start_time: std::time::SystemTime,
    mission_end_time: std::time::SystemTime,
    mission_name: String,
}

impl PartialMissionFODData {
    pub fn load_from_full(mission_data: &MissionFODData) -> Self {
        PartialMissionFODData {
            mission_start_time: mission_data.mission_start_time.clone(),
            mission_end_time: mission_data.mission_end_time.clone(),
            mission_name: mission_data.mission_name.clone(),
        }
    }
}

impl MissionFODData {
    pub fn save(&self, path: &std::path::Path) -> Result<(), std::io::Error> {
        let file = BufWriter::new(File::create(path)?);
        serde_json::to_writer_pretty(file, &self)?;

        Ok(())
    }

    pub fn load(path: &std::path::Path) -> Result<Self, Box<dyn Error>> {
        let file = BufReader::new(File::open(path)?);
        Ok(serde_json::from_reader(file)?)
    }

    pub fn mission_id(&self) -> String {
        format!(
            "{}-{}",
            self.mission_name,
            self.mission_start_time
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_secs()
        )
    }
}

impl Default for MissionFODData {
    fn default() -> Self {
        MissionFODData {
            detected_objects: vec![],
            mission_start_time: SystemTime::now(),
            mission_end_time: SystemTime::now(),
            mission_name: names::Generator::default().next().unwrap(),
        }
    }
}

pub fn get_mission_dir_path(
    app: tauri::AppHandle,
    mission_id: &str,
    create_new: bool,
) -> Result<std::path::PathBuf, Box<dyn std::error::Error>> {
    let mut mission_dir_path = match app.path_resolver().resource_dir() {
        None => return Err("Couldnt get data directory".into()),
        Some(p) => p,
    };
    mission_dir_path.push(std::path::Path::new("FODHistory"));
    mission_dir_path.push(std::path::Path::new(mission_id));
    if create_new {
        std::fs::create_dir_all(&mission_dir_path)?;
    }
    Ok(mission_dir_path)
}

#[tauri::command]
pub async fn save_fod(app: tauri::AppHandle, mission_data: MissionFODData) -> Result<(), String> {
    let mut path = match get_mission_dir_path(app, &mission_data.mission_id(), true) {
        Err(e) => {
            return Err(e.to_string());
        }
        Ok(p) => p,
    };
    path.push("data.json");
    match mission_data.save(&path) {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub async fn get_default_mission() -> MissionFODData {
    MissionFODData::default()
}

pub fn get_new_image_path(mission_dir_path: &Path, image_path: PathBuf) -> Result<PathBuf, String> {
    let file_extension = match image_path.extension() {
        Some(n) => n,
        None => return Err("Can't get Image extension.".into()),
    };
    let mut file_stem = match image_path.file_stem() {
        Some(n) => n,
        None => return Err("Can't get Image name.".into()),
    }
    .to_os_string();
    let time_stamp = SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_nanos()
        .to_string();
    file_stem.push("-");
    file_stem.push(time_stamp);
    file_stem.push(".");
    file_stem.push(file_extension);
    Ok(mission_dir_path.join(file_stem))
}

pub fn move_image_to_dir(mission_dir_path: &Path, image_path: PathBuf) -> Result<PathBuf, String> {
    let file_extension = match image_path.extension() {
        Some(n) => n,
        None => return Err("Can't get Image extension.".into()),
    };
    let mut file_stem = match image_path.file_stem() {
        Some(n) => n,
        None => return Err("Can't get Image name.".into()),
    }
    .to_os_string();
    let time_stamp = SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_nanos()
        .to_string();
    file_stem.push("-");
    file_stem.push(time_stamp);
    file_stem.push(".");
    file_stem.push(file_extension);
    let new_file_path = mission_dir_path.join(file_stem);
    println!("{image_path:?} -> {new_file_path:?}");
    match std::fs::copy(&image_path, &new_file_path) {
        Err(e) => Err(e.to_string()),
        Ok(_) => Ok(new_file_path),
    }
}

#[tauri::command]
pub async fn move_image_to_mission_dir(
    app: tauri::AppHandle,
    mission_id: String,
    image_path: PathBuf,
) -> Result<PathBuf, String> {
    let file_extension = match image_path.extension() {
        Some(n) => n,
        None => return Err("Can't get Image extension.".into()),
    };
    let mut file_stem = match image_path.file_stem() {
        Some(n) => n,
        None => return Err("Can't get Image name.".into()),
    }
    .to_os_string();
    let time_stamp = SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_nanos()
        .to_string();
    file_stem.push("-");
    file_stem.push(time_stamp);
    file_stem.push(".");
    file_stem.push(file_extension);
    let mut new_file_path = match get_mission_dir_path(app, &mission_id, true) {
        Ok(p) => p,
        Err(e) => return Err(e.to_string()),
    };

    new_file_path.push(file_stem);
    println!("{image_path:?} -> {new_file_path:?}");
    match std::fs::copy(&image_path, &new_file_path) {
        Err(e) => Err(e.to_string()),
        Ok(_) => Ok(new_file_path),
    }
}

#[tauri::command]
pub async fn load_fod_history(
    app: tauri::AppHandle,
    mission_id: String,
) -> Result<MissionFODData, String> {
    let mut path = match get_mission_dir_path(app, &mission_id, true) {
        Err(e) => {
            return Err(e.to_string());
        }
        Ok(p) => p,
    };
    path.push("data.json");
    match MissionFODData::load(&path) {
        Err(e) => Err(e.to_string()),
        Ok(m) => Ok(m),
    }
}

#[tauri::command]
pub async fn get_fod_history(app: tauri::AppHandle) -> Result<Vec<PartialMissionFODData>, String> {
    let path = match get_mission_dir_path(app, "[a-zA-Z]*-[a-zA-Z]*-[0-9]*", false) {
        Err(e) => {
            return Err(e.to_string());
        }
        Ok(p) => p,
    };
    let entries = glob::glob(path.to_str().unwrap()).unwrap();
    let mut fod_history: Vec<PartialMissionFODData> = Vec::new();
    for entry in entries {
        match entry {
            Ok(p) => match MissionFODData::load(&p.join("data.json")) {
                Ok(m) => fod_history.push(PartialMissionFODData::load_from_full(&m)),
                Err(_) => {}
            },
            Err(_) => {}
        }
    }
    Ok(fod_history)
}
