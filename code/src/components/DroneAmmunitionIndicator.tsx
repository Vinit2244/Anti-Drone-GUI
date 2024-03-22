import { Chip } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { DroneAmmunitionPayload, Ammunition } from "../types/payloads";
import WhatshotOutlinedIcon from '@mui/icons-material/WhatshotOutlined';
import WhatshotIcon from '@mui/icons-material/Whatshot';

function AmmunitionDetecting() {
    return (
        <Chip
        icon={<WhatshotOutlinedIcon />}
        variant="outlined"
        color="warning"
        label="Detecting Ammo"
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: 'auto', // Adjust height as per requirement
          width: 'fit-content', // Adjust width as per requirement
          padding: '8px', // Adjust padding as per requirement
        }}
        />
    );
}

function AmmunitionDetected({ ammo }: { ammo: number }) {
    return (
      <Chip
        icon={<WhatshotIcon />}
        variant="outlined"
        color="success"
        label={`${ammo}`}
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: 'auto', // Adjust height as per requirement
          width: 'fit-content', // Adjust width as per requirement
          padding: '8px', // Adjust padding as per requirement
        }}
      />
    );
  }

export default function DroneAmmunitionIndicator({ id }: { id: string }) {
    const [ammunition, setAmmunition] = useState<null | Ammunition>(null);
    useEffect(() => {
      const promise = listen(`ammunition_update_${id}`, (event) => {
        const payload = (event.payload as DroneAmmunitionPayload).payload;
        setAmmunition(payload);
      });
      return () => {
        promise.then((remove) => remove());
      };
    }, []);
    const ammunitionElement = useMemo(() => {
      if (ammunition === null) return <AmmunitionDetecting />;
      else return <AmmunitionDetected ammo={ammunition.ammunition_remaining} />;
    }, [ammunition]);
  
    return ammunitionElement;
}