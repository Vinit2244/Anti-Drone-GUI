/**
 * Component of side action bar with drone status
 */
import Paper from "@mui/material/Paper";
import TelemetryConnectionStatus from "./TelemetryConnectionStatus";
import { OnlyConnected, ShowTakeoff } from "./Only";
import { DronesStatus } from "./DronesStatus";
import { ProgressStatus } from "./ProgressStatus";
import arkaIcon from "../assets/arka.webp";
import { Box } from "@mui/material";
import { DronesStatusSkeleton } from "./DronesStatusSkeleton";

function ActionMenu() {
  /**
   * Component of side action bar with drone status
   */
  return (
    <>
      <Paper className="actionMenu">
        {/* <Box
          sx={{
            height: "20%",
            display: "grid",
            placeItems: "center",
          }}
        >
          <img
            src={arkaIcon}
            height={"70%"}
            alt="Arka Aerospace"
            draggable={false}
          />
        </Box> */}

        {/* Displaying the information if the telemetry is connected or not */}
        <Paper
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: 10,
            height: "10%",
            // borderTop: "solid",
            // borderTopWidth: "3px",
            // borderTopColor: "grey",
          }}>
          <TelemetryConnectionStatus />
          <OnlyConnected>
            <ShowTakeoff not>
              <ProgressStatus></ProgressStatus>
            </ShowTakeoff>
          </OnlyConnected>
        </Paper>

        <Paper
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: 10,
            height: "90%",
            borderTop: "solid",
            // borderTopColor: "grey",
            overflow: "scroll",
          }}>
          {/* Template to be shown when some drone is connected */}
          <OnlyConnected>
            <DronesStatus />
          </OnlyConnected>

          {/* Template to be shown when no drone is connected */}
          <OnlyConnected not>
            {/* <DronesStatus /> */}
            <DronesStatusSkeleton />
          </OnlyConnected>
        </Paper>
      </Paper>
    </>
  );
}

export default ActionMenu;
