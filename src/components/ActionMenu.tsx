import Paper from "@mui/material/Paper";
import { OnlyConnected } from "./Only";
import { DronesStatus } from "./DronesStatus";
import { DronesStatusSkeleton } from "./DronesStatusSkeleton";

function ActionMenu({cName} : {cName: string}) {
  return (
    <>
      <Paper className={cName}>
        <Paper
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: 10,
            height: "100%",
            borderTop: "solid",
            overflow: "scroll",
          }}>
          {/* Template to be shown when some drone is connected */}
          <OnlyConnected>
            <DronesStatus />
          </OnlyConnected>

          {/* Template to be shown when no drone is connected */}
          <OnlyConnected not>
            {/* Hard coded for displaying drone info for testing */}
            {/* <DronesStatus /> */}
            <DronesStatusSkeleton />
          </OnlyConnected>
        </Paper>
      </Paper>
    </>
  );
}

export default ActionMenu;
