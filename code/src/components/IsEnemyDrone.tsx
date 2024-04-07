export function IsEnemyDrone(drone_id: number) {
  //   Function to select differentiate between friendly and enemy drones
  //   The function takes in the drone id
  //   Returns 0 if the drone is friendly and 1 if the drone is an enemy
  if (drone_id % 2 === 1) {
    //   If the drone id is even, it is a friendly drone
    return 0;
  } else {
    // If the drone id is odd, it is an enemy drone
    return 1;
  }
}
