// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use fod_watcher::MissionFODSession;
use mavlink::ardupilotmega::{
    MavLandedState, MavMessage, MavState, FILE_TRANSFER_PROTOCOL_DATA, REQUEST_DATA_STREAM_DATA,
};
use mavlink::error::MessageReadError;
use mavlink::MavHeader;

use settings::CommLink;
use std::error::Error;
use std::sync::{Mutex, MutexGuard, RwLock};
use std::time::{Duration, Instant};
use std::{env, sync::Arc, thread};
use tauri::Manager;
use tauri::State;

pub mod arkana;
mod drone_commands;
mod fod_watcher;
pub mod foreign_object;
mod ftp;
pub mod messages;
mod settings;
pub mod usb_serial;

#[derive(Clone, serde::Serialize)]
struct BatteryUpdatePayload {
    payload: mavlink::ardupilotmega::BATTERY_STATUS_DATA,
}

#[derive(Clone, serde::Serialize)]
struct PositionUpdatePayload {
    system_id: String,
    payload: mavlink::ardupilotmega::GLOBAL_POSITION_INT_DATA,
}

#[derive(Clone, serde::Serialize)]
struct ForceDisconnectedPayload {
    reason: String,
}

#[derive(Clone, serde::Serialize)]
struct HeartbeatPayload {
    system_id: String,
    custom_mode: u32,
    system_status: MavState,
}

#[derive(Clone, serde::Serialize)]
struct StatusPayload {
    status_text: String,
}

#[derive(Clone, serde::Serialize)]
struct LandedStatePayload {
    landed_state: MavLandedState,
}

#[derive(Clone)]
struct AppInfo {
    vehicle: Arc<Box<dyn mavlink::MavConnection<MavMessage> + Send + Sync>>,
    keep_alive: Arc<RwLock<bool>>,
    mode_ack_receiver: Arc<Mutex<crossbeam_channel::Receiver<(MavHeader, MavMessage)>>>,
}

#[derive(Clone, serde::Serialize)]
struct GPSStatusPayload {
    satellites_visible: u8,
}

pub struct AppState(
    Arc<RwLock<Option<AppInfo>>>,
    Arc<Mutex<Option<fod_watcher::MissionFODSession>>>,
);

impl AppState {
    pub fn get_mission_fod_session(&self) -> Result<MutexGuard<Option<MissionFODSession>>, String> {
        match self.1.lock() {
            Ok(s) => Ok(s),
            Err(e) => Err(e.to_string()),
        }
    }
    pub fn get_keep_alive(&self) -> Result<Arc<RwLock<bool>>, String> {
        let app_info = match self.0.read() {
            Ok(r) => (*r).clone(),
            Err(e) => return Err(e.to_string()),
        };
        match app_info {
            None => Err("Disconnected".into()),
            Some(state) => Ok(state.keep_alive),
        }
    }
    pub fn get_vehicle(
        &self,
    ) -> Result<Arc<Box<dyn mavlink::MavConnection<MavMessage> + Send + Sync>>, String> {
        let app_info = match self.0.read() {
            Ok(r) => (*r).clone(),
            Err(e) => return Err(e.to_string()),
        };
        match app_info {
            None => Err("Disconnected".into()),
            Some(state) => Ok(state.vehicle),
        }
    }
    pub fn get_mode_ack_receiver(
        &self,
    ) -> Result<Arc<Mutex<crossbeam_channel::Receiver<(MavHeader, MavMessage)>>>, String> {
        let app_info = match self.0.read() {
            Ok(r) => (*r).clone(),
            Err(e) => return Err(e.to_string()),
        };
        match app_info {
            None => Err("Disconnected".into()),
            Some(state) => Ok(state.mode_ack_receiver),
        }
    }
}

// const WORKER_COUNT: usize = 5;

#[tauri::command]
async fn telemetry_connect(
    app: tauri::AppHandle,
    app_state: State<'_, AppState>,
) -> Result<(bool, String), String> {
    let now = Instant::now();
    app.emit_all("telemetry_disconnect", {}).unwrap();
    loop {
        match init_anti_drone_connection(app.clone(), app_state.clone()) {
            Ok(config_str) => {
                return Ok((true, config_str));
            }
            Err(e) => {
                if e.to_string() == "Device or resource busy" && now.elapsed() < Duration::new(2, 0)
                {
                    continue;
                }
                return Ok((false, e.to_string()));
            }
        }
    }
}

