// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use fod_watcher::MissionFODSession;
use mavlink::ardupilotmega::{MavLandedState, MavMessage, MavState};
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
mod nokill;
mod settings;
pub mod usb_serial;

const MAV_SYS_STATUS_SENSOR_3D_GYRO: u32 = 1;
const MAV_SYS_STATUS_SENSOR_3D_ACCEL: u32 = 2;
const MAV_SYS_STATUS_SENSOR_3D_MAG: u32 = 4;
const MAV_SYS_STATUS_SENSOR_ABSOLUTE_PRESSURE: u32 = 8;
const MAV_SYS_STATUS_SENSOR_GPS: u32 = 32;
const MAV_SYS_STATUS_SENSOR_ANGULAR_RATE_CONTROL: u32 = 1024;
const MAV_SYS_STATUS_SENSOR_ATTITUDE_STABILIZATION: u32 = 2048;
const MAV_SYS_STATUS_SENSOR_YAW_POSITION: u32 = 4096;
const MAV_SYS_STATUS_SENSOR_Z_ALTITUDE_CONTROL: u32 = 8192;
const MAV_SYS_STATUS_SENSOR_XY_POSITION_CONTROL: u32 = 16384;
const MAV_SYS_STATUS_SENSOR_MOTOR_OUTPUTS: u32 = 32768;
const MAV_SYS_STATUS_SENSOR_RC_RECEIVER: u32 = 65536;
const MAV_SYS_STATUS_GEOFENCE: u32 = 1048576;
const MAV_SYS_STATUS_AHRS: u32 = 2097152;
const MAV_SYS_STATUS_TERRAIN: u32 = 4194304;
const MAV_SYS_STATUS_LOGGING: u32 = 16777216;
const MAV_SYS_STATUS_SENSOR_BATTERY: u32 = 33554432;
const MAV_SYS_STATUS_SENSOR_PROXIMITY: u32 = 67108864;
const MAV_SYS_STATUS_PRE_ARM_CHECK: u32 = 268435456;
const MAV_SYS_STATUS_SENSOR_PROPULSION: u32 = 1073741824;

#[derive(Clone, serde::Serialize)]
struct PortNumber {
    port_number: i32, // Integer
}

#[derive(Clone, serde::Serialize)]
struct DronePortPayload {
    payload: PortNumber,
}

#[derive(Clone, serde::Serialize)]
struct GroundRadarStrength {
    strength: f64, // Float in percentage
}

#[derive(Clone, serde::Serialize)]
struct DroneGroundRadarStrengthPayload {
    payload: GroundRadarStrength,
}

#[derive(Clone, serde::Serialize)]
struct Ammunition {
    ammunition_remaining: i32,
}

