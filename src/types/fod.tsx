export interface ForeignObject {
  cleared: boolean;
  latitude: number;
  longitude: number;
  object_id: string;
  object_label: string;
  image_path: string;
}

export interface RustTime {
  nanos_since_epoch: number;
  secs_since_epoch: number;
}

export interface PartialMissionFODData {
  mission_start_time: RustTime;
  mission_end_time: RustTime;
  mission_name: string;
}

export interface MissionFODData extends PartialMissionFODData {
  detected_objects: ForeignObject[];
}
