import { Chip } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { DronePortPayload, PortNumber } from "../types/payloads";
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import CloudIcon from '@mui/icons-material/Cloud';

function PortDetecting() {
    return (
        <Chip
        icon={<CloudOutlinedIcon />}
        variant="outlined"
        color="warning"
        label="Detecting Port"
        />
    );
}

function PortDetected({ portn }: { portn: number }) {
    return (
      <Chip
        icon={<CloudIcon />}
        variant="outlined"
        color="success"
        label={`${portn}`}
      />
    );
  }

export default function DronePortIndicator({ id }: { id: string }) {
    const [portNumber, setPortNumber] = useState<null | PortNumber>(null);
    useEffect(() => {
      const promise = listen(`port_update_${id}`, (event) => {
        const payload = (event.payload as DronePortPayload).payload;
        setPortNumber(payload);
      });
      return () => {
        promise.then((remove) => remove());
      };
    }, []);
    const portElement = useMemo(() => {
      if (portNumber === null) return <PortDetecting />;
      else return <PortDetected portn={portNumber.port_number} />;
    }, [portNumber]);
  
    return portElement;
  }