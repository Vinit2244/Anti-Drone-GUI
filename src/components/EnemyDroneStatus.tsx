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

export function EnemyDroneStatus({ id }: { id: string }) {
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
                Enemy Drone
              </Typography>
            <Box
            height={"20px"}></Box>
            <Stack
              direction="row"
              gap={1}
              alignItems="center"
              justifyContent="space-evenly"
            >
              <Chip
                variant={mapSelected ? "filled" : "outlined"}
                sx={
                  mapSelected
                    ? {
                        marginLeft: "5px",
                        backgroundColor: selectColor(+id),
                        transition: "all 100ms linear",
                        "&:hover": {
                          backgroundColor: selectColor(+id),
                          filter: "contrast(140%)",
                        },
                      }
                    : {
                        marginLeft: "5px",
                        color: selectColor(+id),
                        borderColor: selectColor(+id),
                      }
                }
                // onClick={() => {
                //   mapSelected
                //     ? mapControlSend("Deselect")
                //     : mapControlSend({
                //         type: "Select Drone",
                //         newSelectedDrone: id,
                //       });
                // }}
                label={
                  <Stack direction="row">
                    <SvgIcon component={DroneIcon} inheritViewBox />
                    <Typography>: {id}</Typography>
                  </Stack>
                }
              />

              {/* <DroneBatteryIndicator id={id} /> */}
              <EnemyDroneGPSStatus id={id} />

            </Stack>
            {/* <Stack
              direction="row"
              gap={1}
              alignItems="center"
              justifyContent="space-evenly"
            >
              <DronePortIndicator id={id}/>
              <DroneGroundRadarStrengthIndicator id={id}/>
              <DroneAmmunitionIndicator id={id}/>
            </Stack> */}
          </Stack>
        }
      />
    </>
  );
}
