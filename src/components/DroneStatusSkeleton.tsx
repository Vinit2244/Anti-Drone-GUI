import Chip from "@mui/material/Chip";

export function DroneStatusSkeleton({ label }: { label: string }) {
  return (
    <Chip
      sx={{ height: "110px", width: "90%", margin: "auto" }}
      disabled
      variant="outlined"
      label={label}
    />
  );
}
