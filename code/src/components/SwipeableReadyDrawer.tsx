import * as React from "react";
import { listen } from "@tauri-apps/api/event";
import Box from "@mui/material/Box";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import HeightIcon from "@mui/icons-material/Height";
import CompressIcon from "@mui/icons-material/Compress";
import ShareLocationIcon from "@mui/icons-material/ShareLocation";
import TerrainIcon from "@mui/icons-material/Terrain";
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import WysiwygIcon from "@mui/icons-material/Wysiwyg";
import FenceIcon from "@mui/icons-material/Fence";
import SettingsRemoteIcon from "@mui/icons-material/SettingsRemote";
import CropRotateIcon from "@mui/icons-material/CropRotate";
import ExploreIcon from "@mui/icons-material/Explore";
import DoneIcon from "@mui/icons-material/Done";
import GyroscopeIcon from "../assets/gyroscope.png";
import AccelerometerIcon from "../assets/accelerometer.png";
import AltitudeStabilizationIcon from "../assets/altitude-indicator.png";
import YawIcon from "../assets/yaw.png";
import XYIcon from "../assets/xy.png";
import MotorIcon from "../assets/motor.png";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import XYZAxisIcon from "../assets/xyzAxis.png";
import ProximityIcon from "../assets/proximity.png";
import { SystemStatusPayload } from "../types/payloads";
import { IsEnemyDrone } from "./IsEnemyDrone";

type Anchor = "left";

