import {
    Box,
    Chip,
    Stack,
    Typography,
} from "@mui/material";
import DroneAmmunitionIndicator from "./DroneAmmunitionIndicator"
import { useContext, useState } from "react";
import { useSelector } from "@xstate/react";
import { MapControlContext } from "../contexts/MapControlContext";

export function AmmunitionStatus({ id }: { id: string }) {
    // Example Id counts list (hard coded)
    const idCounts = [
        { id: 'ammo1', count: "10" },
        { id: 'ammo2', count: "5" },
        { id: 'ammo3', count: "20" },
        // Add more items as needed
    ];

    const [connected, setConnected] = useState(true);
    const [alerts, setAlerts] = useState([] as string[]);
    const [mode, setMode] = useState(100);
    const [state, setState] = useState("Unknown");
    const [landedState, setLandedState] = useState(
        undefined as undefined | string
    );
    const addAlert = (alert: string) => {
        setAlerts((newAlerts) => {
            console.log(newAlerts);
            return [alert, ...newAlerts];
        });
    };
    const setTimeoutHandler = useState<NodeJS.Timeout | undefined>(undefined)[1];

    const { mapControlService } = useContext(MapControlContext);
    const { send: mapControlSend } = mapControlService;
    const mapSelected = useSelector(
        mapControlService,
        (state) =>
            state.matches("Drone Selected") && state.context.selectedID === id
    );

    const [statusModalOpen, setStatusModalOpen] = useState(false);

    return (
        <>
            <Chip
                sx={{ height: idCounts.length * 55, width: "90%", margin: "auto" }}
                color={"success"}
                disabled={!connected}
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
