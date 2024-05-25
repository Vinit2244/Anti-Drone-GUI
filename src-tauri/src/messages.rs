use super::arkana;
use super::ftp;
use mavlink::ardupilotmega::MavMessage;
use std::time::Duration;
use std::time::{SystemTime, UNIX_EPOCH};

pub fn heartbeat_message() -> MavMessage {
    MavMessage::HEARTBEAT(mavlink::ardupilotmega::HEARTBEAT_DATA {
        custom_mode: 0,
        mavtype: mavlink::ardupilotmega::MavType::MAV_TYPE_GCS,
        autopilot: mavlink::ardupilotmega::MavAutopilot::MAV_AUTOPILOT_INVALID,
        base_mode: mavlink::ardupilotmega::MavModeFlag::empty(),
        system_status: mavlink::ardupilotmega::MavState::MAV_STATE_STANDBY,
        mavlink_version: 0x3,
    })
}

pub fn ftp_message(
    target_network: u8,
    target_system: u8,
    target_component: u8,
    ftp_payload: &ftp::FtpPayload,
) -> MavMessage {
    MavMessage::FILE_TRANSFER_PROTOCOL(mavlink::ardupilotmega::FILE_TRANSFER_PROTOCOL_DATA {
        target_network,
        target_system,
        target_component,
        payload: ftp_payload.as_bytes(),
    })
}

pub fn set_message_interval(
    target_system: u8,
    message_id: f32,
    message_interval: Duration,
) -> MavMessage {
    MavMessage::COMMAND_LONG(mavlink::ardupilotmega::COMMAND_LONG_DATA {
        target_component: 0,
        target_system: target_system,
        confirmation: 0,
        command: mavlink::ardupilotmega::MavCmd::MAV_CMD_SET_MESSAGE_INTERVAL,
        param1: message_id,
        param2: message_interval.as_secs_f32() * 1e6,
        param3: 0.0,
        param4: 0.0,
        param5: 0.0,
        param6: 0.0,
        param7: 0.0,
    })
}

pub fn command_message(command: &str) -> MavMessage {
    let mut v: [u8; 240] = [0; 240];
    let text_bytes = command.as_bytes();
    v[..text_bytes.len()].copy_from_slice(text_bytes);
    let start = SystemTime::now();
    let since_the_epoch = start
        .duration_since(UNIX_EPOCH)
        .expect("Time went backwards");

    MavMessage::SWARM_CONTROL(mavlink::ardupilotmega::SWARM_CONTROL_DATA {
        timestamp: since_the_epoch.as_secs() as u32,
        json_payload: v,
    })

    // let mut vec = heapless::Vec::<u8, 50>::new();
    // vec.extend("hello world".as_bytes().iter().cloned());
    // mavlink::ardupilotmega::MavMessage::STATUSTEXT(mavlink::ardupilotmega::STATUSTEXT_DATA {
    //     severity: mavlink::ardupilotmega::MavSeverity::MAV_SEVERITY_DEBUG,
    //     text: v,
    // })
}

pub fn swarm_control_message(payload: &arkana::SwarmControlMessagePayload) -> MavMessage {
    let mut v: [u8; 240] = [0; 240];
    let text_bytes = serde_json::to_vec(payload).unwrap();
    v[..text_bytes.len()].copy_from_slice(&text_bytes);
    let start = SystemTime::now();
    let since_the_epoch = start
        .duration_since(UNIX_EPOCH)
        .expect("Time went backwards");
    MavMessage::SWARM_CONTROL(mavlink::ardupilotmega::SWARM_CONTROL_DATA {
        timestamp: since_the_epoch.as_secs() as u32,
        json_payload: v,
    })
}
