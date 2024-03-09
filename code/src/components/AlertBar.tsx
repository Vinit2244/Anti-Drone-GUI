// Import the necessary components and hooks
import React, { useContext, useMemo, useState } from "react";
import AppBar from "@mui/material/AppBar";
import IconButton from "@mui/material/IconButton";
import SettingsIcon from "@mui/icons-material/Settings";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Stack from "@mui/material/Stack";
import { Settings } from "@mui/icons-material";
import Alert from "@mui/material/Alert";
import { AlertContext } from "../contexts/AlertContext";
import Modal from "@mui/material/Modal";
import { SettingsModalContent } from "./SettingsModalContent";
import ToggleGridButton from "./ToggleGridButton"; // Import the ToggleGridButton component

function AlertBar({ graticule, toggleGraticule, toggleTheme }: { graticule: boolean; toggleGraticule: () => void; toggleTheme: () => void }) {
  // // const { alerts } = useContext(AlertContext);
  // const alert = useMemo(() => alerts.at(-1), [alerts]) ?? {
  //   severity: "info",
  //   alert: "No Alerts to display",
  // };
  const [openSettings, setOpenSettings] = useState(false);
  return (
    <>
      <Modal open={openSettings} onClose={() => setOpenSettings(false)}>
        <div>
          <SettingsModalContent
            close={() => {
              setOpenSettings(false);
            }}
          />
        </div>
      </Modal>
      <div className="alertBar">
        <AppBar
          sx={{
            height: 75,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Stack sx={{ marginX: "2%" }} spacing={1} direction="row">
            {/* <Alert severity={alert.severity} sx={{ flex: 1 }}>
              {alert.alert}
            </Alert> */}
             <ToggleGridButton onToggle={toggleGraticule} /> {/* Use the ToggleGridButton */}
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
        </AppBar>
      </div>
    </>
  );
}

export default AlertBar;




