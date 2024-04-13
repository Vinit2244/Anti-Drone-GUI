import { Chip } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { DroneAmmunitionPayload, Ammunition } from "../types/payloads";
import WhatshotOutlinedIcon from '@mui/icons-material/WhatshotOutlined';
import WhatshotIcon from '@mui/icons-material/Whatshot';

// Detecting Code

// function AmmunitionDetecting() {
//     return (
//         <Chip
//         icon={<WhatshotOutlinedIcon />}
//         variant="outlined"
//         color="warning"
//         label="Detecting Ammo"
//         style={{
//           width: '33vw', // Adjust width as per requirement
//         }}
//         />
//     );
// }

// function AmmunitionDetected({ ammo, count }: { ammo: string, count: string }) {
//     return (
//       <Chip
//         icon={<WhatshotIcon />}
//         variant="outlined"
//         color="success"
//         label={`Id: ${ammo} , Count: ${count}`}
//         style={{
//           width: '33vw', // Adjust width as per requirement
//         }}
//       />
//     );
//   }

// export default function DroneAmmunitionIndicator({ id, count }: { id: string, count: string }) {
//     const [ammunition, setAmmunition] = useState<null | Ammunition>(null);
//     useEffect(() => {
//       const promise = listen(`ammunition_update_${id}`, (event) => {
//         const payload = (event.payload as DroneAmmunitionPayload).payload;
//         setAmmunition(payload);
//       });
//       return () => {
//         promise.then((remove) => remove());
//       };
//     }, []);
//     const ammunitionElement = useMemo(() => {
//       if (ammunition === null) return <AmmunitionDetecting />;
//       else return <AmmunitionDetected ammo={id} count={count} />;
//     }, [ammunition]);
  
//     return ammunitionElement;
// }

// Showing Count Code

function AmmunitionDetected({ ammo, count }: { ammo: string, count: string }) {
  return (
    <Chip
      icon={<WhatshotIcon />}
      variant="outlined"
      color="success"
      label={`Id: ${ammo} , Count: ${count}`}
      style={{
        width: '33vw', // Adjust width as per requirement
      }}
    />
  );
}

export default function DroneAmmunitionIndicator({ id, count }: { id: string, count: string }) {
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
    return <AmmunitionDetected ammo={id} count={count} />;
  }, [ammunition]);

  return ammunitionElement;
}