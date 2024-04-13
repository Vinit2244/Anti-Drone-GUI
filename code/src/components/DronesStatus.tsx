import { useContext, useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { DroneStatus } from "./DroneStatus";
import { EnemyDroneStatus } from "./EnemyDroneStatus"
import { VitalStatus } from "./VitalStatus"
import { AmmunitionStatus } from "./AmmunitionStatus"
import { PhaseContext } from "../contexts/PhaseContext";
import { useSelector } from "@xstate/react";
import IconButton from "@mui/material/IconButton";
import RefreshIcon from "@mui/icons-material/Refresh";
import Box from "@mui/material/Box";
import { IsEnemyDrone } from "./IsEnemyDrone";

export function DronesStatus() {
  /**
   *  Component displaying friendly drone's status on sidebar
   */
  const [droneIDs, setDroneIDs] = useState([] as string[]);

  // hard coded
  // const [droneIDs, setDroneIDs] = useState(["1", "2"] as string[]);
 
  useEffect(() => {
    const promise = listen("heartbeat", (event) => {
      const id = (event.payload as { system_id: string }).system_id;
      setDroneIDs((prevDroneIDs) => {
        if (prevDroneIDs.find((droneID) => droneID === id) === undefined)
          return [...prevDroneIDs, id];
        return prevDroneIDs;
      });
    });
    return () => {
      promise.then((remove) => remove());
    };
  }, []);
  const phaseServices = useContext(PhaseContext);
  const { send } = phaseServices.phaseService;
  const disableSelection = useSelector(
    phaseServices.phaseService,
    (state) => !state.matches("Connected.Initial")
  );

  /*
   * Get list of friendly drones
   */
  const friendlyDroneIDs = droneIDs.filter(
    (id) => !IsEnemyDrone(+id) && +id != 255
  );

  /*
   * Get list of rogue drones
   */
  const rogueDroneIDs = droneIDs.filter(
    (id) => IsEnemyDrone(+id) && +id != 255
  );

  return (
    <Box width="100%" height="100%">
      <Stack
        direction="row"
        justifyContent="space-between"
        width="90%"
        margin="auto"
        paddingY="15px"
        height="70px">
        <Button
          variant="outlined"
          disabled={disableSelection}
          color="primary"
          onClick={() => {
            send({
              type: "Set Selected Drones",
              newDrones: droneIDs.map((droneID) => +droneID),
            });
          }}>
          Select All
        </Button>
        <IconButton
          onClick={() => {
            setDroneIDs([]);
          }}>
          <RefreshIcon />
        </IconButton>
        <Button
          variant="outlined"
          color="secondary"
          disabled={disableSelection}
          onClick={() => {
            send({
              type: "Set Selected Drones",
              newDrones: [],
            });
          }}>
          Deselect All
        </Button>
      </Stack>
      <Box
        gap={2}
        width="100%"
        style={{ height: "calc(100% - 70px)" }}
        overflow="scroll">
        <Box
          marginBottom="3%"
          key={friendlyDroneIDs[0]}
          display="grid"
          sx={{ placeItems: "center" }}>
          <DroneStatus id={friendlyDroneIDs[0]} />
        </Box>
        <Box
          marginBottom="3%"
          key={"Enemy Drone"}
          display="grid"
          sx={{ placeItems: "center" }}>
          <EnemyDroneStatus id={rogueDroneIDs[0]} />
        </Box>
        <Box
          marginBottom="3%"
          key={"Vital Status"}
          display="grid">
          <VitalStatus id={friendlyDroneIDs[0]} />
        </Box>
        <Box
          marginBottom="3%"
          key={"Ammunition Status"}
          display="grid">
          <AmmunitionStatus id={friendlyDroneIDs[0]} />
        </Box>
      </Box>
    </Box>
  );
}
