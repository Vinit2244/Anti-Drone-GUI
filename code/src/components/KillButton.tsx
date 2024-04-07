/**
 * Kill Button Component
 */
import { IsEnemyDrone } from "./IsEnemyDrone";
import Button from "@mui/material/Button";
import { isNotInNoKillZone } from "./IsNotInNoKillZone";
import { NoKillZone } from "../types/payloads";
import { useState } from "react";
import { invoke } from "@tauri-apps/api";

export function KillButton({
  id,
  initialLonLat,
  noKillZones,
}: {
  id: string;
  initialLonLat: [number, number];
  noKillZones: NoKillZone[];
}) {
  /*
   * Kill Button Component
   */
  const enemyDrone = true;
  const notInNoKillZone = isNotInNoKillZone(initialLonLat, noKillZones);
  const [hovered, setHovered] = useState(false);

  let buttonText = "";

  if (hovered) {
    if (notInNoKillZone) {
      buttonText += "Kill";
    } else {
      buttonText += "No Kill Zone";
    }
  } else {
    if (enemyDrone) {
      buttonText = "Kill";
    } else {
      buttonText = "Friendly";
    }
  }

  const handleClick = () => {
    if (notInNoKillZone) {
      invoke("kill_drone", { id: +id });
    }
  };

  return (
    <Button
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        color: enemyDrone ? "black" : "black",
        bgcolor: enemyDrone ? "error.main" : "#90EE90",
        "&:hover": {
          bgcolor: notInNoKillZone ? "error.dark" : "#FF6347",
          opacity: notInNoKillZone ? 1 : 0.5,
        },
      }}>
      {buttonText}
    </Button>
  );
}
