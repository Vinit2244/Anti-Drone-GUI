import { ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Tooltip,
  IconButton,
} from "@mui/material";
import { invoke } from "@tauri-apps/api";
import { useContext, useEffect, useState } from "react";
import { PartialMissionFODData } from "../types/fod";
import { FODDataContext } from "../contexts/FODDataContext";
import { useSelector } from "@xstate/react";
import StarsIcon from "@mui/icons-material/Stars";
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";

function FODHistoryCard({ fod }: { fod: PartialMissionFODData }) {
  const startTime = new Date(fod.mission_start_time.secs_since_epoch * 1000);
  const endTime = new Date(fod.mission_end_time.secs_since_epoch * 1000);
  const { fodDataService } = useContext(FODDataContext);
  const noActive = useSelector(
    fodDataService,
    (state) => state.context.currentMissionData === null
  );
  const isActive = useSelector(
    fodDataService,
    (state) =>
      state.context.currentMissionData !== null &&
      state.context.currentMissionData.mission_name === fod.mission_name &&
      state.context.currentMissionData.mission_start_time.secs_since_epoch ===
        fod.mission_start_time.secs_since_epoch
  );
  const loading = useSelector(fodDataService, (state) =>
    state.matches("Loading")
  );
  const loaded = useSelector(fodDataService, (state) =>
    state.matches("History")
  );
  const { send } = fodDataService;
  return (
    <Card variant="outlined" sx={{ marginBottom: "10px" }}>
      <CardHeader
        title={
          <Typography variant="h6">Mission: {fod.mission_name}</Typography>
        }
        action={
          isActive ? (
            <Tooltip title={loaded ? "Close History" : "Current Mission"}>
              {loaded ? (
                <IconButton
                  onClick={() => {
                    send("Close History");
                  }}
                >
                  <CloseIcon />
                </IconButton>
              ) : (
                <IconButton>
                  <StarsIcon />
                </IconButton>
              )}
            </Tooltip>
          ) : (
            <Tooltip
              title={
                noActive
                  ? loading
                    ? "Loading"
                    : "Load FOD Data"
                  : "Can't Load during Active Mission"
              }
            >
              <span>
                <IconButton
                  disabled={!noActive || loading}
                  onClick={() => {
                    send({
                      type: "Load History",
                      missionID: `${fod.mission_name}-${fod.mission_start_time.secs_since_epoch}`,
                    });
                  }}
                >
                  <DownloadIcon />
                </IconButton>
              </span>
            </Tooltip>
          )
        }
      />
      <CardContent>
        <Typography>Start: {startTime.toLocaleString()}</Typography>
        <Typography>End: {endTime.toLocaleString()}</Typography>
      </CardContent>
    </Card>
  );
}

function FODHistory() {
  let [fodHistory, setFodHistory] = useState([] as PartialMissionFODData[]);
  useEffect(() => {
    (async () => {
      const resp = (await invoke("get_fod_history")) as PartialMissionFODData[];
      resp.sort(
        (a, b) =>
          b.mission_start_time.secs_since_epoch -
          a.mission_start_time.secs_since_epoch
      );
      setFodHistory(resp);
    })();
  }, []);
  return (
    <>
      {fodHistory.map((fod) => (
        <FODHistoryCard
          fod={fod}
          key={`${fod.mission_name}-${fod.mission_start_time.secs_since_epoch}`}
        />
      ))}
    </>
  );
}

export function FODSettings() {
  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="h6">FOD History</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <FODHistory />
      </AccordionDetails>
    </Accordion>
  );
}
