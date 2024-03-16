import { IsEnemyDrone } from "./components/IsEnemyDrone";
// Color code for the drone
// 0 -> friendly (even)
// 1 -> enemy (odd)

const friendly = "hsl(272, 61%, 34%)"; // Purple
const enemy = "hsl(62, 100%, 50%)"; // Yellow

export function selectColor(colorNum: number, invert = false) {
  return IsEnemyDrone(colorNum) ? enemy : friendly;
}
