import { useCallback, useEffect, useRef, useState } from "react";
import { Paper } from "@mui/material";
import { NoKillZone } from "../types/payloads";
import "ol/ol.css";
import { invoke } from "@tauri-apps/api";
import {
  RMap,
  RLayerTileWebGL,
  RLayerVector,
  RLayerGraticule,
  RControl,
  RStyle,
  RFeature,
} from "rlayers";
import { RView } from "rlayers/RMap";
import { fromLonLat, getPointResolution } from "ol/proj";
import Point from "ol/geom/Point";
import { OnlyConnected } from "./Only";
import { DronesMapManager } from "./DronesMapManager";
import { FODMapManager } from "./FODMapManager";
import { DateTimeDisplay } from "./DateTimeDisplay";
import AlertBar from "./AlertBar";
import "./Map.css";

const centerPoint = [78.34694,17.44635] as [number, number]; // [Longitude, Latitude]
const center = fromLonLat(centerPoint);

export default function Simple({
  toggleTheme,
  cName,
  toggleFullScreenMap,
}: {
  toggleTheme: () => void;
  cName: string;
  toggleFullScreenMap: () => void;
}): JSX.Element {
  const [graticule, setGraticule] = useState<boolean>(true);
  const style = RStyle.useRStyle();

  const [noKillZones, setNoKillZones] = useState<NoKillZone[]>([]);
  const mapRef = useRef(null);

  useEffect(() => {
    fetchNoKillZones();
  }, []);

  const fetchNoKillZones = async () => {
    try {
      console.log("fetching");
      const newNoKillZones = (await invoke(
        "get_no_kill_zones"
      )) as NoKillZone[];
      setNoKillZones(newNoKillZones);
      console.log(newNoKillZones);
    } catch (error) {
      console.error("Error fetching no-kill zones:", error);
    }
  };

  const resolution = getPointResolution("EPSG:3857", 1, center);
  const initialZoom = Math.round(Math.log2(156543.03392 / resolution));
  const [view, setView] = useState<RView>({
    center: center,
    zoom: initialZoom,
  });

  const toggleGraticule = useCallback(() => {
    setGraticule((prevGraticule) => !prevGraticule);
  }, []);

  const calculateCircleRadius = (radius: number, resolution: number) => {
    return radius / resolution;
  };

  return (
    <Paper className={cName} style={{ position: "relative" }}>
      <RStyle.RStyle ref={style}>
        <RStyle.RStroke
          color={graticule ? "black" : "transparent"}
          width={1.5}
        />
      </RStyle.RStyle>
      <RMap
        width={"100%"}
        height={"100%"}
        initial={view}
        view={[view, setView]}
        ref={mapRef}
        onClick={useCallback(() => { }, [])}>
        <RLayerTileWebGL url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />
        <RLayerVector zIndex={10}>
          {noKillZones.map((zone, index) => (
            <RFeature
              key={index}
              geometry={new Point(fromLonLat([zone.longitude, zone.latitude]))}>
              <RStyle.RStyle>
                <RStyle.RCircle
                  radius={calculateCircleRadius(
                    zone.radius,
                    view?.resolution || 0
                  )}>
                  <RStyle.RStroke color="#8B0000" width={2} />
                  <RStyle.RFill color="rgba(255, 153, 153, 0.5)" />
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
          <DronesMapManager mapRef={mapRef} noKillZones={noKillZones} />
        </OnlyConnected>
        <FODMapManager />
      </RMap>
      <AlertBar
        toggleGraticule={toggleGraticule}
        toggleTheme={toggleTheme}
        toggleFullScreenMap={toggleFullScreenMap}
      />
    </Paper>
  );
}
