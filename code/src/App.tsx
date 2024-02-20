import { ThemeProvider, createTheme } from "@mui/material/styles";
import "./App.css";
import { RefObject, StrictMode, useEffect, useRef, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import AlertBar from "./components/AlertBar";
import Map from "./components/Map";
import ActionMenu from "./components/ActionMenu";
import CssBaseline from "@mui/material/CssBaseline";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { AlertProvider } from "./contexts/AlertContext";
import { PhaseProvider } from "./contexts/PhaseContext";
import { appWindow } from "@tauri-apps/api/window";
import { MissionControl } from "./components/MissionControl";
import { FODProgress } from "./components/FODProgress";
import { MapControlProvider } from "./contexts/MapControlContext";
import { FODDataProvider } from "./contexts/FODDataContext";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AlertProvider>
        <PhaseProvider>
          <MapControlProvider>
            <FODDataProvider>
              <div className="appContainer">
                <AlertBar />
                <Map />
                {/* <FODProgress /> */}
                <MissionControl />
                <ActionMenu />
              </div>
            </FODDataProvider>
          </MapControlProvider>
        </PhaseProvider>
      </AlertProvider>
    </ThemeProvider>
  );
}

export default App;
