import { ThemeProvider, createTheme } from "@mui/material/styles";
import "./App.css";
import { useState } from "react";
import Map from "./components/Map";
import ActionMenu from "./components/ActionMenu";
import CssBaseline from "@mui/material/CssBaseline";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { AlertProvider } from "./contexts/AlertContext";
import { PhaseProvider } from "./contexts/PhaseContext";
import { MissionControl } from "./components/MissionControl";
import { MapControlProvider } from "./contexts/MapControlContext";
import { FODDataProvider } from "./contexts/FODDataContext";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const lightTheme = createTheme({
  palette: {
    mode: "light",
  },
});

function App() {
  const [currentTheme, setCurrentTheme] = useState(darkTheme);

  const toggleTheme = () => {
    setCurrentTheme((prevTheme) => (prevTheme === darkTheme ? lightTheme : darkTheme));
  };

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <AlertProvider>
        <PhaseProvider>
          <MapControlProvider>
            <FODDataProvider>
              <div className="appContainer">
                <Map toggleTheme={toggleTheme} />
                <ActionMenu />
                <MissionControl />
              </div>
            </FODDataProvider>
          </MapControlProvider>
        </PhaseProvider>
      </AlertProvider>
    </ThemeProvider>
  );
}

export default App;
