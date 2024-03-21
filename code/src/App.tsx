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
import VideoFeedButton from "./components/VideoFeed";

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
  const [fullScreenMap, setFullScreenMap] = useState(false);

  const toggleTheme = () => {
    setCurrentTheme((prevTheme) =>
      prevTheme === darkTheme ? lightTheme : darkTheme
    );
  };

  const toggleFullScreenMap = () => {
    setFullScreenMap(!fullScreenMap);
  };

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <AlertProvider>
        <PhaseProvider>
          <MapControlProvider>
            <FODDataProvider>
              <div className="appContainer">
                {fullScreenMap ? (
                  <Map  toggleTheme={toggleTheme} cName="mapWrapper-full" toggleFullScreenMap = {toggleFullScreenMap}/>
                ) : (
                  <Map  toggleTheme={toggleTheme} cName="mapWrapper-left" toggleFullScreenMap = {toggleFullScreenMap}/>
                )}
                {!fullScreenMap && <ActionMenu cName="actionMenu-right" />}
                {!fullScreenMap && <MissionControl cName="missionControl-right" />}
                {fullScreenMap ? (
                  <VideoFeedButton cName="videoFeedButton-right"/>
                ) : (
                  <VideoFeedButton cName="videoFeedButton-left"/>
                )}
              </div>
            </FODDataProvider>
          </MapControlProvider>
        </PhaseProvider>
      </AlertProvider>
    </ThemeProvider>
  );
}

export default App;
