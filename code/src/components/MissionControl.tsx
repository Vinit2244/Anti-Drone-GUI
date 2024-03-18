import { Paper, Typography, Button } from "@mui/material";
import { PropsWithChildren, useContext, useEffect, useState } from "react";
import { PhaseContext } from "../contexts/PhaseContext";
import { useSelector } from "@xstate/react";
import { FODDataContext } from "../contexts/FODDataContext";
import { invoke } from "@tauri-apps/api";

function TakeoffButton() {
  const phaseServices = useContext(PhaseContext);
  const { send } = phaseServices.phaseService;
  const disable = useSelector(
    phaseServices.phaseService,
    (state) =>
      state.matches("Connected.Sending Takeoff") ||
      state.context.selectedIDs.length === 0
  );
  return (
    <Button
      variant="outlined"
      onClick={() => {
        send("Send Takeoff");
      }}
      disabled={disable}
    >
      Takeoff
    </Button>
  );
}

function PauseButton() {
  const phaseServices = useContext(PhaseContext);
  const { send } = phaseServices.phaseService;
  const disable = useSelector(phaseServices.phaseService, (state) =>
    state.matches("Connected.Mission.Normal.Sending Pause")
  );
  return (
    <Button
      variant="outlined"
      onClick={() => {
        send("Pause");
      }}
      disabled={disable}
    >
      Pause Mission
    </Button>
  );
}

function ResumeButton() {
  const phaseServices = useContext(PhaseContext);
  const { send } = phaseServices.phaseService;
  const disable = useSelector(phaseServices.phaseService, (state) =>
    state.matches("Connected.Mission.Normal.Sending Resume")
  );
  return (
    <Button
      variant="outlined"
      onClick={() => {
        send("Resume");
      }}
      disabled={disable}
    >
      Resume Mission
    </Button>
  );
}

function EmergencyClearButton() {
  const phaseServices = useContext(PhaseContext);
  const { send } = phaseServices.phaseService;

  const disable = useSelector(phaseServices.phaseService, (state) =>
    state.matches("Connected.Mission.Sending Emergency Clear")
  );
  return (
    <Button
      variant="outlined"
      onClick={() => {
        send("Emergency Clear");
      }}
      disabled={disable}
    >
      Emergency Clear
    </Button>
  );
}

