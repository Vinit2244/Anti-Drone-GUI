use std::collections::HashMap;

use mavlink::ardupilotmega::{MavMessage, MavSeverity, STATUSTEXT_DATA};
use serde::{Deserialize, Serialize};

use crate::AppState;

const MESSAGE_SIZE: usize = 50;

#[derive(Serialize, Deserialize)]
#[serde(tag = "cmd")]
#[derive(Debug)]
pub enum Commands {
    #[serde(rename = "1")]
    LAUNCH {
        alt: f64,
        #[serde(flatten)]
        extra: HashMap<String, serde_json::Value>,
    },
    #[serde(rename = "3")]
    LAND {
        alt: f64,
        #[serde(flatten)]
        extra: HashMap<String, serde_json::Value>,
    },
    #[serde(rename = "2")]
    MODE {
        mode: String,
        #[serde(flatten)]
        extra: HashMap<String, serde_json::Value>,
    },
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SwarmControlMessagePayload {
    #[serde(flatten)]
    pub command: Commands,
}

impl SwarmControlMessagePayload {
    pub fn encode(&self) -> [u8; MESSAGE_SIZE] {
        let mut payload = [0_u8; MESSAGE_SIZE];
        let json_encoded_bytes = serde_json::to_vec(&self).unwrap();
        println!("encoded: {}", serde_json::to_string(&self).unwrap());
        payload[..json_encoded_bytes.len()].copy_from_slice(&json_encoded_bytes);
        payload
    }

    pub fn decode(payload_bytes: &[u8; MESSAGE_SIZE]) -> Result<Self, Box<dyn std::error::Error>> {
        let decoded_str = std::str::from_utf8(payload_bytes)?.trim_end_matches('\0');
        println!("decoded: {}", decoded_str);
        Ok(serde_json::from_str(decoded_str)?)
    }
}

#[tauri::command]
pub async fn launch(app_state: tauri::State<'_, AppState>) -> Result<(), String> {
    let vehicle = app_state.get_vehicle()?;

    vehicle
        .send_default(&MavMessage::STATUSTEXT(STATUSTEXT_DATA {
            severity: MavSeverity::MAV_SEVERITY_DEBUG,
            text: SwarmControlMessagePayload {
                command: Commands::LAUNCH {
                    alt: 1.0,
                    extra: HashMap::new(),
                },
            }
            .encode(),
        }))
        .unwrap();
    Ok(())
}

#[tauri::command]
pub async fn land(app_state: tauri::State<'_, AppState>) -> Result<(), String> {
    let vehicle = app_state.get_vehicle()?;

    vehicle
        .send_default(&MavMessage::STATUSTEXT(STATUSTEXT_DATA {
            severity: MavSeverity::MAV_SEVERITY_DEBUG,
            text: SwarmControlMessagePayload {
                command: Commands::LAND {
                    alt: 0.0,
                    extra: HashMap::new(),
                },
            }
            .encode(),
        }))
        .unwrap();
    Ok(())
}
