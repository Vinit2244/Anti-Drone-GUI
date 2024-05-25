import Chip from "@mui/material/Chip";
import { useContext } from "react";
import { PhaseContext } from "../contexts/PhaseContext";
import { useSelector } from "@xstate/react";

export function ProgressStatus() {
  const phaseServices = useContext(PhaseContext);
  const state = useSelector(phaseServices.phaseService, (state) => {
    switch (true) {
      case state.matches("Connected.Taking Off"):
        return "Taking Off";
      case state.matches("Connected.Mission.Normal.In Progress") ||
        state.matches("Connected.Mission.Normal.Sending Pause"):
        return "In Progress";
      case state.matches("Connected.Mission.Normal.Paused") ||
        state.matches("Connected.Mission.Normal.Sending Resume"):
        return "Paused";
      case state.matches("Connected.Mission.Emergency Clearing"):
        return "Emergency Clearing";
      default:
        return "No Action";
    }
  });
  return <Chip label={state} variant="outlined" color="info" />;
}
