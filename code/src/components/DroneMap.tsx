import { LineString, Point } from "ol/geom";
import { getLength } from "ol/sphere";
import { fromLonLat } from "ol/proj";
import {
  useState,
  RefObject,
  useMemo,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import {
  RLayerVector,
  RFeature,
  RStyle,
  RenderEvent,
  ROverlay,
  RMap,
  RPopup,
  RLayerCluster,
} from "rlayers";
import droneIcon from "../assets/mapDrone.svg";
import selectedDroneIcon from "../assets/targetedDrone.svg";
import { useRStyle } from "rlayers/style";
import { getVectorContext } from "ol/render";
import { listen } from "@tauri-apps/api/event";
import { PositionUpdatePayload } from "../types/payloads";
import { selectColor } from "../colorCode";
import { MapControlContext } from "../contexts/MapControlContext";
import { useSelector } from "@xstate/react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

function magnitude(x: number, y: number) {
  return Math.sqrt(x * x + y * y);
}

function distance(
  lonLat1: [number, number],
  lonLat2: [number, number]
): number {
  const line = new LineString([fromLonLat(lonLat1), fromLonLat(lonLat2)]);
  return line.getLength();
}

const MIN_PATH_TRAIL_DISTANCE: number = 10;
const TEN_MINUTES_IN_MS = 1 * 60 * 1000;

function getColorBasedOnAltitude(altitude: number): string {
  // You can modify this logic based on your requirements
  const MAX_ALTITUDE = 200; // You can adjust this value based on your altitude range

  // Normalize altitude to a value between 0 and 1
  const normalizedAltitude = altitude / MAX_ALTITUDE;

  // Interpolate between red (low altitude) and green (high altitude)
  const red = Math.round((1 - normalizedAltitude) * 255);
  const green = Math.round(normalizedAltitude * 255);

  return `rgb(${red}, ${green}, 0)`;
}

export function DroneMap({
  id,
  initialLonLat,
  initialVelocity,
  initialVz,
  initialAltitude,
  mapRef,
}: {
  id: string;
  initialLonLat: [number, number];
  initialVelocity: { speed: number; angle: number };
  initialVz: number;
  initialAltitude: number;
  mapRef: RefObject<RMap>;
}) {
  const [lonLat, setLonLat] = useState(initialLonLat);
  const [velocity, setVelocity] = useState(initialVelocity);
  const [velocityZ, setVelocityZ] = useState(initialVz);
  const [altitude, setAltitude] = useState(initialAltitude);
  const { displacementx, displacementy } = useMemo(() => {
    const length = (velocity?.speed ?? 0) / 50;
    const angle = velocity?.angle ?? 0;
    const displacementx = length * Math.cos(angle);
    const displacementy = length * Math.sin(angle);
    return { displacementx, displacementy };
  }, [velocity]);
  const velocityLineStyle = useRStyle();

  const { mapControlService } = useContext(MapControlContext);
  const { send } = mapControlService;
  const isSelected = useSelector(
    mapControlService,
    (state) =>
      state.matches("Drone Selected") && state.context.selectedID === id
  );

  const [trailPoints, setTrailPoints] = useState<
    { lonLat: [number, number]; timestamp: number; color: string }[]
  >([]);

  useEffect(() => {
    const promise = listen(`position_update_${id}`, (event) => {
      const payload = event.payload as PositionUpdatePayload;
      const info = payload.payload;
      const lon = info.lon / 10000000;
      const lat = info.lat / 10000000;
      const newAlt = info.relative_alt / 1000;

      if (mapRef.current) {
        mapRef.current.ol.getView().setCenter(fromLonLat([lon, lat]));
      }

      if (lonLat[0] !== lon || lonLat[1] !== lat) setLonLat([lon, lat]);
      const speed = magnitude(info.vx, info.vy);
      const angle = 2 * Math.PI - Math.atan2(info.vy, info.vx);
      const lastTrailPoint =
        trailPoints.length > 0
          ? trailPoints[trailPoints.length - 1].lonLat
          : initialLonLat;

      const currentTime = info.time_boot_ms;

      const altitudeColor = getColorBasedOnAltitude(newAlt);
      if (distance(lastTrailPoint, [lon, lat]) > MIN_PATH_TRAIL_DISTANCE) {
        setTrailPoints(
          (prevTrailPoints) =>
            [
              ...prevTrailPoints,
              {
                lonLat: [lon, lat],
                timestamp: currentTime,
                color: altitudeColor,
              },
            ] as {
              lonLat: [number, number];
              timestamp: number;
              color: string;
            }[]
        );
      }

      if (speed !== velocity.speed || angle !== velocity.angle)
        setVelocity({
          speed,
          angle,
        });
      if (altitude !== newAlt) setAltitude(newAlt);
      const newVz = info.vz / 100;
      if (velocityZ !== newVz) setVelocityZ(newVz);
    });

    return () => {
      promise.then((remove) => remove());
    };
  }, []);

  const color_of_drone = useMemo(() => selectColor(+id, false), [id]);
  const point = useMemo(() => new Point(fromLonLat(lonLat)), [lonLat]);
  const selectedStyle = useRStyle();
  const deselectedStyle = useRStyle();
  const popupRef = useRef<RPopup>(null);
  useEffect(() => {
    if (isSelected) popupRef.current?.show();
    else popupRef.current?.hide();
  }, [isSelected]);
  return (
    <>
      <RStyle.RStyle ref={deselectedStyle} zIndex={3}>
        <RStyle.RIcon
          src={droneIcon}
          color={color_of_drone}
          anchor={[0.5, 0.5]}
          scale={1.2}
        />
      </RStyle.RStyle>
      <RStyle.RStyle ref={selectedStyle} zIndex={3}>
        <RStyle.RIcon
          src={selectedDroneIcon}
          color={color_of_drone}
          anchor={[0.5, 0.5]}
          scale={1}
        />
      </RStyle.RStyle>
      <RStyle.RStyle ref={velocityLineStyle}>
        <RStyle.RStroke color="black" width={2} />
      </RStyle.RStyle>
      <RLayerVector
        style={isSelected ? selectedStyle : deselectedStyle}
        /* @ts-ignore */
        updateWhileAnimating
        /* @ts-ignore */
        updateWhileInteracting>
        <RFeature
          onClick={useCallback((e: { stopPropagation: () => void }) => {
            e.stopPropagation();
            send({ type: "Select Drone", newSelectedDrone: id });
          }, [])}
          geometry={point}>
          <ROverlay>
            <Paper
              sx={{
                width: 20,
                margin: 0.5,
                height: 20,
                display: "grid",
                placeItems: "center",
                fontSize: "10px",
              }}>
              <Typography
                sx={{ cursor: "pointer" }}
                onClick={() => setTrailPoints([])}>
                {id}
              </Typography>
            </Paper>
          </ROverlay>

          <RPopup autoPan autoPosition ref={popupRef} trigger="click">
            <Paper sx={{ margin: "15px", paddingX: "15px", paddingY: "5px" }}>
              <Typography textAlign="center" variant={"h5"}>
                Details
              </Typography>
              <div>
                <Typography>Altitude: {altitude}m</Typography>
              </div>
              <div>
                <Typography>Velocity Z: {velocityZ}m/sec</Typography>
              </div>
            </Paper>
          </RPopup>
        </RFeature>
      </RLayerVector>
      {useMemo(
        () => (
          <TrailRenderer trailPoints={trailPoints} />
        ),
        [trailPoints]
      )}
    </>
  );
}

function TrailRenderer({
  trailPoints,
}: {
  trailPoints: { lonLat: [number, number]; timestamp: number; color: string }[];
}) {
  return (
    <RLayerCluster distance={15}>
      {trailPoints.map((point, index) => {
        if (trailPoints[trailPoints.length - 1]?.timestamp - point.timestamp < TEN_MINUTES_IN_MS) {
          return (
            <TrailPoint
              key={index}
              lonLat={point.lonLat}
              color_of_point={point.color}
            />
          );
        } else {
          console.log("hi");
          return null;
        }
      })}
    </RLayerCluster>
  );
}

function TrailPoint({
  lonLat,
  color_of_point,
}: {
  lonLat: [number, number];
  color_of_point: string;
  }) {
  return (
    <RStyle.RStyle>
      <RStyle.RCircle radius={5}>
        <RStyle.RFill color={color_of_point} />
      </RStyle.RCircle>
      <RFeature geometry={new Point(fromLonLat(lonLat))} />
    </RStyle.RStyle>
  );
}