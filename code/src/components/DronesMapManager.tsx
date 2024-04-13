/**
 * Component handling all drones placement on map
 */

import { RefObject, useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { PositionUpdatePayload } from "../types/payloads";
import { DroneMap } from "./DroneMap";
import {RogueDroneMap } from "./RogueDroneMap";
import { RMap } from "rlayers";
// import { NoKillZone } from "./IsNotInNoKillZone";
import { NoKillZone } from "../types/payloads";
import { IsEnemyDrone } from "./IsEnemyDrone";

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

  const [drones, setDrones] = useState(
    [] as {
      id: string;
      initialLonLat: [number, number];
      initialVelocity: { speed: number; angle: number };
      initialVz: number;
      initialAltitude: number;
    }[]
  );

  // const hardcodedDrones = [
  //   {
  //     id: "1",  // Rogue
  //     initialLonLat: [78.34, 17.45],
  //     initialVelocity: { speed: 0, angle: 0 },
  //     initialAltitude: 100,
  //     initialVz: 0,
  //   },
  //   {
  //     id: "2",  // Friendly
  //     initialLonLat: [78.35, 17.46],
  //     initialVelocity: { speed: 0, angle: 0 },
  //     initialAltitude: 0,
  //     initialVz: 0,
  //   },
  // ];

  // const [drones, setDrones] = useState(hardcodedDrones);

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

  /*
   * Get list of friendly drones
   */
  const friendlyDroneIDs = drones.filter(
    (drone) => !IsEnemyDrone(+drone.id) && +drone.id != 255
  );

  /*
   * Get list of rogue drones
   */
  const rogueDroneIDs = drones.filter(
    (drone) => IsEnemyDrone(+drone.id) && +drone.id != 255
  );

  return (
    <>
      {/* {drones.map((drone) => (
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
      ))} */}
      <DroneMap
          key={drones[0].id}
          id={drones[0].id}
          initialLonLat={[drones[0].initialLonLat[0], drones[0].initialLonLat[1]]}
          initialVelocity={drones[0].initialVelocity}
          initialAltitude={drones[0].initialAltitude}
          initialVz={drones[0].initialVz}
          mapRef={mapRef}
          noKillZones={noKillZones}
        />

        <RogueDroneMap
          key={drones[1].id}
          id={drones[1].id}
          initialLonLat={[drones[1].initialLonLat[0], drones[1].initialLonLat[1]]}
          initialVelocity={drones[1].initialVelocity}
          initialAltitude={drones[1].initialAltitude}
          initialVz={drones[1].initialVz}
          mapRef={mapRef}
          // noKillZones={noKillZones}
        />
    </>
  );
}
