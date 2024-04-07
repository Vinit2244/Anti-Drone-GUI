use std::{
    // char::MAX,
    error::Error,
    // io::BufReader,
    path::{Path, PathBuf},
    // sync::{mpsc::TryRecvError, Arc, Mutex},
    // time::{Duration, Instant},
};

use crate::{
    // foreign_object::{
    //     self, get_mission_dir_path, get_new_image_path, move_image_to_dir, ForeignObject,
    //     MissionFODData,
    // },
    foreign_object::{
        get_mission_dir_path, get_new_image_path, move_image_to_dir, ForeignObject, MissionFODData,
    },
    AppState,
};
// use notify::{
//     Config, PollWatcher, RecommendedWatcher, RecursiveMode, Result, Watcher, WatcherKind,
// };
// use tauri::Manager;
use threadpool::ThreadPool;

// const MAX_FOD_BUFFER_SIZE: usize = 20;
// const BUFFER_EMPTY_AFTER_DURATION: Duration = Duration::from_secs(2);

pub struct MissionFODSession {
    mission_dir: PathBuf,
}

impl MissionFODSession {
    pub fn load(&self) -> std::result::Result<MissionFODData, Box<dyn Error>> {
        MissionFODData::load(&self.mission_dir.join(Path::new("data.json")))
    }
    pub fn save(
        &self,
        mission_fod_data: &MissionFODData,
    ) -> std::result::Result<(), Box<dyn Error>> {
        mission_fod_data.save(&self.mission_dir.join(Path::new("data.json")))?;
        Ok(())
    }
    pub fn add_fod(&self, mut fod: ForeignObject) {
        let mut mission_data = self.load().unwrap();
        fod.image_path = move_image_to_dir(&self.mission_dir, fod.image_path.clone()).unwrap();
        mission_data.detected_objects.push(fod);
        self.save(&mission_data).unwrap();
    }
    pub fn add_multi_fod(&self, fod_list: &mut Vec<ForeignObject>, pool: &ThreadPool) {
        let mut mission_data = self.load().unwrap();
        for fod in fod_list.iter_mut() {
            let old_image_path = fod.image_path.clone();
            let new_image_path =
                get_new_image_path(&self.mission_dir, fod.image_path.clone()).unwrap();
            fod.image_path = new_image_path.clone();
            pool.execute(move || {
                println!(
                    "{} -> {}",
                    old_image_path.display(),
                    new_image_path.display()
                );
                match std::fs::copy(&old_image_path, &new_image_path) {
                    Err(e) => eprintln!("{e}"),
                    _ => {}
                };
            })
        }
        pool.join();
        mission_data.detected_objects.extend_from_slice(fod_list);
        self.save(&mission_data).unwrap();
    }
}

#[tauri::command]
pub async fn load_mission_data(
    app_state: tauri::State<'_, AppState>,
) -> std::result::Result<MissionFODData, String> {
    let session = app_state.get_mission_fod_session()?;
    match &(*session) {
        Some(s) => match s.load() {
            Ok(d) => Ok(d),
            Err(e) => Err(e.to_string()),
        },
        None => Err("No session active.".to_string()),
    }
}

#[tauri::command]
pub async fn create_mission_session(
    app: tauri::AppHandle,
    app_state: tauri::State<'_, AppState>,
    mission_fod_data: MissionFODData,
) -> std::result::Result<(), String> {
    let mut session = app_state.get_mission_fod_session()?;
    let mission_dir_path = match get_mission_dir_path(app, &mission_fod_data.mission_id(), true) {
        Ok(p) => p,
        Err(e) => return Err(e.to_string()),
    };
    let new_session = MissionFODSession {
        mission_dir: mission_dir_path,
    };
    match new_session.save(&mission_fod_data) {
        Ok(_) => {}
        Err(e) => {
            return Err(e.to_string());
        }
    }
    *session = Some(new_session);
    Ok(())
}

