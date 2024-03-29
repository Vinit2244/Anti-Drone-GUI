import * as React from 'react';
import Box from '@mui/material/Box';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HeightIcon from '@mui/icons-material/Height';
import CompressIcon from '@mui/icons-material/Compress';
import ShareLocationIcon from '@mui/icons-material/ShareLocation';
import TerrainIcon from '@mui/icons-material/Terrain';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import WysiwygIcon from '@mui/icons-material/Wysiwyg';
import FenceIcon from '@mui/icons-material/Fence';
import SettingsRemoteIcon from '@mui/icons-material/SettingsRemote';
import CropRotateIcon from '@mui/icons-material/CropRotate';
import ExploreIcon from '@mui/icons-material/Explore';
import DoneIcon from '@mui/icons-material/Done';
import GyroscopeIcon from "../assets/gyroscope.png"
import AccelerometerIcon from "../assets/accelerometer.png"
import AltitudeStabilizationIcon from "../assets/altitude-indicator.png"
import YawIcon from "../assets/yaw.png"
import XYIcon from "../assets/xy.png"
import MotorIcon from "../assets/motor.png"
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import XYZAxisIcon from '../assets/xyzAxis.png'
import ProximityIcon from '../assets/proximity.png'

type Anchor = 'left';

export default function SwipeableReadyDrawer() {
    const [state, setState] = React.useState({
        left: false,
    });

    const toggleDrawer =
        (anchor: Anchor, open: boolean) =>
            (event: React.KeyboardEvent | React.MouseEvent) => {
                if (
                    event &&
                    event.type === 'keydown' &&
                    ((event as React.KeyboardEvent).key === 'Tab' ||
                        (event as React.KeyboardEvent).key === 'Shift')
                ) {
                    return;
                }

                setState({ ...state, [anchor]: open });
            };
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

    const list = (anchor: Anchor) => (
        <Box
            sx={{ width: 250 }}
            role="presentation"
            onClick={toggleDrawer(anchor, false)}
            onKeyDown={toggleDrawer(anchor, false)}
        >
            <List>
                {['Pre-Arm Check', 'Gyro', 'Accelerometer', 'Magnetometer', 'Absolute Pressure', 'GPS', 'Angular Rate Control', 'Altitude Stabilization', 'Yaw Position', 'Z Altitude Control', 'X/Y Position Control', 'Motor Outputs/Control', 'RC Receiver', 'AHRS', 'Terrain', 'Battery', 'Propulsion', 'GeoFence', 'Logging', 'Proximity'].map((text, index) => (
                    <ListItem key={text} disablePadding>
                        <ListItemButton>
                            <ListItemIcon>
                                {iconList[index]}
                            </ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <div>
            {(['left'] as const).map((anchor) => (
                <React.Fragment key={anchor}>
                    <Button variant="contained" color="warning" onClick={toggleDrawer(anchor, true)}>Ready</Button>
                    <SwipeableDrawer
                        anchor={anchor}
                        open={state[anchor]}
                        onClose={toggleDrawer(anchor, false)}
                        onOpen={toggleDrawer(anchor, true)}
                    >
                        {list(anchor)}
                    </SwipeableDrawer>
                </React.Fragment>
            ))}
        </div>
    );
}