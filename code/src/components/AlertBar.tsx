import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import IconButton from "@mui/material/IconButton";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Stack from "@mui/material/Stack";
import { Settings } from "@mui/icons-material";
import Modal from "@mui/material/Modal";
import { SettingsModalContent } from "./SettingsModalContent";
import ToggleGridButton from "./ToggleGridButton";
import TelemetryConnectionStatus from "./TelemetryConnectionStatus";
import { OnlyConnected, ShowTakeoff } from "./Only";
import { ProgressStatus } from "./ProgressStatus";

function AlertBar({ toggleGraticule, toggleTheme, toggleFullScreenMap }: { toggleGraticule: () => void; toggleTheme: () => void; toggleFullScreenMap: () => void }) {
  const [openSettings, setOpenSettings] = useState(false);
  return (
    <>
      <Modal open={openSettings} onClose={() => setOpenSettings(false)}>
        <div>
          <SettingsModalContent 
            close={() => {
              setOpenSettings(false);
            }}
            toggleFullScreenMap = {toggleFullScreenMap}
          />
        </div>
      </Modal>
      <div className="alertBar">
        <AppBar
          sx={{
            height: "10%",  // Keep the height same as the first row of the App.css
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Stack sx={{ marginX: "2%", justifyContent: "space-between" }} spacing={1} direction="row">
            {/* All the things that are to be aligned left in this div */}
            <div>

            </div>
            {/* All the things that are to be aligned right in this div */}
            <div>
              <Stack sx={{ marginX: "2%", justifyContent: "space-between" }} spacing={2} direction="row">
                <div>
                  <Stack sx={{ marginX: "2%", justifyContent: "space-between" }} spacing={2} direction="row">

                    <ToggleGridButton onToggle={toggleGraticule} />

                    <IconButton
                      sx={{ width: 50 }}
                      onClick={() => setOpenSettings(true)}
                    >
                      <Settings />
                    </IconButton>

                    <IconButton onClick={toggleTheme}>
                      <Brightness4Icon />
                    </IconButton>
                  </Stack>
                </div>
                <div style={{ paddingTop: "5px" }}>
                  {/* Displaying the information if the telemetry is connected or not */}
                  <TelemetryConnectionStatus />
                  <OnlyConnected>
                    <ShowTakeoff not>
                      <ProgressStatus></ProgressStatus>
                    </ShowTakeoff>
                  </OnlyConnected>
                </div>
              </Stack>
            </div>
          </Stack>
        </AppBar>
      </div>
    </>
  );
}

export default AlertBar;




