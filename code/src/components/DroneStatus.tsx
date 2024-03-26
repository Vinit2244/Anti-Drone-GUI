import { useContext, useEffect, useState } from "react";
import { emit, listen } from "@tauri-apps/api/event";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Modal,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";
import { ReactComponent as DroneIcon } from "../assets/drone.svg";
import DroneBatteryIndicator from "./DroneBatteryIndicator";
import Checkbox from "@mui/material/Checkbox";
import { PhaseContext } from "../contexts/PhaseContext";
import { useSelector } from "@xstate/react";
import Tooltip from "@mui/material/Tooltip";
const DISCONNECT_INTERVAL = 5000; //ms
import { selectColor } from "../colorCode";
import { MapControlContext } from "../contexts/MapControlContext";
import DroneGPSStatus from "./DroneGPSStatus";
import { HeartbeatPayload, LandedStatePayload } from "../types/payloads";
import { FLIGHT_MODES } from "../constants/flight_modes";
import { invoke } from "@tauri-apps/api";

export function DroneStatus({ id }: { id: string }) {
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
  useEffect(() => {
    const promise = listen(`landed_state_${id}`, (event) => {
      if (
        (event.payload as LandedStatePayload).landed_state.type ==
        "MAV_LANDED_STATE_UNDEFINED"
      ) {
        setLandedState(undefined);
        return;
      }
      const landedState = (
        event.payload as LandedStatePayload
      ).landed_state.type
        .slice(17)
        .replaceAll("_", " ")
        .toLocaleLowerCase();
      setLandedState(landedState);
    });
    return () => {
      promise.then((remove) => remove());
    };
  }, []);
  useEffect(() => {
    invoke("set_messages_stream", { systemId: 0 });
    const promise = listen(`status_${id}`, (event) => {
      const status = (event.payload as { status_text: string }).status_text;
      addAlert(status);
    });
    return () => {
      promise.then((remove) => remove());
    };
  }, []);
  useEffect(() => {
    const onHeartbeat = () => {
      setConnected((oldConnected) => {
        // if (!oldConnected) addAlert("Reconnected");
        return true;
      });
      const timeoutHandler = setTimeout(() => {
        setConnected(false);
        setTimeoutHandler(undefined);
        // addAlert("Missing Heartbeat");
        // putEnd(id);
      }, DISCONNECT_INTERVAL);
      setTimeoutHandler((prevTimeout) => {
        if (prevTimeout !== undefined) clearTimeout(prevTimeout);
        return timeoutHandler;
      });
    };
    const promise = listen(`heartbeat_${id}`, (event) => {
      let payload = event.payload as HeartbeatPayload;
      setMode(payload.custom_mode);
      setState(
        payload.system_status.type
          .slice(10)
          .replaceAll("_", " ")
          .toLocaleLowerCase()
      );
      onHeartbeat();
    });
    onHeartbeat();
    return () => {
      setTimeoutHandler((prevTimeout) => {
        clearTimeout(prevTimeout);
        return prevTimeout;
      });
      promise.then((remove) => remove());
    };
  }, []);

  const phaseServices = useContext(PhaseContext);
  const { send } = phaseServices.phaseService;
  const isSelected = useSelector(
    phaseServices.phaseService,
    (state) =>
      state.context.selectedIDs.find(
        (selectedID) => selectedID.toString() === id
      ) !== undefined
  );
  useEffect(() => {
    send({
      type: "Add Selected Drones",
      newSelectedDrone: +id,
    });
  }, []);

  const { mapControlService } = useContext(MapControlContext);
  const { send: mapControlSend } = mapControlService;
  const mapSelected = useSelector(
    mapControlService,
    (state) =>
      state.matches("Drone Selected") && state.context.selectedID === id
  );

  const enableSelect = useSelector(phaseServices.phaseService, (state) =>
    state.matches("Connected.Initial")
  );

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  return (
    <>
      <Modal open={statusModalOpen} onClose={() => setStatusModalOpen(false)}>
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
              title={alerts.length !== 0 ? alerts.at(0) : "No Alerts"}
              onClick={() => {
                setStatusModalOpen(true);
              }}
              sx={{ cursor: "pointer", pointerEvents: "auto" }}
            >
              <Typography
                textAlign="center"
                width="85%"
                margin="auto"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {alerts.length !== 0 ? alerts.at(0) : "No Alerts"}
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
                    <SvgIcon component={DroneIcon} inheritViewBox />
                    <Typography>: {id}</Typography>
                  </Stack>
                }
              />

              <DroneBatteryIndicator id={id} />
              <DroneGPSStatus id={id} />
              <Checkbox
                // disabled={!enableSelect || !connected}
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
