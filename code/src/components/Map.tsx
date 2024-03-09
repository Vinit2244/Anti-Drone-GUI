import React, { useCallback } from "react";
import { Paper, Button } from "@mui/material";
import {
  RMap,
  RLayerTileWebGL,
  RLayerGraticule,
  RControl,
  RStyle,
} from "rlayers";
import { fromLonLat, getPointResolution } from "ol/proj";
import { RefObject, useRef } from "react";
import { OnlyConnected } from "./Only";
import { DronesMapManager } from "./DronesMapManager";
import { FODMapManager } from "./FODMapManager";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import { Settings, Home, Info } from "@mui/icons-material";
import Modal from "@mui/material/Modal";
import { SettingsModalContent } from "./SettingsModalContent";
import AlertBar from "./AlertBar"; // Update the import statement
import ToggleGridButton from "./ToggleGridButton";


const centerPoint = [78.34910677877723, 17.445657887972082] as [number, number];
const center = fromLonLat(centerPoint);

export default function Simple({ toggleTheme }: { toggleTheme: () => void }): JSX.Element {
  const [openSettings, setOpenSettings] = React.useState<boolean>(true);
  const [graticule, setGraticule] = React.useState<boolean>(true);
  const style = RStyle.useRStyle();

  const mapRef = useRef() as RefObject<RMap>;

  // Here in calculating resolution, 1 depicts 1km width, so that the map shown on the screen will be showing 1km width
  const resolution = getPointResolution("EPSG:3857", 1, center);
  const initialZoom = Math.round(Math.log2(156543.03392 / resolution));

  const toggleGraticule = useCallback(() => {
    setGraticule((prevGraticule) => !prevGraticule);
  }, []);

  return (
    <Paper className="mapWrapper" style={{ position: "relative" }}>
      <RStyle.RStyle ref={style}>
        <RStyle.RStroke color={graticule ? "black" : "transparent"} width={1.5} />
      </RStyle.RStyle>
      <RMap
        width={"100%"}
        height={"100%"}
        initial={{ center, zoom: initialZoom }}
        ref={mapRef}
        onClick={useCallback(() => {
          // Handle map click events
        }, [])}
      >
        <RLayerTileWebGL url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />
        <RLayerGraticule visible={graticule} strokeStyle={style} />
        <RControl.RScaleLine />
        <RControl.RZoomSlider />
        <RControl.RRotate autoHide={false} />
        <RControl.RCustom className="date-time-map">
          {/* Your date-time display component */}
        </RControl.RCustom>
        <OnlyConnected>
          <DronesMapManager mapRef={mapRef} />
        </OnlyConnected>
        <FODMapManager />
      </RMap>
      {/* <div className="toggleGridButton">
          <Button variant="outlined" onClick={toggleGraticule}>
            ToggleGrid
          </Button>
        </div> */}
      <AlertBar graticule={graticule} toggleGraticule={toggleGraticule} toggleTheme={toggleTheme}/>
    </Paper>
  );
}

