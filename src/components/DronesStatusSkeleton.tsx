import { Button, IconButton, Stack } from "@mui/material";
import { DroneStatusSkeleton } from "./DroneStatusSkeleton";
import RefreshIcon from "@mui/icons-material/Refresh";

export function DronesStatusSkeleton() {
  return (
    <Stack gap={2} width="100%">
      <Stack
        direction="row"
        justifyContent="space-between"
        width="90%"
        margin="auto"
        paddingTop="15px"
      >
        <Button variant="outlined" color="primary" disabled>
          Select All
        </Button>
        <IconButton disabled>
          <RefreshIcon />
        </IconButton>
        <Button variant="outlined" color="secondary" disabled>
          Deselect All
        </Button>
      </Stack>
      <Stack
        gap={2}
        width="100%"
        overflow="scroll"
        paddingBottom="5px"
      >
        {Array.from({ length: 5 }, (e, i) => (
          <DroneStatusSkeleton
            label="Connect Telemetry for Drone Info"
            key={i.toString()}
          />
        ))}
      </Stack>
    </Stack>
  );
}
