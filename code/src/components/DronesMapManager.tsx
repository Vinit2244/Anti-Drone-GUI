/**
 * Component handling all drones placement on map
 */

import { RefObject, useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { PositionUpdatePayload } from "../types/payloads";
import { DroneMap } from "./DroneMap";
import { RMap } from "rlayers";
import { NoKillZone } from "./IsNotInNoKillZone";

function magnitude(x: number, y: number) {
  return Math.sqrt(x * x + y * y);
}

export function DronesMapManager({
  mapRef,
  noKillZones,
}: {
  mapRef: RefObject<RMap>;
  noKillZones: NoKillZone[];
}) {
  /**
   * Component handling all drones placement on map
   */
  
  // const [drones, setDrones] = useState(
  //   [] as {
  //     id: string;
  //     initialLonLat: [number, number];
  //     initialVelocity: { speed: number; angle: number };
  //     initialVz: number;
  //     initialAltitude: number;
  //   }[]
  // );

  const hardcodedDrones = [
    {
      id: "1",
      initialLonLat: [78.34, 17.45], 
      initialVelocity: { speed: 0, angle: 0 }, 
      initialAltitude: 100, 
      initialVz: 0, 
    },
    // {
    //   id: "3",
    //   initialLonLat: [78.35, 17.46], 
    //   initialVelocity: { speed: 0, angle: 0 }, 
    //   initialAltitude: 0, 
    //   initialVz: 0, 
    // },
  ];

  const [drones, setDrones] = useState(hardcodedDrones);

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

  return (
    <>
      {drones.map((drone) => (
        <DroneMap
          key={drone.id}
          id={drone.id}
          initialLonLat={drone.initialLonLat}
          initialVelocity={drone.initialVelocity}
          initialAltitude={drone.initialAltitude}
          initialVz={drone.initialVz}
          mapRef={mapRef}
          noKillZones={noKillZones}
        />
      ))}
    </>
  );
}
