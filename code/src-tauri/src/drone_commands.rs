use std::{
    collections::HashMap,
    sync::{Arc, Mutex, RwLock},
    time::{Duration, Instant},
};

use mavlink::{ardupilotmega::MavMessage, MavHeader};

use crate::messages;
use crate::AppState;

const COMMAND_RETRIES: usize = 3;
const COMMAND_TIMEOUT: Duration = Duration::from_millis(100);

#[tauri::command]
pub async fn kill_motors(app_state: tauri::State<'_, AppState>) -> Result<(), String> {
    let vehicle = app_state.get_vehicle()?;
    vehicle
        .send_default(&MavMessage::COMMAND_LONG(
            mavlink::ardupilotmega::COMMAND_LONG_DATA {
                target_component: 0,
                target_system: 0,
                command: mavlink::ardupilotmega::MavCmd::MAV_CMD_DO_FLIGHTTERMINATION,
                param1: 1.0,
                param2: 0.0,
                param3: 0.0,
                param4: 0.0,
                param5: 0.0,
                param6: 0.0,
                param7: 0.0,
                confirmation: 0,
            },
        ))
        .unwrap();
    Ok(())
}

#[tauri::command]
pub async fn set_messages_stream(
    app_state: tauri::State<'_, AppState>,
    system_id: u8,
) -> Result<(), String> {
    let vehicle = app_state.get_vehicle()?;
    vehicle
        .send_default(&messages::set_message_interval(
            system_id,
            33.0,
            Duration::from_secs(1),
        ))
        .unwrap();
    vehicle
        .send_default(&messages::set_message_interval(
            system_id,
            147.0,
            Duration::from_secs(5),
        ))
        .unwrap();

    vehicle
        .send_default(&messages::set_message_interval(
            system_id,
            24.0,
            Duration::from_secs(5),
        ))
        .unwrap();
    vehicle
        .send_default(&messages::set_message_interval(
            system_id,
            245.0,
            Duration::from_secs(5),
        ))
        .unwrap();
    Ok(())
}

fn all_acknowledged(acknowledged: &HashMap<u8, bool>) -> bool {
    acknowledged.iter().fold(true, |acc, x| acc && *x.1)
}

fn acknowledged_send_multiple<F>(
    vehicle: &Arc<Box<dyn mavlink::MavConnection<MavMessage> + Send + Sync>>,
    receiver_mutex: Arc<Mutex<crossbeam_channel::Receiver<(MavHeader, MavMessage)>>>,
    broadcast_message: &MavMessage,
    receiver_system_ids: &[u8],
    keep_alive: Arc<RwLock<bool>>,
    acknowledge_identifier: F,
) -> HashMap<u8, bool>
where
    F: Fn(MavMessage) -> bool,
{
    let mut acknowledged = HashMap::new();
    for system_id in receiver_system_ids {
        acknowledged.insert(*system_id, false);
    }
    let mut retry_counter = 0_usize;
    while !all_acknowledged(&acknowledged) && retry_counter < COMMAND_RETRIES {
        vehicle.send_default(broadcast_message).unwrap();
        let timer_start = Instant::now();
        while Instant::now().duration_since(timer_start) < COMMAND_TIMEOUT
            && !all_acknowledged(&acknowledged)
            && *keep_alive.read().unwrap()
        {
            match (*receiver_mutex.lock().unwrap()).try_recv() {
                Ok((header, message)) => {
                    if acknowledge_identifier(message) {
                        acknowledged.insert(header.system_id, true);
                    }
                }
                _ => {}
            }
        }
        retry_counter += 1;
    }
    acknowledged
}

#[tauri::command]
pub async fn set_mode(
    app_state: tauri::State<'_, AppState>,
    mode: f32,
    system_ids: Vec<u8>,
) -> Result<HashMap<u8, bool>, String> {
    let vehicle = app_state.get_vehicle()?;
    let mode_ack_receiver_mutex = app_state.get_mode_ack_receiver()?;
    let keep_alive = app_state.get_keep_alive()?;
    loop {
        match mode_ack_receiver_mutex.lock().unwrap().try_recv() {
            Err(crossbeam_channel::TryRecvError::Disconnected) => return Err("Disconnected".into()),
            Err(crossbeam_channel::TryRecvError::Empty) => {
                break;
            }
            _ => {}
        }
    }
    let message = MavMessage::COMMAND_LONG(mavlink::ardupilotmega::COMMAND_LONG_DATA {
        target_component: 0,
        target_system: 0,
        command: mavlink::ardupilotmega::MavCmd::MAV_CMD_DO_SET_MODE,
        param1: 1.0,
        param2: mode,
        param3: 0.0,
        param4: 0.0,
        param5: 0.0,
        param6: 0.0,
        param7: 0.0,
        confirmation: 0,
    });
    Ok(acknowledged_send_multiple(
        &vehicle,
        mode_ack_receiver_mutex,
        &message,
        &system_ids,
        keep_alive,
        |message: MavMessage| match message {
            MavMessage::COMMAND_ACK(ack_data) => {
                ack_data.command == mavlink::ardupilotmega::MavCmd::MAV_CMD_DO_SET_MODE
            }
            MavMessage::HEARTBEAT(h) => h.custom_mode as f32 == mode,
            _ => false,
        },
    ))
}
