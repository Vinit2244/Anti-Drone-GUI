import {
    Box,
    Chip,
    Stack,
    Typography,
} from "@mui/material";
import DroneAmmunitionIndicator from "./DroneAmmunitionIndicator"

export function AmmunitionStatus({ id }: { id: string }) {
    // Example Id counts list
    const idCounts = [
        { id: 'ammo1', count: "10" },
        { id: 'ammo2', count: "5" },
        { id: 'ammo3', count: "20" },
        // Add more items as needed
    ];
    return (
        <>
            <Chip
                sx={{height:idCounts.length*55, width: "90%", margin: "auto" }}
                color={"success"}
                // disabled={!connected}
                variant="outlined"
                label={
                    <Stack>
                        <Typography
                        textAlign={"center"}
                        >
                            Ammunition Status
                        </Typography>
                        <Box height={10}></Box>
                        <Stack
                            direction="column"
                            gap={1}
                        >
                            {idCounts.map(({ id, count }) => (
                                <DroneAmmunitionIndicator id={id} count={count} />
                            ))}
                        </Stack>
                    </Stack>
                }
            />
        </>
    );
}
