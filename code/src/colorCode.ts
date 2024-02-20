const MAX_COLORS = 20;

export function selectColor(colorNum: number, invert = false) {
  return (
    "hsl(" +
    ((colorNum * (360 / MAX_COLORS) + (invert ? 180 : 0)) % 360) +
    ",100%,50%)"
  );
}