export default function SwipeableReadyDrawer({ id }: { id: string }) {
    const [state, setState] = React.useState({
        left: false,
    });

    const toggleDrawer =
        (anchor: Anchor, open: boolean) =>
            (event: React.KeyboardEvent | React.MouseEvent) => {
                if (
                    event &&
                    event.type === "keydown" &&
                    ((event as React.KeyboardEvent).key === "Tab" ||
                        (event as React.KeyboardEvent).key === "Shift")
                ) {
                    return;
                }

                setState({ ...state, [anchor]: open });
            };

    // States of all the ready options
    const [readyButtonStates, setReadyButtonStates] = React.useState({
        "Pre-Arm Check": "warning",
        "Gyro": "warning",
        "Accelerometer": "warning",
        "Magnetometer": "warning",
        "Absolute Pressure": "warning",
        "GPS": "warning",
        "Angular Rate Control": "warning",
        "Altitude Stabilization": "warning",
        "Yaw Position": "warning",
        "Z Altitude Control": "warning",
        "X/Y Position Control": "warning",
        "Motor Outputs/Control": "warning",
        "RC Receiver": "warning",
        "AHRS": "warning",
        "Terrain": "warning",
        "Battery": "warning",
        "Propulsion": "warning",
        "GeoFence": "warning",
        "Logging": "warning",
        "Proximity": "warning",
    });

    React.useEffect(() => {
        const promise = listen(`pre_arm_check_status_ok`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "Pre-Arm Check": "success",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`pre_arm_check_status_error`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "Pre-Arm Check": "error",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`gyroscope_status_ok`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "Gyro": "success",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`gyroscope_status_error`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "Gyro": "error",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`accelerometer_status_ok`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "Accelerometer": "success",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`accelerometer_status_error`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "Accelerometer": "error",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`magnetometer_status_ok`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "Magnetometer": "success",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`magnetometer_status_error`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "Magnetometer": "error",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`absolute_pressure_status_ok`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "Absolute Pressure": "success",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`absolute_pressure_status_error`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "Absolute Pressure": "error",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`gps_ok`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "GPS": "success",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`gps_error`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "GPS": "error",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`angular_rate_control_status_ok`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "Angular Rate Control": "success",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`angular_rate_control_status_error`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "Angular Rate Control": "error",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`altitude_stabilization_status_ok`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "Altitude Stabilization": "success",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`altitude_stabilization_status_error`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "Altitude Stabilization": "error",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`yaw_position_status_ok`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "Yaw Position": "success",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`yaw_position_status_error`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "Yaw Position": "error",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`z_altitude_control_status_ok`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "Z Altitude Control": "success",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`z_altitude_control_status_error`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "Z Altitude Control": "error",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`xy_position_control_status_ok`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "X/Y Position Control": "success",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`xy_position_control_status_error`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "X/Y Position Control": "error",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`motor_output_status_ok`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "Motor Outputs/Control": "success",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`motor_output_status_error`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "Motor Outputs/Control": "error",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`rc_receiver_status_ok`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "RC Receiver": "success",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`rc_receiver_status_error`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "RC Receiver": "error",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`ahrs_status_ok`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "AHRS": "success",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`ahrs_status_error`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "AHRS": "error",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`terrain_status_ok`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "Terrain": "success",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`terrain_status_error`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "Terrain": "error",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`battery_status_ok`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "Battery": "success",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`battery_status_error`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "Battery": "error",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`propulsion_status_ok`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "Propulsion": "success",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`propulsion_status_error`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "Propulsion": "error",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`geofence_status_ok`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "GeoFence": "success",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`geofence_status_error`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "GeoFence": "error",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`logging_status_ok`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "Logging": "success",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`logging_status_error`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "Logging": "error",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`proximity_status_ok`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "Proximity": "success",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    React.useEffect(() => {
        const promise = listen(`proximity_status_error`, (event) => {
            const payload = event.payload as SystemStatusPayload;
            if (payload.system_id != "255") { // Here instead of != 255 check that the drone should be friendly drone
                setReadyButtonStates((prevState) => ({
                    ...prevState,
                    "Proximity": "error",
                }));
            }
        });
        return () => {
            promise.then((remove) => remove());
        };
    }, []);

    const iconList = [
        <DoneIcon />, // For 'Pre-Arm Check'
        <img src={GyroscopeIcon} height={24} />, // For 'Gyro'
        <img src={AccelerometerIcon} height={24} />, // For 'Accelerometer'
        <ExploreIcon />, // For 'Magnetometer'
        <CompressIcon />, // For 'Absolute Pressure'
        <ShareLocationIcon />, // For 'GPS'
        <CropRotateIcon />, // For 'Angular Rate Control'
        <img src={AltitudeStabilizationIcon} height={24} />, // For 'Altitude Stabilization'
        <img src={YawIcon} height={24} />, // For 'Yaw Position'
        <HeightIcon />, // For 'Z Altitude Control'
        <img src={XYIcon} height={24} />, // For 'X/Y Position Control'
        <img src={MotorIcon} height={24} />, // For 'Motor Outputs/Control'
        <SettingsRemoteIcon />, // For 'RC Receiver'
        <img src={XYZAxisIcon} height={24} />, // For 'AHRS'
        <TerrainIcon />, // For 'Terrain'
        <BatteryChargingFullIcon />, // For 'Battery'
        <RocketLaunchIcon />, // For 'Propulsion'
        <FenceIcon />, // For 'GeoFence'
        <WysiwygIcon />, // For 'Logging'
        <img src={ProximityIcon} height={24} />, // For 'Proximity'
    ];

    const getButtonStyle = (state: string) => {
        let baseStyle;
        switch (state) {
            case "warning":
                baseStyle = {
                    border: "1px solid #ffa500",
                    borderRadius: "8px",
                    margin: "2px",
                    backgroundColor: "rgba(255, 165, 0, 0.15)",
                };
                break;
            case "success":
                baseStyle = {
                    border: "1px solid #008001",
                    borderRadius: "8px",
                    margin: "2px",
                    backgroundColor: "rgba(0, 128, 1, 0.15)",
                };
                break;
            case "error":
                baseStyle = {
                    border: "1px solid #ff0000",
                    borderRadius: "8px",
                    margin: "2px",
                    backgroundColor: "rgba(255, 0, 0, 0.15)",
                };
                break;
            default:
                baseStyle = {
                    border: "1px solid #ffffff",
                    borderRadius: "8px",
                    margin: "2px",
                    backgroundColor: "rgba(255, 0, 0, 0.15)",
                };
        }

        let hoverStyle;
        switch (state) {
            case "warning":
                hoverStyle = {
                    "&:hover": {
                        backgroundColor: "rgba(255, 165, 0, 0.15)",
                    },
                };
                break;
            case "success":
                hoverStyle = {
                    "&:hover": {
                        backgroundColor: "rgba(0, 128, 1, 0.15)",
                    },
                };
                break;
            case "error":
                hoverStyle = {
                    "&:hover": {
                        backgroundColor: "rgba(255, 0, 0, 0.15)",
                    },
                };
                break;
            default:
                hoverStyle = {};
        }

        return { ...baseStyle, ...hoverStyle };
    };

    const list = (anchor: Anchor) => (
        <Box sx={{ width: 250 }} role="presentation">
            <List sx={{ backgroundColor: "black" }}>
                {Object.entries(readyButtonStates).map(([component, state], index) => (
                    <ListItem key={component} disablePadding>
                        <ListItemButton sx={getButtonStyle(state)} disableTouchRipple>
                            <ListItemIcon>{iconList[index]}</ListItemIcon>
                            <ListItemText primary={component} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <div>
            {(["left"] as const).map((anchor) => (
                <React.Fragment key={anchor}>
                    <Button
                        variant="contained"
                        color="warning"
                        onClick={toggleDrawer(anchor, true)}>
                        Ready
                    </Button>
                    <SwipeableDrawer
                        anchor={anchor}
                        open={state[anchor]}
                        onClose={toggleDrawer(anchor, false)}
                        onOpen={toggleDrawer(anchor, true)}>
                        {list(anchor)}
                    </SwipeableDrawer>
                </React.Fragment>
            ))}
        </div>
    );
}