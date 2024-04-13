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
import VideoFeedButtonFullScreen from "./components/VideoFeedFullScreen";
import TimeToKillSnackbar from "./components/TimeToKillAlert";

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
  const [showMap, setShowMap] = useState(true);

  const toggleTheme = () => {
    setCurrentTheme((prevTheme) =>
      prevTheme === darkTheme ? lightTheme : darkTheme
    );
  };

  const toggleFullScreenMap = () => {
    setFullScreenMap(!fullScreenMap);
  };

  const handleShowMapClick = () => {
    setShowMap((prevShowMap) => !prevShowMap);
  };

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <AlertProvider>
        <PhaseProvider>
          <MapControlProvider>
            <FODDataProvider>
              <div className="appContainer">
                {fullScreenMap ?
                <TimeToKillSnackbar cName="timeToKillSnackbarFull"/>
                :
                <TimeToKillSnackbar cName="timeToKillSnackbar"/>}
                {showMap ? (
                  fullScreenMap ? (
                    <Map
                      toggleTheme={toggleTheme}
                      cName="mapWrapper-full"
                      toggleFullScreenMap={toggleFullScreenMap}
                    />
                  ) : (
                    <Map
                      toggleTheme={toggleTheme}
                      cName="mapWrapper-left"
                      toggleFullScreenMap={toggleFullScreenMap}
                    />
                  )
                ) : (
                  <Map
                    toggleTheme={toggleTheme}
                    cName="mapWrapper-none"
                    toggleFullScreenMap={toggleFullScreenMap}
                  />
                )}
                {/* {showMap ? (
                  fullScreenMap ? (
                    <VideoFeedButton
                      cName="videoFeedButton-right"
                      handleClick={handleShowMapClick}
                    />
                  ) : (
                    <VideoFeedButton
                      cName="videoFeedButton-left"
                      handleClick={handleShowMapClick}
                    />
                  )
                ) : fullScreenMap ? (
                  <VideoFeedButtonFullScreen
                    cName="imageContainerFullScreen"
                    handleClick={handleShowMapClick}
                  />
                ) : (
                  <VideoFeedButtonFullScreen
                    cName="imageContainerFullLeft"
                    handleClick={handleShowMapClick}
                  />
                )} */}

                {!fullScreenMap && <ActionMenu cName="actionMenu-right" />}
                {!fullScreenMap && (
                  <MissionControl cName="missionControl-right" />
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
