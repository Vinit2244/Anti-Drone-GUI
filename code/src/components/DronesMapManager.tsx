import { RefObject, useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { PositionUpdatePayload } from "../types/payloads";
import { DroneMap } from "./DroneMap";
import { RMap } from "rlayers";
import { NoKillZone } from "../types/payloads";
import distanceLegendImg from "../assets/distance_legend.png";

function magnitude(x: number, y: number) {
  return Math.sqrt(x * x + y * y);
}

function calculateDistance(point1: number[], point2: number[]) {
  const [lat1, lon1] = point1;
  const [lat2, lon2] = point2;

  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // in metres
  return distance;
}

export function DronesMapManager({
  mapRef,
  noKillZones,
}: {
  mapRef: RefObject<RMap>;
  noKillZones: NoKillZone[];
}) {
  // const [drones, setDrones] = useState([
  //   {
  //     id: "2", // Rogue
  //     initialLonLat: [78.343434, 17.453434],
  //     initialVelocity: { speed: 0, angle: 0 },
  //     initialAltitude: 100,
  //     initialVz: 0,
  //   },
  //   {
  //     id: "7", // Friendly
  //     initialLonLat: [78.353434, 17.463434],
  //     initialVelocity: { speed: 0, angle: 0 },
  //     initialAltitude: 0,
  //     initialVz: 0,
  //   },
  // ]);

  const [drones, setDrones] = useState(
    [] as {
      id: string;
      initialLonLat: [number, number];
      initialVelocity: { speed: number; angle: number };
      initialVz: number;
      initialAltitude: number;
    }[]
  );
  // const [drones, setDrones] = useState<
  //   {
  //     id: string;
  //     initialLonLat: number[];
  //     initialVelocity: { speed: number; angle: number };
  //     initialAltitude: number;
  //     initialVz: number;
  //   }[]
  // >([]);

  console.log(drones.length);
  useEffect(() => {
    // Calculate and log distance between drones if there are exactly 2 drones
    console.log("Checking number of drones:", drones.length);
    if (drones.length === 2) {
      console.log("Calculating distance between drones:", drones);
      const distance = calculateDistance(
        drones[0].initialLonLat,
        drones[1].initialLonLat
      );
      console.log(
        `Distance between drones ${drones[0].id} and ${drones[1].id}: ${distance} meters`
      );
    } else {
      console.log("Number of drones is not 2:", drones.length);
    }
  }, [drones]);

  useEffect(() => {
    const promise = listen("position_update", (event) => {
      const payload = event.payload as PositionUpdatePayload;
      const id = payload.system_id;
      const info = payload.payload;
      setDrones((prevDrones) => {
        if (prevDrones.find((drone) => drone.id === id) === undefined)
          return [
            ...prevDrones,
            {
              id,
              initialLonLat: [info.lon / 10000000, info.lat / 10000000],
              initialVelocity: {
                speed: magnitude(info.vx, info.vy),
                angle: 2 * Math.PI - Math.atan2(info.vy, info.vx),
              },
              initialAltitude: info.relative_alt / 1000, // in meters
              initialVz: info.vz / 100, // in meters/second
            },
          ];
        return prevDrones;
      });
    });

    return () => {
      promise.then((remove) => remove());
    };
  }, []);

  function Legend({
    drones,
  }: {
    drones: {
      id: string;
      initialLonLat: number[];
      initialVelocity: { speed: number; angle: number };
      initialAltitude: number;
      initialVz: number;
    }[];
  }) {
    // Calculate and display distance between drones
    if (drones.length === 2) {
      const distance = calculateDistance(
        drones[0].initialLonLat,
        drones[1].initialLonLat
      );
      const roundedDistance = distance.toFixed(2);

      return (
        <div
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            zIndex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            padding: 10,
            boxSizing: "content-box",
            borderRadius: 5,
            color: "white",
            textAlign: "center",
            wordWrap: "break-word",
          }}>
          <img
            src={distanceLegendImg}
            alt="Distance Legend"
            style={{ marginBottom: 5, inlineSize: 60 }}
          />
          <p style={{ margin: 0 }}>{roundedDistance} m</p>
        </div>
      );
    } else {
      return null;
    }
  }

  return (
    <>
      {drones.map((drone) => (
        <DroneMap
          key={drone.id}
          id={drone.id}
          initialLonLat={[drone.initialLonLat[0], drone.initialLonLat[1]]}
          initialVelocity={drone.initialVelocity}
          initialAltitude={drone.initialAltitude}
          initialVz={drone.initialVz}
          mapRef={mapRef}
          noKillZones={noKillZones}
        />
      ))}
      <Legend drones={drones} />
    </>
  );
}
