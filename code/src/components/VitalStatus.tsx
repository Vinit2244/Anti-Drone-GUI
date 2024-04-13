import {
  Box,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import DronePortIndicator from "./DronePortIndicator";
import DroneGroundRadarStrengthIndicator from "./DroneGroundRadarStrengthIndicator"
import { useContext, useEffect, useState } from "react";
import { useSelector } from "@xstate/react";
import { MapControlContext } from "../contexts/MapControlContext";

export function VitalStatus({ id }: { id: string }) {
  const [connected, setConnected] = useState(true);
  const [alerts, setAlerts] = useState([] as string[]);
  const [mode, setMode] = useState(100);
  const [state, setState] = useState("Unknown");
  const [landedState, setLandedState] = useState(
    undefined as undefined | string
  );
  const addAlert = (alert: string) => {
    setAlerts((newAlerts) => {
      console.log(newAlerts);
      return [alert, ...newAlerts];
    });
  };
  const setTimeoutHandler = useState<NodeJS.Timeout | undefined>(undefined)[1];

  const { mapControlService } = useContext(MapControlContext);
  const { send: mapControlSend } = mapControlService;
  const mapSelected = useSelector(
    mapControlService,
    (state) =>
      state.matches("Drone Selected") && state.context.selectedID === id
  );

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  return (
    <>
      <Chip
        sx={{ height: "130px", width: "90%", margin: "auto" }}
        color={"success"}
        disabled={!connected}
        variant="outlined"
        label={
          <Stack>
              <Typography
                textAlign="center"
                width="85%"
                margin="auto"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                Vital Status
              </Typography>
              <Box height={10}></Box>
            <Stack
              direction="row"
              gap={1}
              alignItems="center"
              justifyContent="space-evenly"
            >
              <DronePortIndicator id={id}/>
              <DroneGroundRadarStrengthIndicator id={id}/>
            </Stack>
          </Stack>
        }
      />
    </>
  );
}
