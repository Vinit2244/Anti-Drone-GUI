import { useContext, useState } from "react";
import {
  Box,
  Chip,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";
import { ReactComponent as DroneIcon } from "../assets/drone.svg";
import { useSelector } from "@xstate/react";
import { selectColor } from "../colorCode";
import { MapControlContext } from "../contexts/MapControlContext";
import EnemyDroneGPSStatus from "./EnemyDroneGPSStatus";
import DronePortIndicator from "./DronePortIndicator";
import DroneGroundRadarStrengthIndicator from "./DroneGroundRadarStrengthIndicator"
import DroneAmmunitionIndicator from "./DroneAmmunitionIndicator"

export function VitalStatus({ id }: { id: string }) {
  const [alerts, setAlerts] = useState([] as string[]);
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
        // disabled={!connected}
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
