import Chip from "@mui/material/Chip";
import { useMemo, useState, useEffect, useContext } from "react";
import { listen } from "@tauri-apps/api/event";
import { PositionUpdatePayload } from "../types/payloads";
import { AddAlertContext } from "../contexts/AlertContext";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocationOffIcon from "@mui/icons-material/LocationOff";
import { Tooltip } from "@mui/material";

function ConnectedStatus({ satellitesVisible }: { satellitesVisible: number }) {
  return (
    <Chip
      icon={<LocationOnIcon />}
      variant="outlined"
      color="success"
      label={`Sat: ${
        satellitesVisible === 255 ? "Unknown" : satellitesVisible
      }`}
    />
  );
}
function DetectingStatus({ satellitesVisible }: { satellitesVisible: number }) {
  return (
    <Chip
      icon={<LocationOnIcon />}
      variant="outlined"
      color="warning"
      label={`Sat: ${
        satellitesVisible === 255 ? "Unknown" : satellitesVisible
      }`}
    />
  );
}

function DisconnectedStatus({
  satellitesVisible,
}: {
  satellitesVisible: number;
}) {
  return (
    <Chip
      icon={<LocationOffIcon />}
      variant="outlined"
      color="error"
      label={`Sat: ${
        satellitesVisible === 255 ? "Unknown" : satellitesVisible
      }`}
    />
  );
}

export default function DroneGPSStatus({ id }: { id: string }) {
  const [active, setActive] = useState(
    "detecting" as "detecting" | "active" | "inactive"
  );
  const [satellitesVisible, setSatellitesVisible] = useState(255);
  useEffect(() => {
    const promise = listen(`gps_status_${id}`, (event) => {
      let payload = event.payload as { satellites_visible: number };
      setSatellitesVisible(payload.satellites_visible);
    });
    return () => {
      promise.then((remove) => remove());
    };
  }, []);
  useEffect(() => {
    const promise = listen(`gps_detected_${id}`, () => {
      setActive("active");
    });
    return () => {
      promise.then((remove) => remove());
    };
  }, []);
  useEffect(() => {
    const promise = listen(`no_gps_${id}`, () => {
      setActive("inactive");
    });
    return () => {
      promise.then((remove) => remove());
    };
  }, []);
  const statusComponent = useMemo(() => {
    switch (active) {
      case "active":
        return <ConnectedStatus satellitesVisible={satellitesVisible} />;
      case "inactive":
        return <DisconnectedStatus satellitesVisible={satellitesVisible} />;
      case "detecting":
        return <DetectingStatus satellitesVisible={satellitesVisible} />;
    }
  }, [active]);
  return statusComponent;
}
