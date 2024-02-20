import { useEffect, useMemo, useState } from "react";
import { BatteryUpdatePayload, BatteryState } from "../types/payloads";
import { listen } from "@tauri-apps/api/event";
import { Chip } from "@mui/material";
import BatteryUnknownIcon from "@mui/icons-material/BatteryUnknown";
import Battery20Icon from "@mui/icons-material/Battery20";
import { Battery50, BatteryFull } from "@mui/icons-material";

function BatteryDetecting() {
  return (
    <Chip
      icon={<BatteryUnknownIcon />}
      variant="outlined"
      color="warning"
      label="Detecting"
    />
  );
}

function BatteryLow({ percentage }: { percentage: number }) {
  return (
    <Chip
      icon={<Battery20Icon />}
      variant="outlined"
      color="error"
      label={`${percentage}%`}
    />
  );
}

function BatteryMedium({ percentage }: { percentage: number }) {
  return (
    <Chip
      icon={<Battery50 />}
      variant="outlined"
      color="warning"
      label={`${percentage}%`}
    />
  );
}

function BatteryHigh({ percentage }: { percentage: number }) {
  return (
    <Chip
      icon={<BatteryFull />}
      variant="outlined"
      color="success"
      label={`${percentage}%`}
    />
  );
}

export default function BatteryStatus() {
  const [batteryState, setBatteryState] = useState<null | BatteryState>(null);
  useEffect(() => {
    const promise = listen("battery_update", (event) => {
      const payload = (event.payload as BatteryUpdatePayload).payload;
      setBatteryState(payload);
    });
    return () => {
      promise.then((remove) => remove());
    };
  }, []);
  const batteryElement = useMemo(() => {
    if (batteryState === null) return <BatteryDetecting />;
    else if (batteryState.battery_remaining <= 20)
      return <BatteryLow percentage={batteryState.battery_remaining} />;
    else if (batteryState.battery_remaining > 50)
      return <BatteryHigh percentage={batteryState.battery_remaining} />;
    else return <BatteryMedium percentage={batteryState.battery_remaining} />;
  }, [batteryState]);

  return batteryElement;
}
