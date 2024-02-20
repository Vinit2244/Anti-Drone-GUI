import Chip from "@mui/material/Chip";
import { useContext, useMemo } from "react";
import LeakAddIcon from "@mui/icons-material/LeakAdd";
import LeakRemoveIcon from "@mui/icons-material/LeakRemove";
import { PhaseContext } from "../contexts/PhaseContext";
import { useActor } from "@xstate/react";
import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";

function DisconnectedStatus({ connect }: { connect: () => void }) {
  return (
    <Chip
      icon={<LeakRemoveIcon />}
      color="error"
      label="Telemetry Disconnected"
      title="Click To Reconnect"
      variant="outlined"
      clickable={true}
      onClick={connect}
    />
  );
}

function ConnectedStatus({ disconnect }: { disconnect: () => void }) {
  return (
    <Chip
      icon={<LeakAddIcon />}
      variant="outlined"
      color="success"
      label="Telemetry Connected"
      title="Click To Disconnect"
      clickable={true}
      onClick={disconnect}
    />
  );
}

function ConnectingStatus() {
  return (
    <Chip
      icon={<LeakAddIcon />}
      variant="outlined"
      color="info"
      label="Connecting to Telemetry"
    />
  );
}

function DisconnectingStatus() {
  return (
    <Chip
      icon={<LeakAddIcon />}
      variant="outlined"
      color="info"
      label="Disconnecting from Telemetry"
    />
  );
}

function TelemetryConnectionStatus() {
  const phaseServices = useContext(PhaseContext);
  const [state] = useActor(phaseServices.phaseService);
  const { send } = phaseServices.phaseService;

  useEffect(() => {
    const promise = listen("force_disconnected", (event) => {
      send({
        type: "Force Disconnect",
        reason: (event.payload as { reason: string }).reason,
      });
    });

    return () => {
      promise.then((remove) => remove());
    };
  }, []);

  const statusComponent = useMemo(() => {
    switch (true) {
      case state.matches("Connecting"):
        return <ConnectingStatus />;
      case state.matches("Connected"):
        return (
          <ConnectedStatus
            disconnect={() => {
              send("Disconnect");
            }}
          />
        );
      case state.matches("Disconnected"):
        return (
          <DisconnectedStatus
            connect={() => {
              send("Reconnect");
            }}
          />
        );
      case state.matches("Disconnecting"):
        return <DisconnectingStatus />;
      default:
        return null;
    }
  }, [state]);

  return statusComponent;
}

export default TelemetryConnectionStatus;
