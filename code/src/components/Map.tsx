import React, { useCallback } from "react";
import { Paper } from "@mui/material";
import { Point } from "ol/geom";
import "ol/ol.css";
import { RMap, RLayerTileWebGL, RLayerGraticule, RControl, RStyle } from "rlayers";
import { fromLonLat, getPointResolution } from "ol/proj";
import { RefObject, useRef } from "react";
import { OnlyConnected } from "./Only";
import { DronesMapManager } from "./DronesMapManager";
import { FODMapManager } from "./FODMapManager";
import { DateTimeDisplay } from "./DateTimeDisplay";
import AlertBar from "./AlertBar";
import "./Map.css"


const centerPoint = [78.34910677877723, 17.445657887972082] as [number, number];
const center = fromLonLat(centerPoint);

export default function Simple({
  toggleTheme,
}: {
  toggleTheme: () => void;
}): JSX.Element {
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
    <Paper className="mapWrapper" style={{ position: "relative", height: "100%" }}>
      <RStyle.RStyle ref={style}>
        <RStyle.RStroke
          color={graticule ? "black" : "transparent"}
          width={1.5}
        />
      </RStyle.RStyle>
      <RMap
        width={"100%"}
        height={"100%"}
        initial={{ center, zoom: initialZoom }}
        ref={mapRef}
        onClick={useCallback(() => {}, [])}>
        <RLayerTileWebGL url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />
        <RLayerGraticule visible={graticule} strokeStyle={style} />
        {/* <RLayerVector zIndex={100}>
          <RStyle.RStyle>
            <RStyle.RCircle radius={1}>
              <RStyle.RFill color="red" />
            </RStyle.RCircle>
            <RFeature geometry={new Point(center)} />
          </RStyle.RStyle>
        </RLayerVector> */}
        <RControl.RScaleLine />
        <RControl.RZoomSlider />
        <RControl.RRotate autoHide={false} />
        <RControl.RCustom className="date-time-map">
          <Paper sx={{ padding: "15px" }}>
            <DateTimeDisplay />
          </Paper>
        </RControl.RCustom>
        <OnlyConnected>
          <DronesMapManager mapRef={mapRef} />
        </OnlyConnected>
        <FODMapManager />
      </RMap>
      <AlertBar toggleGraticule={toggleGraticule} toggleTheme={toggleTheme}/>
    </Paper>
  );
}
