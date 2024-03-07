import React from "react";
import { get } from "ol/proj";
import { getCenter } from "ol/extent";
import "ol/ol.css";
import { fromLonLat, getPointResolution } from "ol/proj";
import Paper from "@mui/material/Paper";
import { RMap, ROSMWebGL, RControl, ROSM, RLayerTileWebGL, RLayerImage, RLayerGraticule, RStyle } from "rlayers";
import { RefObject, useCallback, useContext, useRef } from "react";
import { DronesMapManager } from "./DronesMapManager";
import { OnlyConnected } from "./Only";
import { FODMapManager } from "./FODMapManager";
import { MapControlContext } from "../contexts/MapControlContext";
import "./Map.css";
import { DateTimeDisplay } from "./DateTimeDisplay";

const centerPoint = [78.34910677877723, 17.445657887972082] as [number, number];
const center = fromLonLat(centerPoint);

export default function Simple(): JSX.Element {
  const [graticule, setGraticule] = React.useState<boolean>(true);
  const style = RStyle.useRStyle();

  const mapRef = useRef() as RefObject<RMap>;
  const { mapControlService } = useContext(MapControlContext);
  const { send } = mapControlService;

  // Here in calculating resoluton 1 depicts 1km width, so that the map shown on the screen will be showing 1km width
  const resolution = getPointResolution("EPSG:3857", 1, center);
  const initialZoom = Math.round(Math.log2(156543.03392 / resolution));

  return (
    <Paper className="mapWrapper" style={{ position: "relative" }}>
      <RStyle.RStyle ref={style}>
        <RStyle.RStroke color="black" width={1.5} />
      </RStyle.RStyle>
      <RMap
        width={"100%"}
        height={"100%"}
        initial={{ center, zoom: initialZoom }}
        ref={mapRef}
        onClick={useCallback(() => {
          send("Deselect");
        }, [])}
        // noDefaultInteractions
      >
        <RLayerTileWebGL url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />
        <RLayerGraticule
          visible={graticule}
          strokeStyle={style}
        />
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
    </Paper>
  );
}