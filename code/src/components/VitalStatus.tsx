import {
  Box,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import DronePortIndicator from "./DronePortIndicator";
import DroneGroundRadarStrengthIndicator from "./DroneGroundRadarStrengthIndicator"

export function VitalStatus({ id }: { id: string }) {
  return (
    <>
      <Chip
        sx={{ height: "130px", width: "90%", margin: "auto" }}
        color={"success"}
        // disabled={!connected}
        variant="outlined"
        label={
          <Stack>
              <Typography
                textAlign="center"
                width="85%"
                margin="auto"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                Vital Status
              </Typography>
              <Box height={10}></Box>
            <Stack
              direction="row"
              gap={1}
              alignItems="center"
              justifyContent="space-evenly"
            >
              <DronePortIndicator id={id}/>
              <DroneGroundRadarStrengthIndicator id={id}/>
            </Stack>
          </Stack>
        }
      />
    </>
  );
}