#[tauri::command]
pub async fn set_cleared(
    app_state: tauri::State<'_, AppState>,
    object_id: String,
) -> std::result::Result<MissionFODData, String> {
    let session = app_state.get_mission_fod_session()?;
    match &*session {
        None => return Err("No Active Session".to_string()),
        Some(s) => {
            let mut mission_data = match s.load() {
                Ok(d) => d,
                Err(e) => return Err(e.to_string()),
            };
            for fod in mission_data.detected_objects.iter_mut() {
                if fod.object_id == object_id {
                    fod.cleared = true;
                    break;
                }
            }
            match s.save(&mission_data) {
                Ok(_) => return Ok(mission_data),
                Err(e) => return Err(e.to_string()),
            }
        }
    };
}

#[tauri::command]
pub async fn end_mission_session(
    app_state: tauri::State<'_, AppState>,
) -> std::result::Result<(), String> {
    let mut session = app_state.get_mission_fod_session()?;
    *session = None;
    Ok(())
}

// pub fn add_fod(session_mutex: Arc<Mutex<Option<MissionFODSession>>>, fod: ForeignObject) {
//     let session = session_mutex.lock().unwrap();
//     match &(*session) {
//         Some(s) => s.add_fod(fod),
//         None => {}
//     }
// }

// pub fn add_multi_fod(
//     session_mutex: Arc<Mutex<Option<MissionFODSession>>>,
//     fod_list: &mut Vec<ForeignObject>,
//     worker_pool: &ThreadPool,
// ) {
//     let session = session_mutex.lock().unwrap();
//     match &(*session) {
//         Some(s) => s.add_multi_fod(fod_list, worker_pool),
//         None => {}
//     }
// }

// pub fn watch(app: tauri::AppHandle) -> Result<()> {
//     let (tx, rx) = std::sync::mpsc::channel();
//     // This example is a little bit misleading as you can just create one Config and use it for all watchers.
//     // That way the pollwatcher specific stuff is still configured, if it should be used.
//     let mut watcher: Box<dyn Watcher> = if RecommendedWatcher::kind() == WatcherKind::PollWatcher {
//         // custom config for PollWatcher kind
//         // you
//         let config = Config::default().with_poll_interval(Duration::from_secs(1));
//         Box::new(PollWatcher::new(tx, config).unwrap())
//     } else {
//         // use default config for everything else
//         Box::new(RecommendedWatcher::new(tx, Config::default()).unwrap())
//     };
//     // watch some stuff
//     watcher
//         .watch(
//             Path::new("/home/orin-arka/GlobalFODData"),
//             RecursiveMode::Recursive,
//         )
//         .unwrap();

//     // just print all events, this blocks forever

//     let mut fod_buffer = vec![];
//     let pool = threadpool::ThreadPool::new(8);
//     let mut last_set = Instant::now();
//     loop {
//         match rx.try_recv() {
//             Ok(e) => match e {
//                 Ok(e) => match e.kind {
//                     notify::EventKind::Access(notify::event::AccessKind::Close(
//                         notify::event::AccessMode::Write,
//                     )) => {
//                         for path in e.paths {
//                             if path.extension() != Some(std::ffi::OsStr::new("json")) {
//                                 continue;
//                             }

//                             match read_fod(&path) {
//                                 Ok(fod) => {
//                                     // let state = app.state::<AppState>();
//                                     fod_buffer.push(fod);
//                                     last_set = Instant::now();
//                                     // add_fod(state.1.clone(), fod)
//                                 }
//                                 Err(e) => {
//                                     eprintln!("{e}")
//                                 }
//                             }
//                         }
//                     }
//                     _ => {}
//                 },
//                 Err(e) => eprintln!("{e}"),
//             },
//             Err(TryRecvError::Empty) => {}
//             Err(e) => eprintln!("{e}"),
//         };
//         if !fod_buffer.is_empty()
//             && (fod_buffer.len() > MAX_FOD_BUFFER_SIZE
//                 || Instant::now().duration_since(last_set) > BUFFER_EMPTY_AFTER_DURATION)
//         {
//             let state = app.state::<AppState>();
//             add_multi_fod(state.1.clone(), &mut fod_buffer, &pool);
//             fod_buffer.clear();
//         }
//     }
// }

// pub fn read_fod(
//     path: &std::path::Path,
// ) -> std::result::Result<foreign_object::ForeignObject, Box<dyn std::error::Error>> {
//     let file = std::fs::File::open(path)?;
//     let reader = BufReader::new(file);

//     Ok(serde_json::from_reader(reader)?)
// }
