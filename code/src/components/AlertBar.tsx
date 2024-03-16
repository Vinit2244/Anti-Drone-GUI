// Import the necessary components and hooks
import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import IconButton from "@mui/material/IconButton";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Stack from "@mui/material/Stack";
import { Settings } from "@mui/icons-material";
import Modal from "@mui/material/Modal";
import { SettingsModalContent } from "./SettingsModalContent";
import ToggleGridButton from "./ToggleGridButton"; // Import the ToggleGridButton component

function AlertBar({ toggleGraticule, toggleTheme }: { toggleGraticule: () => void; toggleTheme: () => void }) {
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
            height: "10%",  // Keep the height same as the first row of the App.css
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Stack sx={{ marginX: "2%" }} spacing={1} direction="row">
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




