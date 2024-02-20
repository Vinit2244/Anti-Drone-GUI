import { AppBar } from "@mui/material";
import { Settings } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import { useContext, useMemo, useState } from "react";
import { AlertContext } from "../contexts/AlertContext";
import Modal from "@mui/material/Modal";
import { SettingsModalContent } from "./SettingsModalContent";

function AlertBar() {
  const { alerts } = useContext(AlertContext);
  const alert = useMemo(() => alerts.at(-1), [alerts]) ?? {
    severity: "info",
    alert: "No Alerts to display",
  };
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
            <Alert severity={alert.severity} sx={{ flex: 1 }}>
              {alert.alert}
            </Alert>
            <IconButton
              sx={{ width: 50 }}
              onClick={() => setOpenSettings(true)}
            >
              <Settings />
            </IconButton>
          </Stack>
        </AppBar>
      </div>
    </>
  );
}

export default AlertBar;
