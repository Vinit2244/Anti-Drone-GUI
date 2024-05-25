/**
 * Helper function to check if drone is outside no kill zone
 */
import { NoKillZone } from "../types/payloads";

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // in meters
  return distance;
}

export function isNotInNoKillZone(
  // id: number, // Debug
  initialLonLat: [number, number],
  noKillZones: NoKillZone[]
) {
  /**
   * Helper function to check if drone is outside no kill zone
   */
  var droneLongitude = initialLonLat[0];
  var droneLatitude = initialLonLat[1];

  // console.log("init", id, droneLatitude, droneLongitude);

  for (const zone of noKillZones) {
    // console.log("zone", zone);

    var zoneLatitude = zone.latitude;
    var zoneLongitude = zone.longitude;

    // console.log(zoneLatitude, zoneLongitude);

    // const distance =
    //   Math.sqrt(
    //     Math.pow(droneLatitude - zoneLatitude, 2) +
    //       Math.pow(droneLongitude - zoneLongitude, 2)
    //   ) * 10;

    const distance = haversineDistance(
      zone.latitude,
      zone.longitude,
      droneLatitude,
      droneLongitude
    );

    // console.log("id", id, "dist", distance);

    if (distance <= zone.radius) {
      // In Kill Zone
      return 0;
    }
  }
  return 1;
}
