export interface PositionUpdatePayload {
  payload: {
    alt: number;
    hdg: number;
    lat: number;
    lon: number;
    relative_alt: number;
    time_boot_ms: number;
    vx: number;
    vy: number;
    vz: number;
  };
  system_id: string;
}

enum MAV_BATTERY_FUNCTION {
  MAV_BATTERY_FUNCTION_UNKNOWN = 0,
  MAV_BATTERY_FUNCTION_ALL = 1,
  MAV_BATTERY_FUNCTION_PROPULSION = 2,
  MAV_BATTERY_FUNCTION_AVIONICS = 3,
  MAV_BATTERY_FUNCTION_PAYLOAD = 4,
}

export interface BatteryState {
  battery_function: MAV_BATTERY_FUNCTION;
  temperature: number;
  battery_remaining: number;
  time_remaining: number;
}

// Port number struct
export interface PortNumber {
  port_number: number; // Integer
}

// Ground Radar Strength struct
export interface GroundRadarStrength {
  strength: number; // Float in percentage
}

// Ammunition struct
export interface Ammunition {
  ammunition_remaining: number;
}

export interface HeartbeatPayload {
  system_id: string;
  custom_mode: number;
  system_status: { type: string };
}

export interface LandedStatePayload {
  landed_state: {
    type:
      | "MAV_LANDED_STATE_UNDEFINED"
      | "MAV_LANDED_STATE_ON_GROUND"
      | "MAV_LANDED_STATE_IN_AIR"
      | "MAV_LANDED_STATE_TAKEOFF"
      | "MAV_LANDED_STATE_LANDING";
  };
}

export interface BatteryUpdatePayload {
  payload: BatteryState;
}

// Payload for port number
export interface DronePortPayload {
  payload: PortNumber;
}

// Payload for Ground Radar Strength
export interface DroneGroundRadarStrengthPayload {
  payload: GroundRadarStrength;
}

// Payload for ammunition
export interface DroneAmmunitionPayload {
  payload: Ammunition;
}

export interface SerialCommLink {
  Serial: { baud_rate: number; pid: number; vid: number };
}

export interface TcpCommLink {
  Tcp: { url: string };
}

export interface UdpCommLink {
  Udp: { url: string };
}

export interface CommLink {
  auto_connect: boolean;
  comm_link_type: SerialCommLink | TcpCommLink | UdpCommLink;
  name: string;
}

export interface NoKillZone {
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
}
