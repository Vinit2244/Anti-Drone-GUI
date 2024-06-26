import { Chip } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import {
  DroneGroundRadarStrengthPayload,
  GroundRadarStrength,
} from "../types/payloads";
import RadarIcon from "@mui/icons-material/Radar";

function GroundRadarStrengthDetecting() {
  return (
    <Chip
      icon={<RadarIcon />}
      variant="outlined"
      color="warning"
      label="Detecting"
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: 'auto', // Adjust height as per requirement
        width: "25vh", // Adjust width as per requirement
        padding: '8px', // Adjust padding as per requirement
      }}
    />
  );
}

function GroundRadarDetected({ radars }: { radars: number }) {
  return (
    <Chip
      icon={<RadarIcon />}
      variant="outlined"
      color="success"
      label={`${radars}%`}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: 'auto', // Adjust height as per requirement
        width: "25vh", // Adjust width as per requirement
        padding: '8px', // Adjust padding as per requirement
      }}
    />
  );
}

export default function DroneGroundRadarStrengthIndicator({
  id,
}: {
  id: string;
}) {
  const [radarStrength, setRadarStrength] =
    useState<null | GroundRadarStrength>(null);
  useEffect(() => {
    const promise = listen(`radar_strength_update_${id}`, (event) => {
      const payload = (event.payload as DroneGroundRadarStrengthPayload)
        .payload;
      setRadarStrength(payload);
    });
    return () => {
      promise.then((remove) => remove());
    };
  }, []);
  const groundRadarStrengthElement = useMemo(() => {
    if (radarStrength === null) return <GroundRadarStrengthDetecting />;
    else return <GroundRadarDetected radars={radarStrength.strength} />;
  }, [radarStrength]);

  return groundRadarStrengthElement;
}
