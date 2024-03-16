import React, { useCallback, useRef, useState } from "react";
import { Paper } from "@mui/material";
import "ol/ol.css";
import { RMap, RLayerTileWebGL, RLayerVector, RLayerGraticule, RControl, RStyle, RFeature } from "rlayers";
import { RView } from "rlayers/RMap";
import { fromLonLat } from "ol/proj";
import Point from "ol/geom/Point";
import { OnlyConnected } from "./Only";
import { DronesMapManager } from "./DronesMapManager";
import { FODMapManager } from "./FODMapManager";
import { DateTimeDisplay } from "./DateTimeDisplay";
import AlertBar from "./AlertBar";
import "./Map.css";

const centerPoint = [78.34910677877723, 17.445657887972082] as [number, number];
const center = fromLonLat(centerPoint);
const noKillZones = [
  { latitude: 17.45, longitude: 78.34, radius: 100 },
  { latitude: 17.46, longitude: 78.35, radius: 500 },
  // Add more no-kill zones as needed
];

export default function Simple({ toggleTheme }: { toggleTheme: () => void }): JSX.Element {
  const [graticule, setGraticule] = useState<boolean>(true);
  const style = RStyle.useRStyle();
  const mapRef = useRef<RMap>(null);
  const [view, setView] = React.useState<RView>({ center: center, zoom: 11 });

  const toggleGraticule = useCallback(() => {
    setGraticule((prevGraticule) => !prevGraticule);
  }, []);

  const calculateCircleRadius = (radius: number, resolution: number) => {
    return radius / resolution;
  };

  return (
    <Paper className="mapWrapper" style={{ position: "relative" }}>
      <RStyle.RStyle ref={style}>
        <RStyle.RStroke color={graticule ? "black" : "transparent"} width={1.5} />
      </RStyle.RStyle>
      <RMap
        width={"100%"}
        height={"100%"}
        initial={view} view={[view, setView]}
        ref={mapRef}
        onClick={useCallback(() => {}, [])}
      >
        <RLayerTileWebGL url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />
        <RLayerVector zIndex={10}>
          {noKillZones.map((zone, index) => (
            <RFeature key={index} geometry={new Point(fromLonLat([zone.longitude, zone.latitude]))}>
              <RStyle.RStyle>
                <RStyle.RCircle radius={calculateCircleRadius(zone.radius, view.resolution)}>
                  <RStyle.RFill color="red" />
                </RStyle.RCircle>
              </RStyle.RStyle>
            </RFeature>
          ))}
        </RLayerVector>

        <RLayerGraticule visible={graticule} strokeStyle={style} />
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
      <AlertBar graticule={graticule} toggleGraticule={toggleGraticule} toggleTheme={toggleTheme} />
    </Paper>
  );
}
