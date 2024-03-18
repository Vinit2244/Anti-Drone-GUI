/*
 *  Component displaying friendly drone's status on sidebar
 */

import { useContext, useEffect, useState } from "react";
import { emit, listen } from "@tauri-apps/api/event";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { DroneStatus } from "./DroneStatus";
import { PhaseContext } from "../contexts/PhaseContext";
import { useSelector } from "@xstate/react";
import { DroneStatusSkeleton } from "./DroneStatusSkeleton";
import { IsEnemyDrone } from "./IsEnemyDrone";
import IconButton from "@mui/material/IconButton";
import RefreshIcon from "@mui/icons-material/Refresh";
import { invoke } from "@tauri-apps/api";
import Box from "@mui/material/Box";

export function DronesStatus() {
  /**
   *  Component displaying friendly drone's status on sidebar
   */
  const [droneIDs, setDroneIDs] = useState([] as string[]);

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

  // const friendlyDroneIDs = droneIDs.filter(
  //   (id) => !IsEnemyDrone(+id)
  // );

  return (
    <Box width="100%" height="100%">
      <Stack
        direction="row"
        // height="20%"
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
            // invoke("set_messages_stream", { systemId: 0 });
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
        {friendlyDroneIDs.map((id) => (
          <Box
            marginBottom="10px"
            key={id}
            display="grid"
            sx={{ placeItems: "center" }}>
            <DroneStatus id={id} />
          </Box>
        ))}
        {droneIDs.length < 10
          ? Array.from({ length: 10 - droneIDs.length }, (e, i) => (
              <Box
                marginBottom="10px"
                key={i.toString() + "dummy"}
                display="grid"
                sx={{ placeItems: "center" }}>
                <DroneStatusSkeleton label="Empty Drone Slot" />
              </Box>
            ))
          : null}
      </Box>
    </Box>
  );
}