function LooperButton({
  children,
  cancelChildren,
  onPress,
  delay,
}: PropsWithChildren<{
  onPress: () => boolean | Promise<boolean>;
  delay: number;
  cancelChildren: React.ReactNode;
}>) {
  const [active, setActive] = useState(false);
  const [ticker, setTicker] = useState(false);
  useEffect(() => {
    if (!active) return;
    (async () => {
      if (!(await onPress())) {
        setActive(false);
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      setTicker((ticker) => !ticker);
    })();
  }, [ticker, active]);
  return active ? (
    <Button variant="contained" onClick={() => setActive(false)}>
      {cancelChildren}
    </Button>
  ) : ( 
    <Button variant="outlined" onClick={() => setActive(true)}>
      {children}
    </Button>
  );
}

export function MissionControl() {
  const phaseServices = useContext(PhaseContext);
  const { send } = phaseServices.phaseService;
  const { fodDataService } = useContext(FODDataContext);
  const { send: sendFOD } = fodDataService;
  const selectedDrones = useSelector(
    phaseServices.phaseService,
    (state) => state.context.selectedIDs
  );
  return (
    <>
      <Paper
        className="missionControl"
        style={{
          borderTop: "solid",
          // color: "grey",
          overflow: "scroll",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "5px 0 5px 0",
          }}
        >
          <Typography variant="h6" color="secondary">
            Mission Control
          </Typography>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: 7,
          }}
        >
          {/* <ShowTakeoff>
            <TakeoffButton />
          </ShowTakeoff>
          <ShowPause>
            <PauseButton />
          </ShowPause>
          <ShowResume>
            <ResumeButton />
          </ShowResume>
          <ShowEmergencyClear>
            <EmergencyClearButton />
          </ShowEmergencyClear> */}
          <LooperButton
            delay={200}
            cancelChildren={"Stop Sending Launch"}
            onPress={async () => {
              sendFOD("Start Mission");
              try {
                await invoke("launch");
                return true;
              } catch (e) {
                console.error(e);
                return false;
              }
            }}
          >
            Send Launch
          </LooperButton>
          <LooperButton
            delay={200}
            cancelChildren={"Stop Sending Land"}
            onPress={async () => {
              try {
                await invoke("land");
                return true;
              } catch (e) {
                console.error(e);
                return false;
              }
            }}
          >
            Send Land
          </LooperButton>
          {/* <Button
            variant="outlined"
            onClick={() => {
              sendFOD({
                type: "New Detected",
                newObject: {
                  cleared: false,
                  latitude: 1.1,
                  longitude: 1.1,
                  object_id: "1",
                  name: "boulder",
                  object_type: "rock",
                  threat_level: "safe",
                },
              });
            }}
          >
            Test Add new FOD
          </Button> */}

          <LooperButton
            delay={0}
            cancelChildren={"Stop Setting Guided"}
            onPress={async () => {
              try {
                const resp = (await invoke("set_mode", {
                  mode: 4.0,
                  systemIds: selectedDrones,
                })) as { [key: number]: boolean };

                for (const systemIds in resp) {
                  if (Object.prototype.hasOwnProperty.call(resp, systemIds)) {
                    const element = resp[systemIds];
                    if (!element) return true;
                  }
                }
                return false;
              } catch (e) {
                console.error(e);
                return false;
              }
            }}
          >
            Set Guided
          </LooperButton>
          <LooperButton
            delay={0}
            cancelChildren={"Stop Setting PosHold"}
            onPress={async () => {
              try {
                const resp = (await invoke("set_mode", {
                  mode: 16.0,
                  systemIds: selectedDrones,
                })) as { [key: number]: boolean };

                for (const systemIds in resp) {
                  if (Object.prototype.hasOwnProperty.call(resp, systemIds)) {
                    const element = resp[systemIds];
                    if (!element) return true;
                  }
                }
                return false;
              } catch (e) {
                console.error(e);
                return false;
              }
            }}
          >
            Set PosHold
          </LooperButton>
          {/* <LooperButton
            delay={0}
            cancelChildren={"Stop Setting AltHold"}
            onPress={async () => {
              try {
                const resp = (await invoke("set_mode", {
                  mode: 2.0,
                  systemIds: selectedDrones,
                })) as { [key: number]: boolean };

                for (const systemIds in resp) {
                  if (Object.prototype.hasOwnProperty.call(resp, systemIds)) {
                    const element = resp[systemIds];
                    if (!element) return true;
                  }
                }
                return false;
              } catch (e) {
                console.error(e);
                return false;
              }
            }}
          >
            Set AltHold
          </LooperButton> */}
          <LooperButton
            delay={0}
            cancelChildren={"Stop Setting RTL"}
            onPress={async () => {
              try {
                const resp = (await invoke("set_mode", {
                  mode: 6.0,
                  systemIds: selectedDrones,
                })) as { [key: number]: boolean };

                for (const systemIds in resp) {
                  if (Object.prototype.hasOwnProperty.call(resp, systemIds)) {
                    const element = resp[systemIds];
                    if (!element) return true;
                  }
                }
                return false;
              } catch (e) {
                console.error(e);
                return false;
              }
            }}
          >
            RTH
          </LooperButton>
          <Button
            variant="outlined"
            onClick={() => {
              invoke("kill_motors");
            }}
          >
            Kill Motors
          </Button>
          {/* <Button
            variant="outlined"
            onClick={() => {
              send("Takeoff Complete");
            }}
          >
            Complete takeoff
          </Button> */}
          <Button
            disabled={false}
            variant="outlined"
            onClick={() => {
              send("Mission Completed");
              sendFOD("End Mission");
            }}
          >
            Complete Mission
          </Button>
        </div>
      </Paper>
    </>
  );
}
