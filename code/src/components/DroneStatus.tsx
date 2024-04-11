import React, { useContext, useEffect, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import ScheduleSharpIcon from "@mui/icons-material/ScheduleSharp";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Modal,
  Stack,
  SvgIcon,
} from "@mui/material";
import { ReactComponent as DroneIcon } from "../assets/drone.svg";
import Checkbox from "@mui/material/Checkbox";
import { PhaseContext } from "../contexts/PhaseContext";
import { useSelector } from "@xstate/react";
import Tooltip from "@mui/material/Tooltip";
import { FLIGHT_MODES } from "../constants/flight_modes";
import { listen } from "@tauri-apps/api/event";

const DISCONNECT_INTERVAL = 5000; //ms
import { selectColor } from "../colorCode";
import { MapControlContext } from "../contexts/MapControlContext";
import DroneBatteryIndicator from "./DroneBatteryIndicator";
import DroneGPSStatus from "./DroneGPSStatus";
import { HeartbeatPayload, LandedStatePayload } from "../types/payloads";

export function DroneStatus({ id }: { id: string }) {
  const [connected, setConnected] = useState(true);
  const [alerts, setAlerts] = useState([] as string[]);
  const [mode, setMode] = useState(100);
  const [state, setState] = useState("Unknown");
  const [modeChanged, setModeChanged] = useState(false);
  const [modeChangeMessage, setModeChangeMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [landedState, setLandedState] = useState<string | undefined>(
    undefined
  );

  const phaseServices = useContext(PhaseContext);
  const { send } = phaseServices.phaseService;
  const isSelected = useSelector(
    phaseServices.phaseService,
    (state) =>
      state.context.selectedIDs.find(
        (selectedID) => selectedID.toString() === id
      ) !== undefined
  );

  const { mapControlService } = useContext(MapControlContext);
  const { send: mapControlSend } = mapControlService;
  const mapSelected = useSelector(
    mapControlService,
    (state) =>
      state.matches("Drone Selected") && state.context.selectedID === id
  );

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    const promise = listen(`landed_state_${id}`, (event) => {
      const landedStatePayload = event.payload as LandedStatePayload;
      const type = landedStatePayload.landed_state.type;
      if (type === "MAV_LANDED_STATE_UNDEFINED") {
        setLandedState(undefined);
      } else {
        const landedState = type
          .slice(17)
          .replaceAll("_", " ")
          .toLocaleLowerCase();
        setLandedState(landedState);
      }
    });
    return () => {
      promise.then((remove) => remove());
    };
  }, [id]);

  useEffect(() => {
    const onHeartbeat = () => {
      setConnected(true);
      const timeoutHandler = setTimeout(() => {
        setConnected(false);
      }, DISCONNECT_INTERVAL);
      return () => clearTimeout(timeoutHandler);
    };

    const promise = listen(`heartbeat_${id}`, (event) => {
      const payload = event.payload as HeartbeatPayload;
      setMode(payload.custom_mode);
      setModeChanged(true);
    });

    return () => {
      promise.then((remove) => remove());
    };
  }, [id]);

  useEffect(() => {
    if (modeChanged) {
      setModeChangeMessage(`Mode changed to ${FLIGHT_MODES[mode]}`);
      setSnackbarOpen(true);
      setModeChanged(false);
    }
  }, [modeChanged, mode]);

  return (
    <>
      <Snackbar
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={
          <Typography
            variant="body1"
            style={{ fontFamily: "Roboto, sans-serif", display: "flex", alignItems: "center" }}
          >
            <ScheduleSharpIcon style={{ marginRight: "0.5em" }} />
            {modeChangeMessage}
          </Typography>
        }
        ContentProps={{
          sx: {
            border: "0.1px solid #5ba25f",
            borderRadius: "10px",
            color: "#5ba25f",
            bgcolor: "black",
            fontWeight: "bold",
            textAlign: "center",
            width: "100%",
            "& .MuiSnackbarContent-message": {
              width: "inherit",
              textAlign: "center",
            },
          },
        }}
      />
      <Modal open={false} onClose={() => {}}>
        <Box
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "60%",
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h4" marginBottom={"15px"}>
            Drone: {id} Status Texts
          </Typography>
          <Box sx={{ maxHeight: "50vh", overflowY: "scroll" }}>
            {alerts.length === 0 ? (
              <Typography variant="h6">No Status texts</Typography>
            ) : (
              alerts.map((alert) => (
                <Card variant="outlined" sx={{ marginBottom: "5px" }}>
                  <CardContent>{alert}</CardContent>
                </Card>
              ))
            )}
          </Box>
        </Box>
      </Modal>
      <Chip
        sx={{ height: "130px", width: "90%", margin: "auto" }}
        color={"success"}
        disabled={!connected}
        variant="outlined"
        label={
          <Stack>
            <Tooltip
              placement="top"
              title={alerts.length !== 0 ? alerts[0] : "No Alerts"}
              onClick={() => {}}
              sx={{ cursor: "pointer", pointerEvents: "auto" }}
            >
              <Typography
                textAlign="center"
                width="85%"
                margin="auto"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {alerts.length !== 0 ? alerts[0] : "No Alerts"}
              </Typography>
            </Tooltip>
            <Box
              sx={{
                width: "100%",
                margin: "auto",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                textAlign="center"
                overflow="hidden"
                textOverflow="ellipsis"
                variant="caption"
              >
                {FLIGHT_MODES[mode]} Mode
              </Typography>
              <Typography
                textAlign="center"
                overflow="hidden"
                textOverflow="ellipsis"
                textTransform={"capitalize"}
                variant="caption"
              >
                {state} state
              </Typography>
              {landedState !== undefined ? (
                <Typography
                  textAlign="center"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  textTransform={"capitalize"}
                  variant="caption"
                >
                  {landedState}
                </Typography>
              ) : null}
            </Box>

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
                onClick={() => {
                  mapSelected
                    ? mapControlSend("Deselect")
                    : mapControlSend({
                        type: "Select Drone",
                        newSelectedDrone: id,
                      });
                }}
                label={
                  <Stack direction="row">
                    <SvgIcon component={DroneIcon} viewBox="0 0 24 24" />
                    <Typography>: {id}</Typography>
                  </Stack>
                }
              />

              <DroneBatteryIndicator id={id} />
              <DroneGPSStatus id={id} />
              <Checkbox
                checked={isSelected}
                sx={{ paddingX: "0", pointerEvents: "auto" }}
                onChange={(e) => {
                  e.stopPropagation();
                  e.target.checked
                    ? send({
                        type: "Add Selected Drones",
                        newSelectedDrone: +id,
                      })
                    : send({
                        type: "Remove Selected Drones",
                        removeDrone: +id,
                      });
                }}
                color="success"
              />
            </Stack>
          </Stack>
        }
      />
    </>
  );
}

export default DroneStatus;