fn init_anti_drone_connection(
    app: tauri::AppHandle,
    app_state: State<AppState>,
) -> Result<String, Box<dyn Error>> {
    let settings_path = match settings::get_settings_path(app.app_handle()) {
        Some(p) => p,
        None => {
            return Err("Couldn't load settings".into());
        }
    };
    let settings = settings::Settings::load(&settings_path)?;
    let connect_links: Vec<&CommLink> = settings
        .connection_settings
        .comm_links
        .iter()
        .filter(|x| x.auto_connect)
        .collect();
    if connect_links.len() == 0 {
        return Err("No Comm Links to auto connect.".into());
    }
    let mut mavconn_detected: Option<(
        Box<dyn mavlink::MavConnection<MavMessage> + Send + Sync>,
        String,
    )> = None;
    for link in connect_links {
        let config_str = match link.comm_link_type.to_config_str() {
            Some(c) => c,
            None => {
                continue;
            }
        };
        match mavlink::connect::<MavMessage>(&config_str) {
            Ok(mavconn) => {
                mavconn_detected = Some((mavconn, link.name.clone()));
                break;
            }
            Err(e) => {
                eprintln!("{:?}", e);
                continue;
            }
        }
    }

    let mavconn_profile = match mavconn_detected {
        Some(m) => m,
        None => {
            return Err("Couldn't connect to comm links".into());
        }
    };
    let mut mavconn = mavconn_profile.0;
    mavconn.set_protocol_version(mavlink::MavlinkVersion::V2);

    let vehicle = Arc::new(mavconn);

    let keep_alive = Arc::new(RwLock::new(true));

    let heartbeat_thread_handle = thread::spawn({
        let vehicle = Arc::clone(&vehicle);
        let keep_alive = Arc::clone(&keep_alive);
        let app = app.clone();
        move || {
            while *keep_alive.read().unwrap() {
                let res = vehicle.send_default(&messages::heartbeat_message());
                match res {
                    Ok(_) => thread::sleep(Duration::from_millis(500)),
                    Err(e) => {
                        app.emit_all("telemetry_disconnect", {}).unwrap();
                        app.emit_all(
                            "force_disconnected",
                            ForceDisconnectedPayload {
                                reason: e.to_string(),
                            },
                        )
                        .unwrap();
                        return;
                    }
                }
            }
        }
    });

    let (mode_sender, mode_ack_receiver): (
        crossbeam_channel::Sender<(MavHeader, MavMessage)>,
        crossbeam_channel::Receiver<(MavHeader, MavMessage)>,
    ) = crossbeam_channel::unbounded();

    let receive_thread_handle = thread::spawn({
        let keep_alive = Arc::clone(&keep_alive);
        let app = app.clone();
        let vehicle = vehicle.clone();

        move || {
            while *keep_alive.read().unwrap() {
                match vehicle.recv() {
                    Ok((header, msg)) => match msg {
                        MavMessage::BATTERY_STATUS(data) => {
                            // println!("{data:?}");
                            app.emit_all(
                                &format!("battery_update_{}", header.system_id),
                                BatteryUpdatePayload { payload: data },
                            )
                            .unwrap();
                        }
                        MavMessage::GLOBAL_POSITION_INT(data) => {
                            // println!("location from {} {:?}\n", header.system_id, data);
                            let system_id = header.system_id.to_string();
                            let payload = PositionUpdatePayload {
                                system_id: system_id.clone(),
                                payload: data.clone(),
                            };
                            app.emit_all("position_update", payload.clone()).unwrap();
                            app.emit_all(&format!("position_update_{system_id}"), payload)
                                .unwrap();
                        }
                        MavMessage::EXTENDED_SYS_STATE(data) => {
                            let system_id = header.system_id.to_string();
                            app.emit_all(
                                &format!("landed_state_{system_id}"),
                                LandedStatePayload {
                                    landed_state: data.landed_state,
                                },
                            )
                            .unwrap();
                            // println!("{data:?}");
                        }
                        MavMessage::HEARTBEAT(x) => {
                            let system_id = header.system_id.to_string();
                            app.emit_all(
                                "heartbeat",
                                HeartbeatPayload {
                                    system_id: system_id.clone(),
                                    custom_mode: x.custom_mode,
                                    system_status: x.system_status,
                                },
                            )
                            .unwrap();

                            app.emit_all(
                                &format!("heartbeat_{}", system_id).to_owned(),
                                HeartbeatPayload {
                                    system_id: system_id,
                                    custom_mode: x.custom_mode,
                                    system_status: x.system_status,
                                },
                            )
                            .unwrap();
                            _ = mode_sender.try_send((header, MavMessage::HEARTBEAT(x)));
                            // ignore result because will receive message again
                        }
                        MavMessage::STATUSTEXT(data) => {
                            // println!("{data:?}");
                            let data = std::str::from_utf8(&data.text).unwrap().to_owned();
                            // println!("{data:?}");
                            // println!("---");
                            let system_id = header.system_id.to_string();
                            app.emit_all(
                                &format!("status_{}", system_id).to_owned(),
                                StatusPayload { status_text: data },
                            )
                            .unwrap();
                        }
                        MavMessage::SWARM_CONTROL(x) => {
                            println!("Received Swarm Control {x:?}");
                        }
                        MavMessage::GPS_RAW_INT(data) => {
                            let system_id = header.system_id.to_string();
                            // println!("id:{:?} -> {:?}", system_id, data);
                            if data.fix_type
                                == mavlink::ardupilotmega::GpsFixType::GPS_FIX_TYPE_NO_FIX
                                || data.fix_type
                                    == mavlink::ardupilotmega::GpsFixType::GPS_FIX_TYPE_NO_GPS
                            {
                                app.emit_all(&format!("no_gps_{}", system_id).to_owned(), {})
                                    .unwrap();
                            } else {
                                app.emit_all(&format!("gps_detected_{}", system_id).to_owned(), {})
                                    .unwrap()
                            }
                            app.emit_all(
                                &format!("gps_status_{system_id}"),
                                GPSStatusPayload {
                                    satellites_visible: data.satellites_visible,
                                },
                            )
                            .unwrap();
                        }
                        m @ MavMessage::COMMAND_ACK(_) => {
                            println!("{:?}", m);
                            _ = mode_sender.try_send((header, m)); // ignore result because will receive message again
                        }
                        _ => {
                            // println!("{x:?}")
                        }
                    },
                    Err(MessageReadError::Io(e)) => {
                        if let std::io::ErrorKind::WouldBlock = e.kind() {
                            //no messages currently available to receive -- wait a while
                            thread::sleep(Duration::from_secs(1));
                            continue;
                        } else if let std::io::ErrorKind::TimedOut = e.kind() {
                            continue;
                        } else {
                            eprintln!("recv error: {e:?}");
                            break;
                        }
                    }
                    // messages that didn't get through due to parser errors are ignored
                    x => {
                        eprintln!("unexpected: {:?}", x);
                    }
                }
            }
        }
    });
    *app_state.0.write().unwrap() = Some(AppInfo {
        vehicle: vehicle.clone(),
        keep_alive: keep_alive.clone(),
        mode_ack_receiver: Arc::new(Mutex::new(mode_ack_receiver.clone())),
    });
    thread::spawn({
        let app = app.clone();
        move || {
            heartbeat_thread_handle.join().unwrap();
            receive_thread_handle.join().unwrap();
            app.emit_all("telemetry_disconnected", {}).unwrap();
        }
    });
    Ok(mavconn_profile.1.to_owned())
}