#[derive(Clone, serde::Serialize)]
struct DroneAmmunitionPayload {
    payload: Ammunition,
}

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
struct SystemStatusPayload {
    system_id: String,
    payload: mavlink::ardupilotmega::SYS_STATUS_DATA,
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
                        MavMessage::SYS_STATUS(data) => {
                            let system_id = header.system_id.to_string();
                            let payload = SystemStatusPayload {
                                system_id: system_id.clone(),
                                payload: data.clone(),
                            };

                            // Check Pre-Arm Check status
                            let pre_arm_status = data.onboard_control_sensors_health.bits()
                                & MAV_SYS_STATUS_PRE_ARM_CHECK;
                            if pre_arm_status != 0 {
                                // println!("Pre-Arm Check status: OK");
                                app.emit_all("pre_arm_check_status_ok", payload.clone())
                                    .unwrap();
                            } else {
                                // println!("Pre-Arm Check status: Error");
                                app.emit_all("pre_arm_check_status_error", payload.clone())
                                    .unwrap();
                            }

                            // Check gyro health
                            let gyro_status = data.onboard_control_sensors_health.bits()
                                & MAV_SYS_STATUS_SENSOR_3D_GYRO;
                            if gyro_status != 0 {
                                // println!("Gyroscope status: OK");
                                app.emit_all("gyroscope_status_ok", payload.clone())
                                    .unwrap();
                            } else {
                                // println!("Gyroscope status: Error");
                                app.emit_all("gyroscope_status_error", payload.clone())
                                    .unwrap();
                            }

                            // Check accelerometer health
                            let accel_status = data.onboard_control_sensors_health.bits()
                                & MAV_SYS_STATUS_SENSOR_3D_ACCEL;
                            if accel_status != 0 {
                                // println!("Accelerometer status: OK");
                                app.emit_all("accelerometer_status_ok", payload.clone())
                                    .unwrap();
                            } else {
                                // println!("Accelerometer status: Error");
                                app.emit_all("accelerometer_status_error", payload.clone())
                                    .unwrap();
                            }

                            // Check Magnetometer health
                            let mag_status = data.onboard_control_sensors_health.bits()
                                & MAV_SYS_STATUS_SENSOR_3D_MAG;
                            if mag_status != 0 {
                                // println!("Magnetometer status: OK");
                                app.emit_all("magnetometer_status_ok", payload.clone())
                                    .unwrap();
                            } else {
                                // println!("Magnetometer status: Error");
                                app.emit_all("magnetometer_status_error", payload.clone())
                                    .unwrap();
                            }

                            // Check Absolute Pressure status
                            let gps_status = data.onboard_control_sensors_health.bits()
                                & MAV_SYS_STATUS_SENSOR_GPS;
                            if gps_status != 0 {
                                // println!("Absolute Pressure status: OK");
                                app.emit_all("gps_ok", payload.clone()).unwrap();
                            } else {
                                // println!("Absolute Pressure status: Error");
                                app.emit_all("gps_error", payload.clone()).unwrap();
                            }

                            // Check Absolute Pressure status
                            let abs_pressure_status = data.onboard_control_sensors_health.bits()
                                & MAV_SYS_STATUS_SENSOR_ABSOLUTE_PRESSURE;
                            if abs_pressure_status != 0 {
                                // println!("Absolute Pressure status: OK");
                                app.emit_all("absolute_pressure_status_ok", payload.clone())
                                    .unwrap();
                            } else {
                                // println!("Absolute Pressure status: Error");
                                app.emit_all("absolute_pressure_status_error", payload.clone())
                                    .unwrap();
                            }

                            // Check Angular Rate Control status
                            let angular_rate_status = data.onboard_control_sensors_health.bits()
                                & MAV_SYS_STATUS_SENSOR_ANGULAR_RATE_CONTROL;
                            if angular_rate_status != 0 {
                                // println!("Angular Rate Control status: OK");
                                app.emit_all("angular_rate_control_status_ok", payload.clone())
                                    .unwrap();
                            } else {
                                // println!("Angular Rate Control status: Error");
                                app.emit_all("angular_rate_control_status_error", payload.clone())
                                    .unwrap();
                            }

                            // Check Altitude Stabilization status
                            let altitude_stabilization_status =
                                data.onboard_control_sensors_health.bits()
                                    & MAV_SYS_STATUS_SENSOR_ATTITUDE_STABILIZATION;
                            if altitude_stabilization_status != 0 {
                                // println!("Altitude Stabilization status: OK");
                                app.emit_all("altitude_stabilization_status_ok", payload.clone())
                                    .unwrap();
                            } else {
                                // println!("Altitude Stabilization status: Error");
                                app.emit_all(
                                    "altitude_stabilization_status_error",
                                    payload.clone(),
                                )
                                .unwrap();
                            }

                            // Check Yaw Position status
                            let yaw_position_status = data.onboard_control_sensors_health.bits()
                                & MAV_SYS_STATUS_SENSOR_YAW_POSITION;
                            if yaw_position_status != 0 {
                                // println!("Yaw Position status: OK");
                                app.emit_all("yaw_position_status_ok", payload.clone())
                                    .unwrap();
                            } else {
                                // println!("Yaw Position status: Error");
                                app.emit_all("yaw_position_status_error", payload.clone())
                                    .unwrap();
                            }

                            // Check Z Altitude Control status
                            let z_altitude_control_status =
                                data.onboard_control_sensors_health.bits()
                                    & MAV_SYS_STATUS_SENSOR_Z_ALTITUDE_CONTROL;
                            if z_altitude_control_status != 0 {
                                // println!("Z Altitude Control status: OK");
                                app.emit_all("z_altitude_control_status_ok", payload.clone())
                                    .unwrap();
                            } else {
                                // println!("Z Altitude Control status: Error");
                                app.emit_all("z_altitude_control_status_error", payload.clone())
                                    .unwrap();
                            }

                            // Check X/Y Position Control status
                            let xy_position_control_status =
                                data.onboard_control_sensors_health.bits()
                                    & MAV_SYS_STATUS_SENSOR_XY_POSITION_CONTROL;
                            if xy_position_control_status != 0 {
                                // println!("X/Y Position Control status: OK");
                                app.emit_all("xy_position_control_status_ok", payload.clone())
                                    .unwrap();
                            } else {
                                // println!("X/Y Position Control status: Error");
                                app.emit_all("xy_position_control_status_error", payload.clone())
                                    .unwrap();
                            }

                            // Check Motor Outputs/Control status
                            let motor_output_status = data.onboard_control_sensors_health.bits()
                                & MAV_SYS_STATUS_SENSOR_MOTOR_OUTPUTS;
                            if motor_output_status != 0 {
                                // println!("Motor Outputs/Control status: OK");
                                app.emit_all("motor_output_status_ok", payload.clone())
                                    .unwrap();
                            } else {
                                // println!("Motor Outputs/Control status: Error");
                                app.emit_all("motor_output_status_error", payload.clone())
                                    .unwrap();
                            }

                            // Check RC Receiver status
                            let rc_receiver_status = data.onboard_control_sensors_health.bits()
                                & MAV_SYS_STATUS_SENSOR_RC_RECEIVER;
                            if rc_receiver_status != 0 {
                                // println!("RC Receiver status: OK");
                                app.emit_all("rc_receiver_status_ok", payload.clone())
                                    .unwrap();
                            } else {
                                // println!("RC Receiver status: Error");
                                app.emit_all("rc_receiver_status_error", payload.clone())
                                    .unwrap();
                            }

                            // Check AHRS status
                            let ahrs_status =
                                data.onboard_control_sensors_health.bits() & MAV_SYS_STATUS_AHRS;
                            if ahrs_status != 0 {
                                // println!("AHRS status: OK");
                                app.emit_all("ahrs_status_ok", payload.clone()).unwrap();
                            } else {
                                // println!("AHRS status: Error");
                                app.emit_all("ahrs_status_error", payload.clone()).unwrap();
                            }

                            // Check Terrain status
                            let terrain_status =
                                data.onboard_control_sensors_health.bits() & MAV_SYS_STATUS_TERRAIN;
                            if terrain_status != 0 {
                                // println!("Terrain status: OK");
                                app.emit_all("terrain_status_ok", payload.clone()).unwrap();
                            } else {
                                // println!("Terrain status: Error");
                                app.emit_all("terrain_status_error", payload.clone())
                                    .unwrap();
                            }

                            // Check Battery status
                            let battery_status = data.onboard_control_sensors_health.bits()
                                & MAV_SYS_STATUS_SENSOR_BATTERY;
                            if battery_status != 0 {
                                // println!("Battery status: OK");
                                app.emit_all("battery_status_ok", payload.clone()).unwrap();
                            } else {
                                // println!("Battery status: Error");
                                app.emit_all("battery_status_error", payload.clone())
                                    .unwrap();
                            }

                            // Check Propulsion status
                            let propulsion_status = data.onboard_control_sensors_health.bits()
                                & MAV_SYS_STATUS_SENSOR_PROPULSION;
                            if propulsion_status != 0 {
                                // println!("Propulsion status: OK");
                                app.emit_all("propulsion_status_ok", payload.clone())
                                    .unwrap();
                            } else {
                                // println!("Propulsion status: Error");
                                app.emit_all("propulsion_status_error", payload.clone())
                                    .unwrap();
                            }

                            // Check GeoFence status
                            let geofence_status = data.onboard_control_sensors_health.bits()
                                & MAV_SYS_STATUS_GEOFENCE;
                            if geofence_status != 0 {
                                // println!("GeoFence status: OK");
                                app.emit_all("geofence_status_ok", payload.clone()).unwrap();
                            } else {
                                // println!("GeoFence status: Error");
                                app.emit_all("geofence_status_error", payload.clone())
                                    .unwrap();
                            }

                            // Check Logging status
                            let logging_status =
                                data.onboard_control_sensors_health.bits() & MAV_SYS_STATUS_LOGGING;
                            if logging_status != 0 {
                                // println!("Logging status: OK");
                                app.emit_all("logging_status_ok", payload.clone()).unwrap();
                            } else {
                                // println!("Logging status: Error");
                                app.emit_all("logging_status_error", payload.clone())
                                    .unwrap();
                            }

                            // Check Proximity status
                            let proximity_status = data.onboard_control_sensors_health.bits()
                                & MAV_SYS_STATUS_SENSOR_PROXIMITY;
                            if proximity_status != 0 {
                                // println!("Proximity status: OK");
                                app.emit_all("proximity_status_ok", payload.clone())
                                    .unwrap();
                            } else {
                                // println!("Proximity status: Error");
                                app.emit_all("proximity_status_error", payload.clone())
                                    .unwrap();
                            }
                        }
                        // MavMessage::DRONE_PORT_INT(data) => {
                        //     let system_id = header.system_id.to_string();
                        //     let payload = DronePortPayload {
                        //         payload: data.clone(),
                        //     };
                        //     app.emit_all(&format!("port_update_{system_id}"), payload).unwrap();
                        // }
                        // MavMessage::GROUND_RADAR_STRENGTH(data) => {
                        //     let system_id = header.system_id.to_string();
                        //     let payload = GroundRadarStrengthPayload {
                        //         payload: data.clone(),
                        //     };
                        //     app.emit_all(&format!("radar_strength_update_{system_id}"), payload).unwrap();
                        // }
                        // MavMessage::AMMUNITION(data) => {
                        //     let system_id = header.system_id.to_string();
                        //     let payload = AmmunitionPayload {
                        //         payload: data.clone(),
                        //     };
                        //     app.emit_all(&format!("ammunition_update_{system_id}"), payload).unwrap();
                        // }
                        MavMessage::BATTERY_STATUS(data) => {
                            print!("{:?}", data);
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
            fod_watcher::set_cleared,
            nokill::get_no_kill_zones,
            nokill::add_no_kill_zone,
            nokill::update_no_kill_zone
        ])
        .setup(|app| {
            let _ = app.app_handle();

            // thread::spawn(|| fod_watcher::watch(app_handle));
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