#[tauri::command]
async fn telemetry_disconnect(app_state: State<'_, AppState>) -> Result<(), String> {
    match app_state.get_keep_alive()?.write() {
        Ok(mut s) => {
            *s = false;
        }
        Err(e) => return Err(e.to_string()),
    }
    match app_state.0.write() {
        Ok(mut a) => {
            *a = None;
            Ok(())
        }
        Err(e) => Err(e.to_string()),
    }
}

fn main() {
    std::env::set_var("WEBKIT_DISABLE_COMPOSITING_MODE", "1");
    tauri::Builder::default()
        .manage(AppState(
            Arc::new(RwLock::new(None)),
            Arc::new(Mutex::new(None)),
        ))
        .invoke_handler(tauri::generate_handler![
            telemetry_connect,
            telemetry_disconnect,
            settings::get_comm_links,
            settings::add_comm_link,
            settings::update_comm_link,
            usb_serial::get_usb_path,
            usb_serial::get_usb_ports,
            foreign_object::get_default_mission,
            foreign_object::save_fod,
            foreign_object::load_fod_history,
            foreign_object::get_fod_history,
            foreign_object::move_image_to_mission_dir,
            arkana::launch,
            arkana::land,
            drone_commands::kill_motors,
            drone_commands::set_mode,
            drone_commands::set_messages_stream,
            fod_watcher::create_mission_session,
            fod_watcher::load_mission_data,
            fod_watcher::end_mission_session,
            fod_watcher::set_cleared
        ])
        .setup(|app| {
            let app_handle = app.app_handle();

            // thread::spawn(|| fod_watcher::watch(app_handle));
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
